-- CORDA · Torneos de ejemplo para Leonardo Arenas (Mouratoglou Tennis Center Guadalajara).
-- Los nombres y sedes son de torneos reales de la zona; las FECHAS son inventadas, contadas desde HOY
-- (mañana, en 4 días, en 6, etc.) para que el Coach vea la lista con lo cercano nítido y lo lejano difuminado.
-- Requiere que Leonardo ya esté registrado como Jugador. Se puede correr las veces que quieras:
-- actualiza los torneos de ejemplo con fechas nuevas desde HOY (no duplica).
-- Pégalo en Supabase → SQL Editor → New query → Run.

with academia as (
  select id from public.academies where name = 'Mouratoglou Tennis Center Guadalajara'
),
leo as (
  select nullif(p.details->>'memberId','') as mid
    from public.profiles p, academia a
   where p.academy_id = a.id and p.role = 'Jugador' and p.name ilike 'Leonardo%'
     and nullif(p.details->>'memberId','') is not null
   limit 1
),
hoy as (select (now() at time zone 'America/Mexico_City')::date as d),
torneos (dias, nombre, sede, modalidad, superficie, prioridad) as (values
  (1,  'V Torneo Anual de Tenis La Cristiana',                 'Chapala, Jalisco',            'Singles',          'Dura (concreto)', ''),
  (4,  'Club Universitario Real del Monte / AMTP 2026',        'Pachuca, Hidalgo',            'Singles',          'Dura (concreto)', 'low'),
  (6,  'Guadalajara: Singles Flex Leagues',                    'Guadalajara, Jalisco',        'Singles',          'Dura (concreto)', 'low'),
  (9,  'II Torneo Varonil Abierto Sheraton Buganvilias AMTP 2026', 'Puerto Vallarta, Jalisco', 'Singles',         'Dura (concreto)', 'high'),
  (14, 'Torneo Singles UTR Malanquin 2026',                    'San Miguel de Allende, Guanajuato', 'Singles',   'Arcilla', 'mid'),
  (21, 'Torneo de Tenis Santa Margarita Open 2026',            'Irapuato, Guanajuato',        'Singles',          'Dura (concreto)', 'high'),
  (30, 'II Torneo Varonil Abierto Club Tecamachalco AMTP 2026','Naucalpan de Juárez, Estado de México', 'Singles y dobles', 'Dura (concreto)', 'mid'),
  (45, 'Battle of Boca',                                       'Boca Raton, Florida',         'Singles y dobles', 'Dura (concreto)', 'low')
)
insert into public.items (academy_id, member_id, kind, key, data)
select a.id, l.mid, 'competition', 'torneo-demo-' || t.dias,
       jsonb_build_object(
         'id', 'torneo-demo-' || t.dias,
         'seed', 'mouratoglou-demo',
         'name', t.nombre,
         'place', t.sede,
         'date', to_char(h.d + t.dias, 'YYYY-MM-DD'),
         'mode', t.modalidad,
         'surface', t.superficie,
         'priority', t.prioridad,
         'start', to_char(h.d, 'YYYY-MM-DD'))
from academia a, leo l, hoy h, torneos t
on conflict (academy_id, member_id, kind, key) do update set data = excluded.data;

-- Comprobación: debe mostrar 8 torneos si Leonardo está registrado.
select data->>'date' as fecha, data->>'name' as torneo, data->>'place' as sede
from public.items
where kind = 'competition' and data->>'seed' = 'mouratoglou-demo'
order by 1;
