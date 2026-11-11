-- CORDA · Ajuste 15: nadie puede cambiarse el «memberId» desde la app.
-- El memberId (dentro de profiles.details) es la identidad de cada persona para las reglas de lectura:
-- las funciones my_member() y las reglas de items y de archivos lo usan para decidir qué datos ve cada quien.
-- Como cada persona puede editar su propio perfil, antes podía cambiarse el memberId por el de otro jugador
-- y así ver o escribir sus datos (chequeos, evaluaciones, comprobantes). Ahora, una vez que el perfil tiene
-- memberId, la app ya no lo puede cambiar (en el SQL Editor sí).
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
create or replace function public.protect_profile_fields()
returns trigger language plpgsql as $$
begin
  if auth.uid() is not null and (
       new.id <> old.id or new.email <> old.email or new.role <> old.role
    or new.approved <> old.approved or new.academy_id is distinct from old.academy_id
    or new.linked_child is distinct from old.linked_child
    or (coalesce(old.details->>'memberId', '') <> ''
        and new.details->>'memberId' is distinct from old.details->>'memberId')) then
    raise exception 'Ese dato no se puede cambiar desde la app.';
  end if;
  new.updated_at := now();
  return new;
end $$;
