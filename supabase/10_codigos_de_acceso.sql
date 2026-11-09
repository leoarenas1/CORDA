-- CORDA · Ajuste 10: códigos de acceso. Solo entra a una academia quien tiene un código de ella.
-- Antes, la academia salía de lo que la persona elegía al registrarse: cualquiera podía "ponerse" en tu academia.
-- Ahora:
--   · La academia (un coach aprobado) genera un código de un solo uso por persona: rol + nombre + clave de la academia (solo como etiqueta).
--   · Quien se registra escribe su código. La academia, el rol y la aprobación salen del CÓDIGO, no de lo que escriba.
--   · Coach y Tutor no pueden registrarse sin código. El código de Coach solo lo crea el dueño de la academia.
--   · Jugador sin código = entrena de forma independiente: queda sin academia y no ve nada de ninguna.
--   · Un código de Tutor puede ir ligado a un jugador (linked_child): así el tutor se vincula sin que el menor tenga que escribir su correo.
--   · El código se gasta al crear la cuenta; vence a los 30 días y se puede revocar.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- DESPUÉS DE CORRERLO, revisa quién es el dueño de tu academia:
--   select a.name, p.email from public.academies a left join public.profiles p on p.id = a.owner_id;
-- Si no eres tú, corrige con (cambia el correo):
--   update public.academies set owner_id = (select id from public.profiles where email = 'TU_CORREO') where name = 'Mouratoglou Tennis Center Guadalajara';

-- 1. Dueño de la academia y jugador al que está ligado un tutor ------------------------------
alter table public.academies add column if not exists owner_id uuid references auth.users (id) on delete set null;
-- Por defecto: el primer coach aprobado que tiene cada academia.
update public.academies a set owner_id = (
  select p.id from public.profiles p
  where p.academy_id = a.id and p.role = 'Coach' and p.approved
  order by p.created_at limit 1
) where a.owner_id is null;

alter table public.profiles add column if not exists linked_child text;

-- 2. Tabla de códigos (nadie la lee directo; solo las funciones de abajo) -----------------------
create table if not exists public.access_codes (
  id           uuid primary key default gen_random_uuid(),
  academy_id   uuid not null references public.academies (id) on delete cascade,
  code         text not null unique,                     -- sin guion, en mayúsculas
  role         public.corda_role not null,
  label        text not null default '',                 -- nombre de la persona
  member_ref   text not null default '',                 -- clave de la academia (por ejemplo LA01367): solo etiqueta, no es secreta
  child_member text not null default '',                 -- Tutor: memberId del jugador a su cargo (opcional)
  created_by   uuid default auth.uid() references auth.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz not null default now() + interval '30 days',
  revoked      boolean not null default false,
  used_by      uuid references auth.users (id) on delete set null,
  used_at      timestamptz
);
alter table public.access_codes enable row level security;
revoke all on public.access_codes from anon, authenticated;

create or replace function public.normalize_code(p text)
returns text language sql immutable set search_path = public as $$
  select upper(regexp_replace(coalesce(p, ''), '[^A-Za-z0-9]', '', 'g'))
$$;

create or replace function public.is_owner()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce(public.is_staff() and exists (
    select 1 from public.academies a where a.id = public.my_academy() and a.owner_id = auth.uid()
  ), false)
$$;

-- 3. Crear, listar y revocar códigos (coach aprobado) --------------------------------------------
create or replace function public.create_access_code(p_role text, p_label text, p_ref text default '', p_child text default '')
returns text language plpgsql security definer set search_path = public as $$
declare
  r public.corda_role;
  chars constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';   -- sin 0/O ni 1/I/L para que no se confundan
  bytes bytea; raw text; i int; tries int := 0;
begin
  if not public.is_staff() then raise exception 'Solo un coach aprobado puede crear códigos.'; end if;
  r := case p_role when 'Jugador' then 'Jugador' when 'Tutor' then 'Tutor' when 'Coach' then 'Coach' else null end;
  if r is null then raise exception 'Rol no válido.'; end if;
  if r = 'Coach' and not public.is_owner() then raise exception 'Solo el dueño de la academia puede crear códigos de Coach.'; end if;
  if length(trim(coalesce(p_label, ''))) < 2 then raise exception 'Escribe el nombre de la persona.'; end if;
  loop
    bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
    raw := '';
    for i in 0..7 loop raw := raw || substr(chars, 1 + (get_byte(bytes, i) % 31), 1); end loop;
    begin
      insert into public.access_codes (academy_id, code, role, label, member_ref, child_member)
      values (public.my_academy(), raw, r, left(trim(p_label), 80), left(trim(coalesce(p_ref, '')), 40),
              case when r = 'Tutor' then left(trim(coalesce(p_child, '')), 80) else '' end);
      exit;
    exception when unique_violation then
      tries := tries + 1;
      if tries > 5 then raise; end if;
    end;
  end loop;
  return substr(raw, 1, 4) || '-' || substr(raw, 5, 4);
end $$;

create or replace function public.list_access_codes()
returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(jsonb_agg(x order by x.created_at desc), '[]'::jsonb) from (
    select c.id, c.role::text as role, c.label, c.member_ref, c.child_member, c.created_at, c.expires_at,
           case when c.used_by is not null then 'usado'
                when c.revoked then 'revocado'
                when c.expires_at <= now() then 'vencido'
                else 'pendiente' end as status,
           case when c.used_by is null and not c.revoked and c.expires_at > now()
                then substr(c.code, 1, 4) || '-' || substr(c.code, 5, 4) end as code,
           (select p.name from public.profiles p where p.id = c.used_by) as used_by_name
    from public.access_codes c
    where public.is_staff() and c.academy_id = public.my_academy()
    order by c.created_at desc limit 100
  ) x
$$;

create or replace function public.revoke_access_code(p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
declare c public.access_codes;
begin
  if not public.is_staff() then raise exception 'Solo un coach aprobado puede revocar códigos.'; end if;
  select * into c from public.access_codes where id = p_id and academy_id = public.my_academy();
  if not found then raise exception 'Código no encontrado.'; end if;
  if c.role = 'Coach' and not public.is_owner() then raise exception 'Solo el dueño puede revocar códigos de Coach.'; end if;
  update public.access_codes set revoked = true where id = p_id and used_by is null;
end $$;

-- 4. Revisar un código antes de registrarse (sin sesión) -----------------------------------------
-- Devuelve {role, academy, label, child_member} o null. Un código inválido, usado, vencido o revocado se ve igual.
create or replace function public.check_access_code(p_code text)
returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object('role', c.role::text, 'academy', a.name, 'label', c.label, 'child_member', c.child_member)
  from public.access_codes c join public.academies a on a.id = c.academy_id
  where c.code = public.normalize_code(p_code) and c.used_by is null and not c.revoked and c.expires_at > now()
$$;

-- 5. El registro canjea el código (la academia y el rol salen del código) ------------------------
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  asked text := new.raw_user_meta_data->>'role';
  wanted public.corda_role;
  norm text := public.normalize_code(new.raw_user_meta_data->>'code');
  c public.access_codes;
  academy uuid := null;
  child text := null;
begin
  wanted := case asked
    when 'Coach' then 'Coach'::public.corda_role
    when 'Tutor' then 'Tutor'::public.corda_role
    else 'Jugador'::public.corda_role end;
  if norm <> '' then
    update public.access_codes set used_by = new.id, used_at = now()
    where code = norm and used_by is null and not revoked and expires_at > now()
    returning * into c;
    if not found then raise exception 'access_code_invalid'; end if;
    if c.role <> wanted then raise exception 'access_code_role'; end if;
    academy := c.academy_id;
    child := nullif(c.child_member, '');
  elsif wanted <> 'Jugador' then
    raise exception 'access_code_required';
  end if;
  insert into public.profiles (id, email, name, role, academy_id, details, approved, linked_child)
  values (
    new.id, new.email, coalesce(new.raw_user_meta_data->>'name', ''), wanted, academy,
    case when jsonb_typeof(new.raw_user_meta_data->'details') = 'object'
      then new.raw_user_meta_data->'details' else '{}'::jsonb end,
    true,   -- el código lo emitió un coach aprobado; sin código solo entra un jugador independiente
    child
  );
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Desde la app nadie cambia su id, correo, rol, academia, aprobación ni jugador ligado.
create or replace function public.protect_profile_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (
       new.id <> old.id or new.email <> old.email or new.role <> old.role
    or new.approved <> old.approved or new.academy_id is distinct from old.academy_id
    or new.linked_child is distinct from old.linked_child) then
    raise exception 'Ese dato no se puede cambiar desde la app.';
  end if;
  new.updated_at := now();
  return new;
end $$;

-- 6. Tutor: el jugador ligado por código también cuenta -------------------------------------------
create or replace function public.my_child()
returns text language sql stable security definer set search_path = public as $$
  select nullif(t.details->'profile'->>'childId', '')
  from public.profiles t
  where t.id = auth.uid() and t.role = 'Tutor' and t.approved
    and (
      (t.linked_child is not null and t.linked_child = t.details->'profile'->>'childId')
      or exists (
        select 1 from public.profiles c
        where c.academy_id = t.academy_id
          and c.role = 'Jugador'
          and c.details->>'memberId' = t.details->'profile'->>'childId'
          and lower(trim(coalesce(c.details->'profile'->>'tutorEmail', ''))) = lower(coalesce(auth.jwt()->>'email', ''))
      )
    )
$$;

create or replace function public.guardian_invites()
returns table (member_id text, name text)
language sql stable security definer set search_path = public as $$
  select c.details->>'memberId', c.name
  from public.profiles c
  join public.profiles t on t.id = auth.uid() and t.role = 'Tutor' and t.academy_id = c.academy_id
  where c.role = 'Jugador'
    and coalesce(c.details->>'memberId', '') <> ''
    and (
      c.details->>'memberId' = t.linked_child
      or lower(trim(coalesce(c.details->'profile'->>'tutorEmail', ''))) = lower(coalesce(auth.jwt()->>'email', ''))
    )
$$;

create or replace function public.my_guardian()
returns text language sql stable security definer set search_path = public as $$
  with me as (
    select details->>'memberId' as mid, academy_id,
           lower(trim(coalesce(details->'profile'->>'tutorEmail', ''))) as email
    from public.profiles where id = auth.uid() and role = 'Jugador'
  ),
  tutor as (
    select p.approved, p.details->'profile'->>'childId' as child
    from public.profiles p
    join auth.users u on u.id = p.id
    join me on me.academy_id = p.academy_id
           and ((me.email <> '' and lower(u.email) = me.email) or p.linked_child = me.mid)
    where p.role = 'Tutor'
  )
  select case
    when not exists (select 1 from tutor) then 'none'
    when exists (select 1 from tutor, me where tutor.child = me.mid and tutor.approved) then 'active'
    when exists (select 1 from tutor, me where tutor.child = me.mid) then 'linked'
    else 'registered'
  end
$$;

-- 7. Permisos -------------------------------------------------------------------------------------
revoke execute on function public.is_owner(), public.create_access_code(text, text, text, text),
  public.list_access_codes(), public.revoke_access_code(uuid), public.guardian_invites(), public.my_guardian(), public.my_child()
  from public, anon;
grant execute on function public.is_owner(), public.create_access_code(text, text, text, text),
  public.list_access_codes(), public.revoke_access_code(uuid), public.guardian_invites(), public.my_guardian(), public.my_child()
  to authenticated;
revoke execute on function public.check_access_code(text) from public;
grant execute on function public.check_access_code(text) to anon, authenticated;
