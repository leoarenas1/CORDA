-- CORDA · Ajuste 9: el tutor de un menor se vincula solo si el menor lo nombró.
-- El jugador menor de 18 años escribe el correo de su tutor al registrarse (se guarda en su perfil).
-- Desde ahora:
--   · my_child() solo devuelve al jugador a cargo si el correo de la cuenta del tutor es el que escribió ese jugador.
--     (Antes, cualquier tutor aprobado podía elegir a cualquier jugador de la academia.)
--   · guardian_invites(): el tutor ve a los jugadores que lo nombraron con su correo, para aceptarlos.
--   · my_guardian(): el jugador sabe en qué paso va su tutor (none / registered / linked / active).
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

create or replace function public.my_child()
returns text language sql stable security definer set search_path = public as $$
  select nullif(t.details->'profile'->>'childId', '')
  from public.profiles t
  where t.id = auth.uid() and t.role = 'Tutor' and t.approved
    and exists (
      select 1 from public.profiles c
      where c.academy_id = t.academy_id
        and c.role = 'Jugador'
        and c.details->>'memberId' = t.details->'profile'->>'childId'
        and lower(trim(coalesce(c.details->'profile'->>'tutorEmail', ''))) = lower(coalesce(auth.jwt()->>'email', ''))
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
    and lower(trim(coalesce(c.details->'profile'->>'tutorEmail', ''))) = lower(coalesce(auth.jwt()->>'email', ''))
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
    join me on me.academy_id = p.academy_id and me.email <> '' and lower(u.email) = me.email
    where p.role = 'Tutor'
  )
  select case
    when not exists (select 1 from tutor) then 'none'
    when exists (select 1 from tutor, me where tutor.child = me.mid and tutor.approved) then 'active'
    when exists (select 1 from tutor, me where tutor.child = me.mid) then 'linked'
    else 'registered'
  end
$$;

revoke execute on function public.guardian_invites(), public.my_guardian() from public, anon;
grant execute on function public.guardian_invites(), public.my_guardian() to authenticated;
