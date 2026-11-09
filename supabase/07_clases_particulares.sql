-- CORDA · Ajuste 7: comprobantes de clases particulares (pago directo al coach).
-- El jugador sube el comprobante y elige a qué coach le pagó. Solo ese coach lo ve
-- (ni la academia ni los demás coaches). También los "Pagos privados" de cada coach
-- quedan visibles solo para ese coach.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

-- 1. El jugador puede crear sus comprobantes de clases particulares.
create or replace function public.player_kind(k text)
returns boolean language sql immutable as $$
  select k in ('checkin_player', 'competition', 'goal', 'fee_month', 'fee_code', 'private_receipt')
$$;

-- 2. Qué ve y edita un coach aprobado: todo lo de su academia, salvo lo privado de otros coaches.
create or replace function public.staff_can(k text, item_key text, item_data jsonb)
returns boolean language sql stable as $$
  select public.is_staff() and (
       k not in ('private_receipt', 'private_book')
    or (k = 'private_receipt' and item_data->>'coachId' = public.my_member())
    or (k = 'private_book' and item_key = public.my_member())
  )
$$;
revoke execute on function public.staff_can(text, text, jsonb) from public, anon;
grant execute on function public.staff_can(text, text, jsonb) to authenticated;

drop policy if exists "items: ver" on public.items;
create policy "items: ver" on public.items for select to authenticated using (
  academy_id = public.my_academy() and (
       public.staff_can(kind, key, data)
    or (member_id = '' and kind <> 'private_book')
    or member_id = public.my_member()
    or member_id = public.my_child()
  )
);

drop policy if exists "items: crear" on public.items;
create policy "items: crear" on public.items for insert to authenticated with check (
  academy_id = public.my_academy() and (
       public.staff_can(kind, key, data)
    or (member_id = public.my_member() and public.player_kind(kind))
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
    or (member_id = '' and kind in ('comment', 'meeting') and author = auth.uid())
    or (member_id = '' and kind = 'member_card' and key = public.my_member())
  )
)
with check (
  academy_id = public.my_academy() and (
       public.staff_can(kind, key, data)
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting'))
    or (member_id = '' and kind = 'member_card' and key = public.my_member())
  )
);

drop policy if exists "items: borrar" on public.items;
create policy "items: borrar" on public.items for delete to authenticated using (
  academy_id = public.my_academy() and (
       public.staff_can(kind, key, data)
    or (member_id = public.my_member() and public.player_kind(kind))
    or (member_id = '' and kind in ('comment', 'meeting') and author = auth.uid())
  )
);

-- 3. Archivos: <academia>/<jugador>/private/<coach>/… solo lo ven el jugador, su tutor y ESE coach.
create or replace function public.staff_file(path text)
returns boolean language sql stable as $$
  select public.is_staff() and (
       coalesce((storage.foldername(path))[3], '') <> 'private'
    or (storage.foldername(path))[4] = public.my_member()
  )
$$;
revoke execute on function public.staff_file(text) from public, anon;
grant execute on function public.staff_file(text) to authenticated;

drop policy if exists "media: ver" on storage.objects;
create policy "media: ver" on storage.objects for select to authenticated using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and (
       storage.filename(name) = 'avatar.jpg'
    or (storage.foldername(name))[2] = public.my_member()
    or (storage.foldername(name))[2] = public.my_child()
    or public.staff_file(name)
  )
);

drop policy if exists "media: subir" on storage.objects;
create policy "media: subir" on storage.objects for insert to authenticated with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and ((storage.foldername(name))[2] = public.my_member() or public.staff_file(name))
);

drop policy if exists "media: cambiar" on storage.objects;
create policy "media: cambiar" on storage.objects for update to authenticated
using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and ((storage.foldername(name))[2] = public.my_member() or public.staff_file(name))
)
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and ((storage.foldername(name))[2] = public.my_member() or public.staff_file(name))
);

drop policy if exists "media: borrar" on storage.objects;
create policy "media: borrar" on storage.objects for delete to authenticated using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and ((storage.foldername(name))[2] = public.my_member() or public.staff_file(name))
);
