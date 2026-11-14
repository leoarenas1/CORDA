-- CORDA · Plan de entrenamiento de demostración para Mouratoglou Tennis Center Guadalajara.
-- Carga las próximas 2 semanas (lunes a viernes) con:
--   · Tenis 8:00, 2 horas, Cancha 1 y 2. Los coaches cambian por día: lun Diego Núñez y Jean Patrick, mar Toño Domínguez
--     y Erick Aligheri, mié Diego Núñez y Erick Aligheri, jue Toño Domínguez y Jean Patrick, vie Diego Núñez y Toño Domínguez.
--   · Clase particular con Jean Patrick, lunes y jueves 11:30, solo para Leonardo Arenas (si ya está registrado; si no,
--     registra a Leonardo y vuelve a correr este script).
--   · Físico 10:10, 1 hora, Gimnasio, con el coach Jonathan (drills de explosividad).
-- Cada sesión trae material que llevar, guía rápida y plan detallado (lo que se ve en «Ver indicaciones»).
-- Se puede correr las veces que quieras: primero borra las sesiones de demostración anteriores y vuelve a cargarlas
-- con las fechas de HOY en adelante. Pégalo en Supabase → SQL Editor → New query → Run.

delete from public.items
where academy_id = (select id from public.academies where name = 'Mouratoglou Tennis Center Guadalajara')
  and kind in ('session','player_session') and data->>'seed' = 'mouratoglou-demo';

with academia as (
  select id from public.academies where name = 'Mouratoglou Tennis Center Guadalajara'
),
hoy as (
  select (now() at time zone 'America/Mexico_City')::date as d
),
plantilla (dow, n, hora, minutos, tipo, titulo, lugar, coach, material, guia, enfoque, objetivo, detalle) as (values
  -- ================= TENIS · 8:00 · Cancha 1 y 2 =================
  (1, 1, '08:00', 120, 'Tenis', 'Consistencia y profundidad', 'Cancha 1 y 2', 'Coach Diego Núñez y Coach Jean Patrick',
   'Raqueta, tenis de cancha, gorra, toalla y botella de agua (mínimo 1 litro)',
   $q$Calentamiento de 15 minutos: trote suave, movilidad y minitenis.
Pelotea cruzado buscando que la pelota caiga detrás de la línea de servicio.
Cambia a paralelo cada 10 pelotas sin perder profundidad.
Cierra con puntos de 3 a 5 pelotas y estiramiento.$q$,
   'Peloteo cruzado y paralelo con profundidad', 'Ganar consistencia desde el fondo',
   'Calentamiento 15 min · Drills de profundidad 45 min en Cancha 1 · Puntos condicionados 40 min en Cancha 2 · Vuelta a la calma 20 min. Los grupos rotan entre las dos canchas cada 20 minutos.'),
  (2, 1, '08:00', 120, 'Tenis', 'Saque + primera pelota', 'Cancha 1 y 2', 'Coach Toño Domínguez y Coach Erick Aligheri',
   'Raqueta, tenis de cancha, gorra, toalla, botella de agua y 2 pelotas nuevas para saque',
   $q$Calentamiento de 15 minutos con movilidad de hombro.
Saque desde ambos lados: 20 saques buscando la T y 20 buscando el ángulo.
Después del saque, primera pelota hacia el lado abierto.
Cierra con puntos que empiezan en saque.$q$,
   'Saque dirigido y primera pelota agresiva', 'Construir un segundo saque confiable',
   'Calentamiento 15 min · Series de saque 40 min (Cancha 1) · Saque + primera pelota 45 min (Cancha 2) · Puntos con saque 20 min. Se anota cuántos saques entran de cada 10.'),
  (3, 1, '08:00', 120, 'Tenis', 'Devolución de saque', 'Cancha 1 y 2', 'Coach Diego Núñez y Coach Erick Aligheri',
   'Raqueta, tenis de cancha, gorra, toalla y botella de agua',
   $q$Calentamiento de 15 minutos y pasos laterales con split step.
Resta profundo y al centro contra primeros saques.
Resta cruzado contra segundos saques y busca iniciar el punto.
Cierra con juegos de devolución.$q$,
   'Restar profundo y al centro', 'Ganar consistencia desde el fondo',
   'Calentamiento 15 min · Split step y primeros pasos 20 min · Devolución contra saque 55 min (rotando entre Cancha 1 y 2) · Juegos de devolución 30 min.'),
  (4, 1, '08:00', 120, 'Tenis', 'Transiciones a la red', 'Cancha 1 y 2', 'Coach Toño Domínguez y Coach Jean Patrick',
   'Raqueta, tenis de cancha, gorra, toalla y botella de agua',
   $q$Calentamiento de 15 minutos con voleas suaves.
Aproximación con slice y avance a la red por el lado abierto.
Volea de definición y smash cuando el rival lanza globo.
Cierra con puntos que obligan a subir a la red.$q$,
   'Subir a la red con intención', 'Construir un juego más completo',
   'Calentamiento 15 min · Aproximación y volea 50 min en Cancha 1 · Smash y globos 25 min · Puntos de transición 30 min en Cancha 2.'),
  (5, 1, '08:00', 120, 'Tenis', 'Puntos y competencia', 'Cancha 1 y 2', 'Coach Diego Núñez y Coach Toño Domínguez',
   'Raqueta, tenis de cancha, gorra, toalla, botella de agua e hidratante',
   $q$Calentamiento de 15 minutos igual que en un partido.
Juega sets cortos a 4 juegos con marcador real.
Anota qué te funcionó en los puntos importantes.
Cierra con estiramiento y comentarios del coach.$q$,
   'Sets cortos con marcador real', 'Competir con más calma en los puntos importantes',
   'Calentamiento 15 min · Sets cortos a 4 juegos en Cancha 1 y 2 durante 80 min · Comentarios del coach 15 min · Vuelta a la calma 10 min.'),
  -- ================= FÍSICO · 10:10 · Gimnasio · Coach Jonathan =================
  (1, 2, '10:10', 60, 'Físico', 'Drills de explosividad', 'Gimnasio', 'Coach Jonathan',
   'Ligas de alta tensión, tapete, roller, toalla, botella de agua y tenis para correr',
   $q$Activación de 8 minutos: roller en piernas y espalda, y movilidad de cadera.
Saltos verticales y saltos al cajón: 4 series de 6 con descanso completo.
Arranques cortos con liga de alta tensión: 6 repeticiones por lado.
Cierra con respiración y estiramiento en el tapete.$q$,
   'Saltos, arranques y cambios de dirección', 'Preparación física',
   'Activación 8 min · Saltos al cajón 4x6 · Arranques con liga 4x6 por lado · Cambios de dirección con conos 3 series · Estiramiento 8 min. Descanso de 60 a 90 segundos entre series. El coach Jonathan ajusta la carga según tu chequeo del día.'),
  (2, 2, '10:10', 60, 'Físico', 'Fuerza y estabilidad', 'Gimnasio', 'Coach Jonathan',
   'Ligas de alta tensión, tapete, toalla, botella de agua y tenis para correr',
   $q$Calienta 8 minutos con movilidad de hombro y cadera.
Sentadilla con liga y puente de glúteo: 3 series de 10.
Plancha lateral y remo con liga para hombro: 3 series de 30 segundos.
Cierra con estiramiento en el tapete.$q$,
   'Fuerza de piernas, core y hombro', 'Preparación física',
   'Calentamiento 8 min · Sentadilla con liga 3x10 · Puente de glúteo 3x10 · Plancha lateral 3x30 s · Remo con liga 3x12 · Estiramiento 8 min. Atención a la técnica antes que al peso.'),
  (3, 2, '10:10', 60, 'Físico', 'Explosividad y agilidad', 'Gimnasio', 'Coach Jonathan',
   'Ligas de alta tensión, tapete, roller, toalla, botella de agua y tenis para correr',
   $q$Activación de 8 minutos con roller y movilidad.
Escalera de agilidad: 5 pasadas por patrón.
Desplazamientos laterales con liga en la cintura: 4 series.
Saltos cortos y reacción al estímulo del coach.$q$,
   'Escalera, desplazamiento lateral y reacción', 'Preparación física',
   'Activación 8 min · Escalera de agilidad 15 min · Desplazamientos laterales con liga 4x20 s · Reacción y salida 3 series · Estiramiento 8 min.'),
  (4, 2, '10:10', 60, 'Físico', 'Drills de explosividad: pliometría', 'Gimnasio', 'Coach Jonathan',
   'Ligas de alta tensión, tapete, roller, toalla, botella de agua y tenis para correr',
   $q$Activación de 8 minutos: roller y movilidad de tobillo.
Saltos con aterrizaje controlado: 4 series de 5.
Lanzamientos de balón medicinal con rotación: 3 series de 8 por lado.
Cierra con estiramiento y respiración en el tapete.$q$,
   'Pliometría y lanzamientos con rotación', 'Preparación física',
   'Activación 8 min · Saltos con aterrizaje 4x5 · Lanzamientos con rotación 3x8 por lado · Arranques con liga 3x6 · Estiramiento 8 min. Si hay molestia en rodilla o tobillo, avisa al coach antes de empezar.'),
  (5, 2, '10:10', 60, 'Físico', 'Movilidad y recuperación', 'Gimnasio', 'Coach Jonathan',
   'Tapete, roller, toalla, botella de agua y ropa cómoda',
   $q$Respira profundo y suelta cuello y hombros.
Roller en piernas, espalda y glúteos: 1 minuto por zona.
Movilidad de cadera y columna en el tapete.
Cierra con 5 minutos de estiramiento suave.$q$,
   'Recuperar para la siguiente semana', 'Preparación física',
   'Respiración 5 min · Roller 10 min · Movilidad de cadera y columna 20 min · Estiramiento guiado 15 min. Sesión para bajar la carga y llegar fresco al lunes.')
)
insert into public.items (academy_id, member_id, kind, key, data)
select a.id, '', 'session',
       (2000000000 + (g.i * 100) + p.n)::text,
       jsonb_build_object(
         'id', 2000000000 + (g.i * 100) + p.n,
         'seed', 'mouratoglou-demo',
         'title', p.titulo,
         'type', p.tipo,
         'date', to_char(h.d + g.i, 'YYYY-MM-DD'),
         'time', p.hora,
         'duration', p.minutos::text,
         'place', p.lugar,
         'coach', p.coach,
         'gear', p.material,
         'guide', p.guia,
         'summary', p.enfoque,
         'goal', p.objetivo,
         'notes', p.detalle,
         'day', p.dow - 1,
         'done', false
       )
from academia a
cross join hoy h
cross join generate_series(0, 13) as g(i)
join plantilla p on p.dow = extract(isodow from (h.d + g.i))::int;

-- Clases particulares: lunes y jueves 11:30 con Jean Patrick, solo para Leonardo Arenas.
-- Se guardan en el espacio privado de Leonardo (player_session), así que las ven él, su tutor y el staff.
insert into public.items (academy_id, member_id, kind, key, data)
select a.id, l.mid, 'player_session',
       (2100000000 + (g.i * 100) + 1)::text,
       jsonb_build_object(
         'id', 2100000000 + (g.i * 100) + 1,
         'seed', 'mouratoglou-demo',
         'title', 'Clase particular con Coach Jean Patrick',
         'type', 'Tenis',
         'date', to_char(h.d + g.i, 'YYYY-MM-DD'),
         'time', '11:30',
         'duration', '60',
         'place', 'Cancha 1',
         'coach', 'Coach Jean Patrick Pérez',
         'players', jsonb_build_array(l.mid),
         'gear', 'Raqueta, tenis de cancha, gorra, toalla y botella de agua',
         'guide', 'Trabajo individual con el coach: revisión de tu técnica y de lo que salió en tus chequeos de la semana.',
         'summary', 'Clase individual con Jean Patrick',
         'goal', 'Corregir detalles y trabajar tu plan personal',
         'notes', 'Calentamiento 10 min · Trabajo técnico 30 min · Puntos con el coach 15 min · Comentarios 5 min.',
         'day', extract(isodow from (h.d + g.i))::int - 1,
         'done', false
       )
from (select id from public.academies where name = 'Mouratoglou Tennis Center Guadalajara') a
cross join (select (now() at time zone 'America/Mexico_City')::date as d) h
cross join generate_series(0, 13) as g(i)
cross join (
  select nullif(details->>'memberId','') as mid from public.profiles
   where role = 'Jugador' and name ilike 'Leonardo%' and nullif(details->>'memberId','') is not null
     and academy_id = (select id from public.academies where name = 'Mouratoglou Tennis Center Guadalajara')
   limit 1
) l
where extract(isodow from (h.d + g.i))::int in (1, 4);

-- Comprobación: unas 20 filas de grupo (2 por día hábil en 2 semanas) y 4 clases particulares si Leonardo ya está registrado.
select data->>'date' as fecha, data->>'time' as hora, data->>'type' as tipo, data->>'title' as sesion, data->>'coach' as coach
from public.items
where kind in ('session','player_session') and data->>'seed' = 'mouratoglou-demo'
order by 1, 2;
