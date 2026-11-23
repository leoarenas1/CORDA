-- CORDA · Cupo de academias fundadoras (lo lee la página web para mostrar «Quedan N lugares»).
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Cómo funciona:
--   · Cada academia tiene una casilla «fundadora» (por defecto NO).
--   · La página web pregunta cuántas están marcadas y muestra: lugares totales (8) menos esas.
--   · La función solo devuelve UN NÚMERO. No expone nombres, correos ni nada más.
--
-- Cuando una academia acepte la oferta de fundadoras, márcala (cambia el nombre):
--   update public.academies set fundadora = true where name = 'Nombre de la academia';
-- Para ver cuáles están marcadas:
--   select name, fundadora from public.academies order by created_at;
-- Las academias de prueba o de demo se quedan en NO (así el contador de la web nunca miente).

alter table public.academies add column if not exists fundadora boolean not null default false;

create or replace function public.fundadoras_ocupadas()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from public.academies where fundadora;
$$;

revoke all on function public.fundadoras_ocupadas() from public;
grant execute on function public.fundadoras_ocupadas() to anon, authenticated;
