-- CORDA · Ajuste 19: confirmar asistencia a una sesión (jugador o tutor) y que el Coach lo vea.
-- Cada confirmación se guarda en la carpeta del jugador (tipo «attendance», una por sesión).
--   · El jugador puede escribir las suyas (igual que sus chequeos).
--   · El tutor puede escribir SOLO las de su jugador a cargo (my_child(): solo si el jugador lo nombró con su correo),
--     y SOLO este tipo de dato. No puede tocar chequeos, metas ni nada más.
--   · Los coaches de la academia ven y editan todas.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

create or replace function public.player_kind(k text)
returns boolean language sql immutable as $$
  select k in ('checkin_player', 'competition', 'goal', 'fee_month', 'fee_code', 'private_receipt', 'video_seen', 'wellness', 'attendance')
$$;

-- Lo único que un tutor puede escribir en la carpeta de su jugador.
create or replace function public.guardian_kind(k text)
returns boolean language sql immutable as $$
  select k = 'attendance'
$$;

drop policy if exists "items: crear" on public.items;
create policy "items: crear" on public.items for insert to authenticated with check (
  academy_id = public.my_academy() and (
       public.staff_can(kind, key, data)
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = public.my_child() and public.guardian_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting'))
    or (member_id = '' and kind = 'member_card' and key = public.my_member())
  )
);

drop policy if exists "items: editar" on public.items;
create policy "items: editar" on public.items for update to authenticated
using (
  academy_id = public.my_academy() and (
       public.staff_can(kind, key, data)
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = public.my_child() and public.guardian_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting') and author = auth.uid())
    or (member_id = '' and kind = 'member_card' and key = public.my_member())
  )
)
with check (
  academy_id = public.my_academy() and (
       public.staff_can(kind, key, data)
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = public.my_child() and public.guardian_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting'))
    or (member_id = '' and kind = 'member_card' and key = public.my_member())
  )
);

drop policy if exists "items: borrar" on public.items;
create policy "items: borrar" on public.items for delete to authenticated using (
  academy_id = public.my_academy() and (
       public.staff_can(kind, key, data)
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = public.my_child() and public.guardian_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting') and author = auth.uid())
  )
);

-- Comprobación: debe decir true, true, false.
select public.player_kind('attendance') as jugador_puede,
       public.guardian_kind('attendance') as tutor_puede,
       public.guardian_kind('wellness') as tutor_no_puede_chequeos;
