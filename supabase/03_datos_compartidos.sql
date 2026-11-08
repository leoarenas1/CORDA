-- CORDA · Fase B: datos compartidos entre jugador, coach y tutor.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Idea: cada dato de la app (una sesión del plan, la encuesta de un día, una evaluación,
-- un anuncio, un mes de mensualidad…) es una fila de la tabla "items".
--   member_id = ''          → dato de toda la academia (plan, anuncios, citas…)
--   member_id = <jugador>   → dato de un jugador (encuestas, evaluaciones, metas, torneos, pagos)
--
-- Quién ve y quién edita:
--   · Jugador: ve lo de su academia y lo suyo. Edita su encuesta, sus metas, sus torneos y sus pagos.
--   · Coach APROBADO: ve y edita todo lo de su academia.
--   · Tutor APROBADO: ve lo de su academia y lo de su jugador. No edita datos del jugador.
--   · Coaches y tutores empiezan sin aprobar. Se aprueban aquí: Table Editor → profiles → approved = true.

-- 1. Aprobación de coaches y tutores -----------------------------------------------
alter table public.profiles add column if not exists approved boolean not null default false;
update public.profiles set approved = true where role = 'Jugador' and not approved;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  wanted_role public.corda_role;
begin
  wanted_role := case new.raw_user_meta_data->>'role'
    when 'Coach' then 'Coach'::public.corda_role
    when 'Tutor' then 'Tutor'::public.corda_role
    else 'Jugador'::public.corda_role end;
  insert into public.profiles (id, email, name, role, academy_id, details, approved)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    wanted_role,
    (select id from public.academies where name = new.raw_user_meta_data->>'academy'),
    case when jsonb_typeof(new.raw_user_meta_data->'details') = 'object'
      then new.raw_user_meta_data->'details' else '{}'::jsonb end,
    wanted_role = 'Jugador'   -- los jugadores entran directo; coaches y tutores esperan aprobación
  );
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- Desde la app nadie cambia su id, correo, rol, academia ni aprobación (aquí en SQL sí).
create or replace function public.protect_profile_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (
       new.id <> old.id or new.email <> old.email or new.role <> old.role
    or new.approved <> old.approved or new.academy_id is distinct from old.academy_id) then
    raise exception 'Ese dato no se puede cambiar desde la app.';
  end if;
  new.updated_at := now();
  return new;
end $$;

-- 2. Quién soy (security definer para no chocar con RLS) ---------------------------
create or replace function public.my_member()
returns text language sql stable security definer set search_path = public as $$
  select nullif(details->>'memberId', '') from public.profiles where id = auth.uid()
$$;
create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'Coach' and approved and academy_id is not null
                   from public.profiles where id = auth.uid()), false)
$$;
create or replace function public.my_child()
returns text language sql stable security definer set search_path = public as $$
  select nullif(details->'profile'->>'childId', '') from public.profiles
  where id = auth.uid() and role = 'Tutor' and approved
$$;
revoke execute on function public.my_member(), public.is_staff(), public.my_child() from public, anon;
grant execute on function public.my_member(), public.is_staff(), public.my_child() to authenticated;

-- 3. Tabla de datos ---------------------------------------------------------------
create table if not exists public.items (
  academy_id uuid not null references public.academies (id) on delete cascade,
  member_id  text not null default '',
  kind       text not null,
  key        text not null,
  data       jsonb not null default '{}'::jsonb,
  author     uuid default auth.uid() references auth.users (id) on delete set null,
  updated_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  primary key (academy_id, member_id, kind, key)
);
alter table public.items enable row level security;
create index if not exists items_member on public.items (academy_id, member_id);

-- Quién creó la fila no cambia; se guarda quién la editó y cuándo.
create or replace function public.stamp_item()
returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    new.author := coalesce(auth.uid(), new.author);
  else
    new.author := old.author;
  end if;
  new.updated_by := auth.uid();
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists stamp_item on public.items;
create trigger stamp_item before insert or update on public.items
  for each row execute function public.stamp_item();

-- 4. Reglas (RLS) -----------------------------------------------------------------
drop policy if exists "items: ver" on public.items;
create policy "items: ver" on public.items for select to authenticated using (
  academy_id = public.my_academy() and (
       public.is_staff()
    or (member_id = '' and kind <> 'private_book')
    or member_id = public.my_member()
    or member_id = public.my_child()
  )
);

-- Lo que un jugador puede escribir de sí mismo (las evaluaciones del coach no).
create or replace function public.player_kind(k text)
returns boolean language sql immutable as $$
  select k in ('checkin_player', 'competition', 'goal', 'fee_month', 'fee_code')
$$;

drop policy if exists "items: crear" on public.items;
create policy "items: crear" on public.items for insert to authenticated with check (
  academy_id = public.my_academy() and (
       public.is_staff()
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting'))
    or (member_id = '' and kind = 'member_card' and key = public.my_member())
  )
);

drop policy if exists "items: editar" on public.items;
create policy "items: editar" on public.items for update to authenticated
using (
  academy_id = public.my_academy() and (
       public.is_staff()
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting') and author = auth.uid())
    or (member_id = '' and kind = 'member_card' and key = public.my_member())
  )
)
with check (
  academy_id = public.my_academy() and (
       public.is_staff()
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting'))
    or (member_id = '' and kind = 'member_card' and key = public.my_member())
  )
);

drop policy if exists "items: borrar" on public.items;
create policy "items: borrar" on public.items for delete to authenticated using (
  academy_id = public.my_academy() and (
       public.is_staff()
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting') and author = auth.uid())
  )
);

-- 5. Permisos del Data API ---------------------------------------------------------
revoke all on public.items from anon;
grant select, insert, update, delete on public.items to authenticated;
