-- CORDA · Ajuste 11: cómo entra el PRIMER coach (el dueño) de una academia.
-- Problema: los códigos de coach los crea un coach aprobado... pero al inicio no hay ninguno.
-- Solución: el código del dueño se crea AQUÍ, en el SQL Editor, que solo tú (dueño del proyecto de Supabase) puedes abrir.
--   · No sirve "el primero que se registre": cualquiera podría ganarte. Este código solo existe si tú lo creas.
--   · Quien lo use queda como coach aprobado y como DUEÑO de la academia: desde ahí crea los códigos de los demás coaches, jugadores y tutores.
--   · La app no puede crear códigos de dueño (la función no se puede ejecutar desde la app).
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Después, en otra consulta nueva, crea tu código (cambia el nombre si tu academia se llama distinto):
--   select public.create_owner_code('Mouratoglou Tennis Center Guadalajara', 'Leonardo Arenas');
-- Te devuelve algo como K7M2-9QXH. Regístrate en la app como Coach con ese código (vence en 7 días, un solo uso).
--
-- Si YA tienes una cuenta de Coach en Supabase con tu correo (no puedes registrarte otra vez), en vez de lo anterior corre esto (cambia el correo):
--   update public.profiles set approved = true,
--     academy_id = (select id from public.academies where name = 'Mouratoglou Tennis Center Guadalajara')
--   where email = 'TU_CORREO' and role = 'Coach';
--   update public.academies set owner_id = (select id from public.profiles where email = 'TU_CORREO')
--   where name = 'Mouratoglou Tennis Center Guadalajara';

alter table public.access_codes add column if not exists makes_owner boolean not null default false;

create or replace function public.create_owner_code(p_academy text, p_label text)
returns text language plpgsql security definer set search_path = public as $$
declare
  a uuid;
  chars constant text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  bytes bytea; raw text; i int;
begin
  select id into a from public.academies where name = p_academy;
  if a is null then raise exception 'No existe una academia con ese nombre.'; end if;
  bytes := decode(replace(gen_random_uuid()::text, '-', ''), 'hex');
  raw := '';
  for i in 0..7 loop raw := raw || substr(chars, 1 + (get_byte(bytes, i) % 31), 1); end loop;
  insert into public.access_codes (academy_id, code, role, label, makes_owner, expires_at, created_by)
  values (a, raw, 'Coach', left(trim(coalesce(p_label, '')), 80), true, now() + interval '7 days', null);
  return substr(raw, 1, 4) || '-' || substr(raw, 5, 4);
end $$;
-- Solo desde el SQL Editor: ni la app ni ningún usuario puede ejecutarla.
revoke execute on function public.create_owner_code(text, text) from public, anon, authenticated;

-- El registro: si el código es de dueño, esa cuenta queda como dueña de la academia (solo si aún no tiene dueño).
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
    true,
    child
  );
  if c.makes_owner then
    update public.academies set owner_id = new.id where id = c.academy_id and owner_id is null;
  end if;
  return new;
end $$;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
