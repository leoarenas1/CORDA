-- CORDA · Fase A, ajuste 2: el perfil guarda también la copia de datos (details) desde el registro.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  wanted_role public.corda_role;
begin
  wanted_role := case new.raw_user_meta_data->>'role'
    when 'Coach' then 'Coach'::public.corda_role
    when 'Tutor' then 'Tutor'::public.corda_role
    else 'Jugador'::public.corda_role end;
  insert into public.profiles (id, email, name, role, academy_id, details)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    wanted_role,
    (select id from public.academies where name = new.raw_user_meta_data->>'academy'),
    case when jsonb_typeof(new.raw_user_meta_data->'details') = 'object'
      then new.raw_user_meta_data->'details' else '{}'::jsonb end
  );
  return new;
end $$;
