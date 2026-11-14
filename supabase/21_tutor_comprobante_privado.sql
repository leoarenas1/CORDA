-- CORDA · Ajuste 21: el tutor puede subir el comprobante de una clase particular de su jugador.
-- Se amplía lo que un tutor puede escribir en la carpeta de su jugador: «attendance» (asistencia) y
-- «private_receipt» (comprobante de clase particular), y SOLO los archivos de la subcarpeta «private/».
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.

create or replace function public.guardian_kind(k text)
returns boolean language sql immutable as $$
  select k in ('attendance', 'private_receipt')
$$;

drop policy if exists "media: subir" on storage.objects;
create policy "media: subir" on storage.objects for insert to authenticated with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and (
       (storage.foldername(name))[2] = public.my_member()
    or ((storage.foldername(name))[2] = public.my_child() and (storage.foldername(name))[3] = 'private')
    or public.staff_file(name)
  )
);

drop policy if exists "media: cambiar" on storage.objects;
create policy "media: cambiar" on storage.objects for update to authenticated
using (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and (
       (storage.foldername(name))[2] = public.my_member()
    or ((storage.foldername(name))[2] = public.my_child() and (storage.foldername(name))[3] = 'private')
    or public.staff_file(name)
  )
)
with check (
  bucket_id = 'media'
  and (storage.foldername(name))[1] = public.my_academy()::text
  and (
       (storage.foldername(name))[2] = public.my_member()
    or ((storage.foldername(name))[2] = public.my_child() and (storage.foldername(name))[3] = 'private')
    or public.staff_file(name)
  )
);

-- Comprobación: debe salir true en las dos columnas.
select public.guardian_kind('private_receipt') as tutor_comprobante, not public.guardian_kind('wellness') as tutor_sin_salud;
