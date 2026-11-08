-- CORDA · Ajuste 4: la lista de academias se puede leer sin sesión,
-- para que quien se registra la elija de una lista (y el nombre coincida siempre).
-- Solo se expone el nombre de cada academia; nada más.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

drop policy if exists "academias visibles para todos" on public.academies;
create policy "academias visibles para todos" on public.academies
  for select to anon using (true);
grant select (id, name) on public.academies to anon;
