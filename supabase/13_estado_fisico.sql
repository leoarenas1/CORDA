-- CORDA · Ajuste 13: chequeo de estado físico del jugador (sueño, energía, dolor muscular, estrés y molestias).
-- Cada chequeo es un item «wellness» del jugador. El jugador escribe solo los suyos; el coach aprobado de su academia
-- los ve, y su tutor aprobado también. Ningún compañero los ve (las reglas de lectura de items ya lo garantizan:
-- cada dato de un jugador solo lo ven él, su tutor y los coaches).
-- Es información de salud (dato sensible): el aviso de privacidad se actualizó y la app pide aceptarlo otra vez.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
create or replace function public.player_kind(k text)
returns boolean language sql immutable as $$
  select k in ('checkin_player', 'competition', 'goal', 'fee_month', 'fee_code', 'private_receipt', 'video_seen', 'wellness')
$$;
