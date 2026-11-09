-- CORDA · PRUEBAS DE SEGURIDAD de los archivos (Supabase Storage, bucket «media»: fotos de perfil y comprobantes).
-- Complementa a pruebas_seguridad.sql. No cambia nada: usa personas y archivos inventados y se deshace solo.
-- Comprueba, por ejemplo, que un jugador no ve los comprobantes de otro, que un coach de otra academia no ve nada,
-- que el comprobante de una clase particular solo lo ve el jugador, su tutor y ESE coach, y que nadie sube archivos a carpetas ajenas.
--
-- CÓMO CORRERLA: pega todo en Supabase → SQL Editor → New query → Run.
-- Termina SIEMPRE con un mensaje rojo «ERROR» que trae el reporte (ok / FALLA por prueba). Es lo esperado: así se deshace todo.
-- Nota: si una prueba que debía quedar «permitido» sale «bloqueado» por un error de permisos del propio Storage (no de las reglas),
-- el reporte lo marca igual como FALLA: mándame el reporte y lo reviso.

do $$
declare
  nil constant uuid := '00000000-0000-0000-0000-000000000000';
  aid uuid; bid uuid;
  id_ca  uuid := gen_random_uuid();  -- coach A (dueño)
  id_ca2 uuid := gen_random_uuid();  -- otro coach aprobado de A
  id_cu  uuid := gen_random_uuid();  -- coach de A sin aprobar
  id_cb  uuid := gen_random_uuid();  -- coach de B
  id_pa1 uuid := gen_random_uuid();  -- jugador 1 de A
  id_pa2 uuid := gen_random_uuid();  -- jugador 2 de A
  id_tu  uuid := gen_random_uuid();  -- tutor de pa1
  id_tx  uuid := gen_random_uuid();  -- tutor que dice ser de pa2, pero pa2 no lo nombró
  id_in  uuid := gen_random_uuid();  -- jugador independiente
  n int; got text; res jsonb := '[]'::jsonb; rep text := ''; good int := 0; bad int := 0; x jsonb;
  b record;
begin
  -- ============ PREPARACIÓN (como administrador; todo se deshace al final) ============
  insert into public.academies (name) values ('ZZ_TEST_A') returning id into aid;
  insert into public.academies (name) values ('ZZ_TEST_B') returning id into bid;
  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data) values
    (id_ca,  nil, 'authenticated', 'authenticated', 'zz-ca@prueba.invalid',  '{"role":"Jugador"}'),
    (id_ca2, nil, 'authenticated', 'authenticated', 'zz-ca2@prueba.invalid', '{"role":"Jugador"}'),
    (id_cu,  nil, 'authenticated', 'authenticated', 'zz-cu@prueba.invalid',  '{"role":"Jugador"}'),
    (id_cb,  nil, 'authenticated', 'authenticated', 'zz-cb@prueba.invalid',  '{"role":"Jugador"}'),
    (id_pa1, nil, 'authenticated', 'authenticated', 'zz-pa1@prueba.invalid', '{"role":"Jugador"}'),
    (id_pa2, nil, 'authenticated', 'authenticated', 'zz-pa2@prueba.invalid', '{"role":"Jugador"}'),
    (id_tu,  nil, 'authenticated', 'authenticated', 'zz-tu@prueba.invalid',  '{"role":"Jugador"}'),
    (id_tx,  nil, 'authenticated', 'authenticated', 'zz-tx@prueba.invalid',  '{"role":"Jugador"}'),
    (id_in,  nil, 'authenticated', 'authenticated', 'zz-in@prueba.invalid',  '{"role":"Jugador"}');
  update public.profiles set role='Coach',  academy_id=aid, approved=true,  details='{"memberId":"tca"}'  where id=id_ca;
  update public.profiles set role='Coach',  academy_id=aid, approved=true,  details='{"memberId":"tca2"}' where id=id_ca2;
  update public.profiles set role='Coach',  academy_id=aid, approved=false, details='{"memberId":"tcu"}'  where id=id_cu;
  update public.profiles set role='Coach',  academy_id=bid, approved=true,  details='{"memberId":"tcb"}'  where id=id_cb;
  update public.profiles set role='Jugador', academy_id=aid, approved=true,
    details='{"memberId":"ta1","profile":{"tutorEmail":"zz-tu@prueba.invalid"}}' where id=id_pa1;
  update public.profiles set role='Jugador', academy_id=aid, approved=true, details='{"memberId":"ta2","profile":{}}' where id=id_pa2;
  update public.profiles set role='Tutor',   academy_id=aid, approved=true, details='{"memberId":"tt1","profile":{"childId":"ta1"}}' where id=id_tu;
  update public.profiles set role='Tutor',   academy_id=aid, approved=true, details='{"memberId":"tt2","profile":{"childId":"ta2"}}' where id=id_tx;
  update public.profiles set role='Jugador', academy_id=null, approved=true, details='{"memberId":"tin","profile":{}}' where id=id_in;

  -- Storage borra solo desde su API; aquí se permite el DELETE directo únicamente dentro de esta prueba.
  perform set_config('storage.allow_delete_query', 'true', true);

  insert into storage.objects (bucket_id, name) values
    ('media', aid::text || '/ta1/avatar.jpg'),                    -- foto de A1
    ('media', aid::text || '/ta2/avatar.jpg'),                    -- foto de A2
    ('media', aid::text || '/ta1/receipts/2026-11.jpg'),          -- comprobante de mensualidad de A1
    ('media', aid::text || '/ta2/receipts/2026-11.jpg'),          -- comprobante de mensualidad de A2
    ('media', aid::text || '/ta1/private/tca/clase.jpg'),         -- comprobante de clase particular de A1 con el coach A
    ('media', aid::text || '/ta1/private/tca/avatar.jpg'),        -- archivo PRIVADO que, por mala suerte, se llama avatar.jpg
    ('media', bid::text || '/tb1/avatar.jpg'),                    -- foto de un jugador de B
    ('media', bid::text || '/tb1/receipts/2026-11.jpg');          -- comprobante de un jugador de B

  -- ============ 0. CONFIGURACIÓN DEL BUCKET ============
  select * into b from storage.buckets where id = 'media';
  res := res || jsonb_build_array(jsonb_build_array('El bucket «media» es privado', 'false', coalesce(b.public::text, 'no existe')));
  res := res || jsonb_build_array(jsonb_build_array('El bucket limita los archivos a 3 MB o menos', 'true', coalesce((b.file_size_limit <= 3145728)::text, 'sin límite')));
  res := res || jsonb_build_array(jsonb_build_array('El bucket solo admite imágenes y PDF (no HTML ni SVG)', 'true',
    coalesce((b.allowed_mime_types <@ array['image/jpeg','image/png','application/pdf'])::text, 'sin restricción')));

  -- ============ 1. JUGADOR A1 ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_pa1,'email','zz-pa1@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects where name = aid::text || '/ta1/receipts/2026-11.jpg'); res := res || jsonb_build_array(jsonb_build_array('Jugador ve su propio comprobante', 1, n));
  n := (select count(*) from storage.objects where name = aid::text || '/ta2/receipts/2026-11.jpg'); res := res || jsonb_build_array(jsonb_build_array('Jugador NO ve el comprobante de otro jugador', 0, n));
  n := (select count(*) from storage.objects where name = aid::text || '/ta2/avatar.jpg');           res := res || jsonb_build_array(jsonb_build_array('Jugador SÍ ve la foto de perfil de su compañero', 1, n));
  n := (select count(*) from storage.objects where name like bid::text || '/%');                     res := res || jsonb_build_array(jsonb_build_array('Jugador NO ve nada de otra academia (ni sus fotos)', 0, n));
  n := (select count(*) from storage.objects where name = aid::text || '/ta1/private/tca/clase.jpg'); res := res || jsonb_build_array(jsonb_build_array('Jugador ve su propio comprobante de clase particular', 1, n));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta1/receipts/2026-12.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador SÍ puede subir archivos a su propia carpeta', 'permitido', got));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta2/receipts/2026-12.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede subir a la carpeta de otro jugador', 'bloqueado', got));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta2/avatar.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede reemplazar la foto de otro jugador', 'bloqueado', got));
  begin insert into storage.objects (bucket_id, name) values ('media', bid::text || '/ta1/receipts/x.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede subir a otra academia', 'bloqueado', got));
  begin insert into storage.objects (bucket_id, name) values ('otro', aid::text || '/ta1/x.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede subir a otro bucket', 'bloqueado', got));
  update storage.objects set name = aid::text || '/ta2/receipts/robado.jpg' where name = aid::text || '/ta2/receipts/2026-11.jpg'; get diagnostics n = row_count;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede cambiar el archivo de otro jugador (filas cambiadas)', 0, n));
  begin update storage.objects set name = aid::text || '/ta2/receipts/colado.jpg' where name = aid::text || '/ta1/receipts/2026-11.jpg'; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede mover su archivo a la carpeta de otro', 'bloqueado', got));
  delete from storage.objects where name = aid::text || '/ta2/receipts/2026-11.jpg'; get diagnostics n = row_count;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede borrar el archivo de otro jugador (filas borradas)', 0, n));
  delete from storage.objects where name = aid::text || '/ta1/receipts/2026-12.jpg'; get diagnostics n = row_count;
  res := res || jsonb_build_array(jsonb_build_array('Jugador SÍ puede borrar sus propios archivos (filas borradas)', 1, n));

  -- ============ 2. JUGADOR A2 ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_pa2,'email','zz-pa2@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects where name like aid::text || '/ta1/receipts/%'); res := res || jsonb_build_array(jsonb_build_array('Otro jugador NO ve los comprobantes de A1', 0, n));
  n := (select count(*) from storage.objects where name like aid::text || '/ta1/private/%' and name not like '%/avatar.jpg'); res := res || jsonb_build_array(jsonb_build_array('Otro jugador NO ve el comprobante de clase particular de A1', 0, n));
  n := (select count(*) from storage.objects where name = aid::text || '/ta1/private/tca/avatar.jpg');
  res := res || jsonb_build_array(jsonb_build_array('Un archivo privado que se llame avatar.jpg NO queda visible para toda la academia', 0, n));

  -- ============ 3. TUTOR DE A1 ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_tu,'email','zz-tu@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects where name = aid::text || '/ta1/receipts/2026-11.jpg'); res := res || jsonb_build_array(jsonb_build_array('Tutor ve el comprobante de su jugador', 1, n));
  n := (select count(*) from storage.objects where name = aid::text || '/ta1/private/tca/clase.jpg'); res := res || jsonb_build_array(jsonb_build_array('Tutor ve el comprobante de clase particular de su jugador', 1, n));
  n := (select count(*) from storage.objects where name = aid::text || '/ta2/receipts/2026-11.jpg'); res := res || jsonb_build_array(jsonb_build_array('Tutor NO ve el comprobante de otro jugador', 0, n));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta1/receipts/tutor.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Tutor NO puede subir archivos a la carpeta de su jugador', 'bloqueado', got));

  -- ============ 4. TUTOR QUE NADIE NOMBRÓ ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_tx,'email','zz-tx@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects where name like aid::text || '/ta2/receipts/%' or name like aid::text || '/ta1/receipts/%'); res := res || jsonb_build_array(jsonb_build_array('Tutor que nadie nombró NO ve ningún comprobante', 0, n));

  -- ============ 5. COACH A (dueño) ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_ca,'email','zz-ca@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects where name like aid::text || '/%'); res := res || jsonb_build_array(jsonb_build_array('Coach ve los 6 archivos de su academia (incluidos los privados de sus propias clases)', 6, n));
  n := (select count(*) from storage.objects where name like bid::text || '/%'); res := res || jsonb_build_array(jsonb_build_array('Coach NO ve archivos de otra academia', 0, n));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta1/receipts/coach.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach SÍ puede subir archivos a la carpeta de un jugador de su academia', 'permitido', got));
  begin insert into storage.objects (bucket_id, name) values ('media', bid::text || '/tb1/receipts/coach.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach NO puede subir a otra academia', 'bloqueado', got));

  -- ============ 6. COACH A2 (otro coach de la misma academia) ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_ca2,'email','zz-ca2@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects where name = aid::text || '/ta1/private/tca/clase.jpg'); res := res || jsonb_build_array(jsonb_build_array('Otro coach NO ve el comprobante de clase particular de su compañero', 0, n));
  n := (select count(*) from storage.objects where name = aid::text || '/ta1/receipts/2026-11.jpg'); res := res || jsonb_build_array(jsonb_build_array('Coach aprobado SÍ ve los comprobantes normales de su academia', 1, n));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta1/private/tca/falso.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Otro coach NO puede subir archivos a la carpeta privada de su compañero', 'bloqueado', got));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta1/private/tca2/clase.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach SÍ puede subir a su propia carpeta privada', 'permitido', got));

  -- ============ 7. COACH SIN APROBAR ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_cu,'email','zz-cu@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects where name like aid::text || '/%' and name not like '%/avatar.jpg'); res := res || jsonb_build_array(jsonb_build_array('Coach sin aprobar NO ve comprobantes de nadie', 0, n));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta1/receipts/intruso.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach sin aprobar NO puede subir archivos a jugadores', 'bloqueado', got));

  -- ============ 8. COACH B (otra academia) ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_cb,'email','zz-cb@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects where name like aid::text || '/%'); res := res || jsonb_build_array(jsonb_build_array('Coach de otra academia NO ve ningún archivo de la academia A', 0, n));
  n := (select count(*) from storage.objects where name like bid::text || '/%'); res := res || jsonb_build_array(jsonb_build_array('Coach de B SÍ ve los archivos de su academia', 2, n));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta1/receipts/b.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach de B NO puede subir a la academia A', 'bloqueado', got));

  -- ============ 9. JUGADOR INDEPENDIENTE ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_in,'email','zz-in@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from storage.objects); res := res || jsonb_build_array(jsonb_build_array('Jugador independiente NO ve ningún archivo de academias', 0, n));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/tin/x.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador independiente NO puede subir a una academia', 'bloqueado', got));

  -- ============ 10. SIN SESIÓN (anon) ============
  reset role; perform set_config('request.jwt.claims', '', true); set local role anon;
  begin n := (select count(*) from storage.objects); got := n::text; exception when others then got := '0'; end;
  res := res || jsonb_build_array(jsonb_build_array('Sin sesión NO ve ningún archivo', '0', got));
  begin insert into storage.objects (bucket_id, name) values ('media', aid::text || '/ta1/anon.jpg'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Sin sesión NO puede subir archivos', 'bloqueado', got));

  -- ============ REPORTE ============
  reset role;
  for x in select value from jsonb_array_elements(res) loop
    if (x->>1) = (x->>2) then
      good := good + 1; rep := rep || E'\n  ok     ' || (x->>0);
    else
      bad := bad + 1;   rep := rep || E'\n  FALLA  ' || (x->>0) || ' (esperado: ' || (x->>1) || ', salió: ' || (x->>2) || ')';
    end if;
  end loop;
  raise exception E'\n\nPRUEBAS DE SEGURIDAD DE ARCHIVOS: % bien, % fallaron.%\n\n(Este ERROR es normal: deshace todo y no deja datos de prueba.)', good, bad, rep;
end $$;
