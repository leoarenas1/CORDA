-- CORDA · Ajuste 14: borrar mi cuenta (lo exige Apple y la ley de privacidad).
-- La persona borra su propia cuenta desde «Mi perfil». Esto elimina:
--   · su acceso (usuario) y su perfil;
--   · si es jugador: sus datos (chequeos, objetivos, mensualidades, evaluaciones sobre él) y su tarjeta del equipo;
--   · si es tutor o coach: su cuenta y su tarjeta del equipo. Lo que el coach escribió para el grupo (avisos,
--     evaluaciones) se queda en la academia, sin su nombre.
-- Los archivos (foto y comprobantes) los borra la app antes de llamar a esta función.
-- El dueño de la academia no puede borrarse solo: primero hay que pasar la academia a otra persona.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
declare
  me uuid := auth.uid();
  prof record;
begin
  if me is null then raise exception 'not_signed_in'; end if;
  select id, role, academy_id, nullif(details->>'memberId', '') as member_id into prof
    from public.profiles where id = me;
  if prof.id is not null and prof.academy_id is not null and exists (
    select 1 from public.academies a where a.id = prof.academy_id and a.owner_id = me
  ) then
    raise exception 'owner_cannot_delete';
  end if;

  if prof.academy_id is not null and prof.member_id is not null then
    -- Datos del integrante (jugador, tutor o coach) y su tarjeta del equipo.
    delete from public.items
     where academy_id = prof.academy_id
       and ((prof.role = 'Jugador' and member_id = prof.member_id)
         or (member_id = '' and kind = 'member_card' and key = prof.member_id));
  end if;

  -- El código con el que entró esta persona ya se usó: queda revocado para que nadie lo vuelva a canjear
  -- (al borrar el usuario, access_codes.used_by queda vacío y el código parecería libre otra vez).
  update public.access_codes set revoked = true where used_by = me;
  delete from auth.users where id = me;   -- el perfil se borra en cascada
end $$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
