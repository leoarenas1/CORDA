-- CORDA · Ajuste 12: «avatar.jpg» solo es público para la academia si es la foto de perfil de verdad.
-- Antes, cualquier archivo llamado avatar.jpg, en cualquier carpeta de la academia, lo veía toda la academia
-- (incluso uno dentro de una carpeta privada de clase particular). Ahora solo se comparte la ruta exacta
--   <academia>/<integrante>/avatar.jpg   (la que usa la app para la foto de perfil).
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

drop policy if exists "media: ver" on storage.objects;
create policy "media: ver" on storage.objects for select to authenticated using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and (
       (storage.filename(name) = 'avatar.jpg' and array_length(storage.foldername(name), 1) = 2)
    or (storage.foldername(name))[2] = public.my_member()
    or (storage.foldername(name))[2] = public.my_child()
    or public.staff_file(name)
  )
);
