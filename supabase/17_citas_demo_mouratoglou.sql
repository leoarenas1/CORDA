-- CORDA · Citas de demostración con el Coach Jean Patrick (Mouratoglou Tennis Center Guadalajara).
-- Crea:
--   · Horario de atención de Jean Patrick: lunes a viernes de 12:30 a 15:00 (para que se puedan agendar más citas).
--   · Citas de 30 minutos en las próximas 2 semanas: Leonardo Arenas los jueves 13:30 (si ya está registrado),
--     y dos jugadores de ejemplo (Mateo Ruiz, martes 12:30; Sofía Vargas, miércoles 14:00) para que el Coach vea varias.
-- Se puede correr las veces que quieras: borra las citas de demostración anteriores y las vuelve a crear desde HOY.
-- Si Leonardo todavía no está registrado, corre este script de nuevo después de registrarlo.
-- Pégalo en Supabase → SQL Editor → New query → Run.

delete from public.items
where academy_id = (select id from public.academies where name = 'Mouratoglou Tennis Center Guadalajara')
  and kind = 'meeting' and data->>'seed' = 'mouratoglou-demo';

with academia as (
  select id from public.academies where name = 'Mouratoglou Tennis Center Guadalajara'
),
coach as (
  select nullif(p.details->>'memberId','') as mid, p.name
    from public.profiles p, academia a
   where p.academy_id = a.id and p.role = 'Coach' and p.name ilike 'Jean Patrick%'
     and nullif(p.details->>'memberId','') is not null
   limit 1
),
leo as (
  select nullif(p.details->>'memberId','') as mid, p.name
    from public.profiles p, academia a
   where p.academy_id = a.id and p.role = 'Jugador' and p.name ilike 'Leonardo%'
     and nullif(p.details->>'memberId','') is not null
   limit 1
),
hoy as (select (now() at time zone 'America/Mexico_City')::date as d),
horario as (
  insert into public.items (academy_id, member_id, kind, key, data)
  select a.id, '', 'office_hours', c.mid,
         jsonb_build_object('1', jsonb_build_object('from','12:30','to','15:00'),
                            '2', jsonb_build_object('from','12:30','to','15:00'),
                            '3', jsonb_build_object('from','12:30','to','15:00'),
                            '4', jsonb_build_object('from','12:30','to','15:00'),
                            '5', jsonb_build_object('from','12:30','to','15:00'))
    from academia a, coach c
  on conflict (academy_id, member_id, kind, key) do update set data = excluded.data
  returning 1
),
citas (dow, hora, jugador, jugador_id, rol) as (
  select 4, '13:30', l.name, l.mid, 'Jugador' from leo l
  union all select 2, '12:30', 'Mateo Ruiz', 'demo-mateo-ruiz', 'Jugador'
  union all select 3, '14:00', 'Sofía Vargas', 'demo-sofia-vargas', 'Jugador'
)
insert into public.items (academy_id, member_id, kind, key, data)
select a.id, '', 'meeting', 'cita-demo-' || to_char(h.d + g.i, 'YYYYMMDD') || '-' || ci.dow || '-' || replace(ci.hora, ':', ''),
       jsonb_build_object(
         'id', 'cita-demo-' || to_char(h.d + g.i, 'YYYYMMDD') || '-' || ci.dow || '-' || replace(ci.hora, ':', ''),
         'seed', 'mouratoglou-demo',
         'date', to_char(h.d + g.i, 'YYYY-MM-DD'),
         'time', ci.hora,
         'hosts', jsonb_build_array(c.mid),
         'names', jsonb_build_array(c.name),
         'playerId', ci.jugador_id,
         'requester', ci.jugador,
         'requesterRole', ci.rol,
         'venue', 'Mouratoglou Tennis Center Guadalajara')
from academia a
cross join coach c
cross join hoy h
cross join generate_series(0, 13) as g(i)
join citas ci on ci.dow = extract(isodow from (h.d + g.i))::int;

-- Comprobación: citas creadas.
select data->>'date' as fecha, data->>'time' as hora, data->>'requester' as jugador, data->'names'->>0 as con
from public.items
where kind = 'meeting' and data->>'seed' = 'mouratoglou-demo'
order by 1, 2;
