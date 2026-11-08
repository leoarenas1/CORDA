-- CORDA · Ajuste 5: privacidad de los perfiles.
-- Antes, cualquiera de la academia podía leer el perfil completo de los demás
-- (correo de la cuenta, meta, fecha de nacimiento, UTR…). Ahora:
--   · Cada quien ve su propio perfil completo.
--   · Un coach aprobado ve los perfiles completos de su academia (los necesita para entrenar).
--   · Un tutor aprobado ve el perfil completo de su jugador.
--   · Los demás de la academia solo ven nombre y rol (función academy_members).
--   · Correo, teléfono y descripción en «Mi academia» aparecen solo si cada quien los escribe en su ficha.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

drop policy if exists "ver mi perfil y los de mi academia" on public.profiles;
drop policy if exists "ver perfiles permitidos" on public.profiles;
create policy "ver perfiles permitidos" on public.profiles
  for select to authenticated
  using (
       id = auth.uid()
    or (academy_id = public.my_academy() and public.is_staff())
    or (academy_id = public.my_academy() and details->>'memberId' = public.my_child())
  );

-- Lista de integrantes de mi academia: solo nombre y rol (sin correo ni datos del perfil).
create or replace function public.academy_members()
returns table (member_id text, name text, role public.corda_role)
language sql stable security definer set search_path = public as $$
  select p.details->>'memberId', p.name, p.role
  from public.profiles p
  where public.my_academy() is not null
    and p.academy_id = public.my_academy()
    and (p.role = 'Jugador' or p.approved)
    and coalesce(p.details->>'memberId', '') <> ''
  order by p.name
$$;
revoke execute on function public.academy_members() from public, anon;
grant execute on function public.academy_members() to authenticated;
