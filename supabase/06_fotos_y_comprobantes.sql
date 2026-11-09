-- CORDA · Fase C: fotos de perfil y comprobantes de pago en Supabase Storage.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Carpeta "media" (privada). Cada archivo vive en  <academia>/<integrante>/...
--   · <academia>/<integrante>/avatar.jpg            foto de perfil (la ve toda la academia)
--   · <academia>/<integrante>/receipts/<mes>-….jpg  comprobantes (los ve el jugador, sus coaches y su tutor)
-- Cada quien sube y cambia solo sus archivos; un coach aprobado, los de su academia.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', false, 3145728, array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "media: ver" on storage.objects;
create policy "media: ver" on storage.objects for select to authenticated using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and (
       storage.filename(name) = 'avatar.jpg'
    or (storage.foldername(name))[2] = public.my_member()
    or (storage.foldername(name))[2] = public.my_child()
    or public.is_staff()
  )
);

drop policy if exists "media: subir" on storage.objects;
create policy "media: subir" on storage.objects for insert to authenticated with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and ((storage.foldername(name))[2] = public.my_member() or public.is_staff())
);

drop policy if exists "media: cambiar" on storage.objects;
create policy "media: cambiar" on storage.objects for update to authenticated
using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and ((storage.foldername(name))[2] = public.my_member() or public.is_staff())
)
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and ((storage.foldername(name))[2] = public.my_member() or public.is_staff())
);

drop policy if exists "media: borrar" on storage.objects;
create policy "media: borrar" on storage.objects for delete to authenticated using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and ((storage.foldername(name))[2] = public.my_member() or public.is_staff())
);
