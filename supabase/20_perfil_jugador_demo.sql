-- CORDA · Datos de ejemplo del panel de JUGADOR para la demo de Mouratoglou: Leonardo Arenas.
-- Carga lo que el jugador (y su tutor y su coach) ven en su panel, de los últimos 6 días:
--   · Chequeos de estado físico (sueño, energía, ánimo, molestias; con molestia leve en el hombro).
--   · Encuestas de después del entrenamiento (asistencia, esfuerzo, qué salió bien y qué faltó).
--   · Evaluaciones del coach de cada día, la evaluación del mes pasado y 3 objetivos con avance.
-- HOY queda vacío a propósito: así en la demo se hace el chequeo en vivo y se ve el anillo llenarse.
-- Requiere que Leonardo ya esté registrado como Jugador. Se puede correr las veces que quieras:
-- borra lo de ejemplo anterior y lo carga de nuevo contando desde hoy.
-- Pégalo en Supabase → SQL Editor → New query → Run.

do $$
declare
  ac uuid; lm text; hoy date := (now() at time zone 'America/Mexico_City')::date;
  o int; d date; k text; ts bigint;
  -- Posición 1 = ayer, 2 = antier... 6 = hace 6 días.
  sleep_h numeric[] := array[7.5,6.0,6.8,6.5,7.2,7.8];
  sleep_q int[]     := array[4,3,4,3,4,4];
  energy  int[]     := array[5,3,4,3,4,4];
  mood    int[]     := array[4,3,4,4,4,4];
  sore    int[]     := array[3,4,3,3,2,2];
  stress  int[]     := array[2,3,2,3,3,2];
  pain    int[]     := array[2,3,3,0,0,0];
  p_score int[]     := array[72,66,70,60,62,58];
  p_mood  int[]     := array[4,3,4,3,4,4];
  p_rpe   int[]     := array[7,8,7,6,7,6];
  p_good  text[]    := array['Mejor profundidad en el cruzado y más paciencia en los puntos largos.','Mantuve la intensidad hasta el final del entrenamiento.','El saque entró más seguido después del calentamiento.','Me moví mejor en la red.','Buena actitud y buen ritmo desde el inicio.','Me sentí fuerte en los intercambios largos.'];
  p_miss  text[]    := array['Cuidar el hombro cuando saco.','Más piernas en la devolución.','Cerrar mejor los puntos cuando voy arriba.','Llegar más tarde a la pelota corta.','Mejorar el segundo saque.','Tirar más profundo con el revés.'];
  c_score int[]     := array[75,68,72,62,65,60];
  c_good  text[]    := array['Subió la profundidad y se nota más seguro desde el fondo.','Buen trabajo de piernas; no bajó la intensidad.','El primer saque entra más; sigue así.','Mejor posición en la red.','Buena disposición y escucha.','Se vio fuerte en los puntos largos.'];
  c_miss  text[]    := array['Cuidar el hombro: bajar la carga de saques esta semana.','Mejorar la devolución del segundo saque.','Definir los puntos con más decisión.','Pasos cortos antes del golpe.','Subir el porcentaje de primeros saques.','Más profundidad con el revés.'];
begin
  select id into ac from public.academies where name = 'Mouratoglou Tennis Center Guadalajara';
  if ac is null then raise exception 'No encuentro la academia Mouratoglou.'; end if;
  select nullif(p.details->>'memberId','') into lm from public.profiles p
   where p.academy_id = ac and p.role = 'Jugador' and p.name ilike 'Leonardo%' and nullif(p.details->>'memberId','') is not null limit 1;
  if lm is null then raise exception 'Leonardo todavía no está registrado como Jugador de la academia.'; end if;

  delete from public.items
   where academy_id = ac and member_id = lm
     and kind in ('wellness','checkin_player','checkin_coach','review','monthly_review','goal')
     and data->>'seed' = 'mouratoglou-demo';

  for o in 1..6 loop
    d := hoy - o; k := to_char(d, 'YYYY-MM-DD'); ts := (extract(epoch from (d + time '20:00')) * 1000)::bigint;
    insert into public.items (academy_id, member_id, kind, key, data) values
      (ac, lm, 'wellness', k, jsonb_build_object('seed','mouratoglou-demo','sleepH',sleep_h[o],'sleepQ',sleep_q[o],'energy',energy[o],'mood',mood[o],'soreness',sore[o],'stress',stress[o],
         'pain', case when pain[o] > 0 then jsonb_build_array(jsonb_build_object('area','Hombro','level',pain[o])) else '[]'::jsonb end))
    on conflict (academy_id, member_id, kind, key) do update set data = excluded.data;

    -- Entrenamientos de lunes a viernes
    if extract(isodow from d) between 1 and 5 then
      insert into public.items (academy_id, member_id, kind, key, data) values
        (ac, lm, 'checkin_player', k, jsonb_build_object('seed','mouratoglou-demo','attended',true,'score',p_score[o],'mood',p_mood[o],'rpe',p_rpe[o],'good',p_good[o],'missing',p_miss[o],'at',ts)),
        (ac, lm, 'checkin_coach',  k, jsonb_build_object('seed','mouratoglou-demo','attended',true,'score',c_score[o],'good',c_good[o],'missing',c_miss[o],'video','','by','Jean Patrick Pérez','at',ts)),
        (ac, lm, 'review',         k, jsonb_build_object('seed','mouratoglou-demo','good',c_good[o],'focus',c_miss[o]))
      on conflict (academy_id, member_id, kind, key) do update set data = excluded.data;
    end if;
  end loop;

  -- Evaluación del mes pasado
  insert into public.items (academy_id, member_id, kind, key, data) values
    (ac, lm, 'monthly_review', to_char(hoy - interval '1 month', 'YYYY-MM'),
     jsonb_build_object('seed','mouratoglou-demo','score',72,'goal','Ganar consistencia desde el fondo',
       'good','Mejoró la profundidad y la paciencia en los puntos largos.','focus','Subir el porcentaje de primeros saques y cuidar el hombro.','video',''))
  on conflict (academy_id, member_id, kind, key) do update set data = excluded.data;

  -- Objetivos
  insert into public.items (academy_id, member_id, kind, key, data) values
    (ac, lm, 'goal', '3000000001', jsonb_build_object('seed','mouratoglou-demo','id',3000000001,'title','Ganar consistencia desde el fondo','detail','Mantener 15 pelotas en juego con profundidad.','progress',45)),
    (ac, lm, 'goal', '3000000002', jsonb_build_object('seed','mouratoglou-demo','id',3000000002,'title','Construir un segundo saque confiable','detail','Objetivo: 7 de cada 10 saques dentro.','progress',60)),
    (ac, lm, 'goal', '3000000003', jsonb_build_object('seed','mouratoglou-demo','id',3000000003,'title','Llegar a los torneos con 90 % de asistencia','detail','Sin faltas injustificadas durante el mes.','progress',85))
  on conflict (academy_id, member_id, kind, key) do update set data = excluded.data;
end $$;

-- Comprobación: cuántos datos de ejemplo tiene Leonardo por tipo.
select kind, count(*) as filas
from public.items
where kind in ('wellness','checkin_player','checkin_coach','review','monthly_review','goal') and data->>'seed' = 'mouratoglou-demo'
group by kind order by kind;
