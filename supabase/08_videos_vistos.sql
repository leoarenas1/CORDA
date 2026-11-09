-- CORDA · Ajuste 8: el jugador puede marcar "Ya lo vi" en los videos de la biblioteca.
-- (Agregar o editar videos sigue siendo solo de coaches aprobados.)
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
create or replace function public.player_kind(k text)
returns boolean language sql immutable as $$
  select k in ('checkin_player', 'competition', 'goal', 'fee_month', 'fee_code', 'private_receipt', 'video_seen')
$$;
