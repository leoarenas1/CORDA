-- CORDA · PRUEBAS DE SEGURIDAD de las reglas de Supabase (RLS, códigos de acceso y registro).
-- No es un ajuste: no cambia nada. Sirve para comprobar, con personas inventadas, que:
--   · un jugador no lee datos de otro jugador ni de otra academia, ni puede editar lo que es del coach;
--   · un tutor solo ve al jugador que lo nombró (o al que su código lo ligó);
--   · un coach de otra academia no ve nada, y un coach sin aprobar tampoco;
--   · nadie sin sesión lee nada;
--   · los códigos de acceso funcionan una sola vez, y ni jugadores ni coaches no dueños pueden saltarse las reglas.
--
-- CÓMO CORRERLA: pega todo en Supabase → SQL Editor → New query → Run.
-- Termina SIEMPRE con un mensaje rojo «ERROR» que trae el reporte. Es lo esperado: así Postgres deshace todo
-- y no queda ningún usuario, academia ni dato de prueba. Lee el reporte: cada línea dice ok o FALLA.
-- Se puede correr las veces que quieras (por ejemplo, después de cada ajuste nuevo de seguridad).

do $$
declare
  nil constant uuid := '00000000-0000-0000-0000-000000000000';
  aid uuid; bid uuid; cid uuid;
  id_ca  uuid := gen_random_uuid();  -- coach dueño de la academia A
  id_ca2 uuid := gen_random_uuid();  -- otro coach aprobado de A (no dueño)
  id_cu  uuid := gen_random_uuid();  -- coach de A SIN aprobar
  id_cb  uuid := gen_random_uuid();  -- coach dueño de la academia B
  id_pa1 uuid := gen_random_uuid();  -- jugador 1 de A
  id_pa2 uuid := gen_random_uuid();  -- jugador 2 de A
  id_tu  uuid := gen_random_uuid();  -- tutor de pa1 (pa1 escribió su correo)
  id_tx  uuid := gen_random_uuid();  -- tutor que dice ser de pa2, pero pa2 no lo nombró
  id_pb  uuid := gen_random_uuid();  -- jugador de B
  id_in  uuid := gen_random_uuid();  -- jugador independiente (sin academia)
  n int; got text; res jsonb := '[]'::jsonb; rep text := ''; good int := 0; bad int := 0; x jsonb;
  code1 text; code2 text; code3 text; code4 text; code5 text; codeo text; codeo2 text; codeb text;
  nid uuid; listed jsonb;
begin
  -- ============ PREPARACIÓN (como administrador; todo se deshace al final) ============
  insert into public.academies (name) values ('ZZ_TEST_A') returning id into aid;
  insert into public.academies (name) values ('ZZ_TEST_B') returning id into bid;
  insert into public.academies (name) values ('ZZ_TEST_C') returning id into cid;

  insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data) values
    (id_ca,  nil, 'authenticated', 'authenticated', 'zz-ca@prueba.invalid',  '{"role":"Jugador"}'),
    (id_ca2, nil, 'authenticated', 'authenticated', 'zz-ca2@prueba.invalid', '{"role":"Jugador"}'),
    (id_cu,  nil, 'authenticated', 'authenticated', 'zz-cu@prueba.invalid',  '{"role":"Jugador"}'),
    (id_cb,  nil, 'authenticated', 'authenticated', 'zz-cb@prueba.invalid',  '{"role":"Jugador"}'),
    (id_pa1, nil, 'authenticated', 'authenticated', 'zz-pa1@prueba.invalid', '{"role":"Jugador"}'),
    (id_pa2, nil, 'authenticated', 'authenticated', 'zz-pa2@prueba.invalid', '{"role":"Jugador"}'),
    (id_tu,  nil, 'authenticated', 'authenticated', 'zz-tu@prueba.invalid',  '{"role":"Jugador"}'),
    (id_tx,  nil, 'authenticated', 'authenticated', 'zz-tx@prueba.invalid',  '{"role":"Jugador"}'),
    (id_pb,  nil, 'authenticated', 'authenticated', 'zz-pb@prueba.invalid',  '{"role":"Jugador"}'),
    (id_in,  nil, 'authenticated', 'authenticated', 'zz-in@prueba.invalid',  '{"role":"Jugador"}');

  update public.profiles set role='Coach',  academy_id=aid, approved=true,  name='Coach A',  details='{"memberId":"tca"}'  where id=id_ca;
  update public.profiles set role='Coach',  academy_id=aid, approved=true,  name='Coach A2', details='{"memberId":"tca2"}' where id=id_ca2;
  update public.profiles set role='Coach',  academy_id=aid, approved=false, name='Coach sin aprobar', details='{"memberId":"tcu"}' where id=id_cu;
  update public.profiles set role='Coach',  academy_id=bid, approved=true,  name='Coach B',  details='{"memberId":"tcb"}'  where id=id_cb;
  update public.profiles set role='Jugador', academy_id=aid, approved=true, name='Jugador A1',
    details='{"memberId":"ta1","profile":{"tutorEmail":"zz-tu@prueba.invalid"}}' where id=id_pa1;
  update public.profiles set role='Jugador', academy_id=aid, approved=true, name='Jugador A2', details='{"memberId":"ta2","profile":{}}' where id=id_pa2;
  update public.profiles set role='Tutor',   academy_id=aid, approved=true, name='Tutor de A1', details='{"memberId":"tt1","profile":{"childId":"ta1"}}' where id=id_tu;
  update public.profiles set role='Tutor',   academy_id=aid, approved=true, name='Tutor impostor', details='{"memberId":"tt2","profile":{"childId":"ta2"}}' where id=id_tx;
  update public.profiles set role='Jugador', academy_id=bid, approved=true, name='Jugador B1', details='{"memberId":"tb1","profile":{}}' where id=id_pb;
  update public.profiles set role='Jugador', academy_id=null, approved=true, name='Independiente', details='{"memberId":"tin","profile":{}}' where id=id_in;
  update public.academies set owner_id = id_ca where id = aid;
  update public.academies set owner_id = id_cb where id = bid;

  insert into public.items (academy_id, member_id, kind, key, data) values
    (aid, '',    'plan',            'k1',  '{}'),                      -- plan de toda la academia A
    (aid, 'ta1', 'review',          'r1',  '{}'),                      -- evaluación del jugador A1
    (aid, 'ta2', 'review',          'r2',  '{}'),                      -- evaluación del jugador A2
    (bid, 'tb1', 'review',          'r3',  '{}'),                      -- evaluación del jugador de B
    (aid, '',    'private_book',    'tca', '{}'),                      -- libreta privada del coach A
    (aid, 'ta1', 'private_receipt', 'p1',  '{"coachId":"tca"}'),       -- comprobante de clase particular con el coach A
    (aid, 'ta1', 'wellness',        'w1',  '{"sleepH":7}'),                 -- chequeo de estado físico de A1
    (aid, 'ta2', 'wellness',        'w2',  '{"sleepH":6}');                 -- chequeo de estado físico de A2

  -- ============ 1. JUGADOR A1 ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_pa1,'email','zz-pa1@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items where key='r1');  res := res || jsonb_build_array(jsonb_build_array('Jugador ve su propia evaluación', 1, n));
  n := (select count(*) from public.items where key='r2');  res := res || jsonb_build_array(jsonb_build_array('Jugador NO ve la evaluación de otro jugador', 0, n));
  n := (select count(*) from public.items where key='r3');  res := res || jsonb_build_array(jsonb_build_array('Jugador NO ve datos de otra academia', 0, n));
  n := (select count(*) from public.items where key='k1');  res := res || jsonb_build_array(jsonb_build_array('Jugador ve el plan de su academia', 1, n));
  n := (select count(*) from public.items where kind='private_book'); res := res || jsonb_build_array(jsonb_build_array('Jugador NO ve la libreta privada del coach', 0, n));
  n := (select count(*) from public.items);                 res := res || jsonb_build_array(jsonb_build_array('Jugador ve solo 4 datos (plan, su evaluación, su comprobante, su chequeo)', 4, n));
  n := (select count(*) from public.profiles);              res := res || jsonb_build_array(jsonb_build_array('Jugador solo ve su propio perfil', 1, n));
  begin update public.profiles set role='Coach' where id=id_pa1; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede volverse Coach', 'bloqueado', got));
  begin update public.profiles set academy_id=bid where id=id_pa1; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede cambiarse de academia', 'bloqueado', got));
  begin update public.profiles set approved=true, linked_child='ta2' where id=id_pa1; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede cambiar su aprobación ni jugador ligado', 'bloqueado', got));
  begin update public.profiles set details = jsonb_set(details, '{memberId}', '"ta2"') where id=id_pa1; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede cambiarse el memberId para hacerse pasar por otro jugador', 'bloqueado', got));
  begin update public.profiles set details = jsonb_set(details, '{profile,tutorEmail}', '"otro@prueba.invalid"') where id=id_pa1; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador SÍ puede editar el resto de su perfil (por ejemplo el correo de su tutor)', 'permitido', got));
  update public.profiles set details = jsonb_set(details, '{profile,tutorEmail}', '"zz-tu@prueba.invalid"') where id=id_pa1;
  n := (select count(*) from public.items where key='w2'); res := res || jsonb_build_array(jsonb_build_array('Jugador NO ve el chequeo de estado físico de otro jugador', 0, n));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'ta1','wellness','w9'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador SÍ puede guardar su propio chequeo de estado físico', 'permitido', got));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'ta2','wellness','w8'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede escribir el chequeo de otro jugador', 'bloqueado', got));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'ta1','review','nuevo'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede escribirse una evaluación', 'bloqueado', got));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'ta1','goal','g1'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador SÍ puede guardar su propia meta', 'permitido', got));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'ta2','goal','g2'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede escribir datos de otro jugador', 'bloqueado', got));
  begin insert into public.items (academy_id, member_id, kind, key) values (bid,'ta1','goal','g3'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede escribir en otra academia', 'bloqueado', got));
  update public.items set data='{"x":1}' where key='r1';  get diagnostics n = row_count;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede editar su evaluación (filas cambiadas)', 0, n));
  delete from public.items where key in ('r1','r2','k1'); get diagnostics n = row_count;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede borrar evaluaciones ni el plan (filas borradas)', 0, n));
  begin perform public.create_access_code('Jugador','Fulano'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede crear códigos de acceso', 'bloqueado', got));
  begin perform count(*) from public.access_codes; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador NO puede leer la tabla de códigos', 'bloqueado', got));
  got := (public.list_access_codes())::text;
  res := res || jsonb_build_array(jsonb_build_array('Jugador recibe la lista de códigos vacía', '[]', got));

  -- ============ 2. JUGADOR A2 ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_pa2,'email','zz-pa2@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items where key='r1'); res := res || jsonb_build_array(jsonb_build_array('Otro jugador de la academia NO ve la evaluación de A1', 0, n));
  n := (select count(*) from public.items where key='p1'); res := res || jsonb_build_array(jsonb_build_array('Otro jugador NO ve el comprobante de A1', 0, n));

  -- ============ 3. TUTOR de A1 ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_tu,'email','zz-tu@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items where key='r1'); res := res || jsonb_build_array(jsonb_build_array('Tutor ve la evaluación de su jugador', 1, n));
  n := (select count(*) from public.items where key='r2'); res := res || jsonb_build_array(jsonb_build_array('Tutor NO ve la evaluación de otro jugador', 0, n));
  n := (select count(*) from public.items where key='w1'); res := res || jsonb_build_array(jsonb_build_array('Tutor ve el chequeo de estado físico de su jugador', 1, n));
  n := (select count(*) from public.profiles);             res := res || jsonb_build_array(jsonb_build_array('Tutor ve su perfil y el de su jugador (2)', 2, n));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'ta1','review','t1'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Tutor NO puede escribir evaluaciones', 'bloqueado', got));

  -- ============ 4. TUTOR IMPOSTOR (dice ser de A2, pero A2 no lo nombró) ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_tx,'email','zz-tx@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items where key in ('r1','r2')); res := res || jsonb_build_array(jsonb_build_array('Tutor que nadie nombró NO ve a ningún jugador', 0, n));
  n := (select count(*) from public.profiles);                       res := res || jsonb_build_array(jsonb_build_array('Tutor que nadie nombró solo ve su perfil', 1, n));

  -- ============ 5. COACH A (dueño) ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_ca,'email','zz-ca@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items);                res := res || jsonb_build_array(jsonb_build_array('Coach ve los 9 datos de su academia (con su libreta, comprobante, meta y chequeos de estado físico)', 9, n));
  n := (select count(*) from public.items where key='r3'); res := res || jsonb_build_array(jsonb_build_array('Coach NO ve datos de otra academia', 0, n));
  n := (select count(*) from public.profiles);             res := res || jsonb_build_array(jsonb_build_array('Coach ve los 7 perfiles de su academia y ninguno de otra', 7, n));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'ta1','review','c1'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach SÍ puede escribir una evaluación en su academia', 'permitido', got));
  begin insert into public.items (academy_id, member_id, kind, key) values (bid,'tb1','review','c2'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach NO puede escribir en otra academia', 'bloqueado', got));
  code1 := public.create_access_code('Jugador', 'Jugador Nuevo', 'LA00001');
  code2 := public.create_access_code('Coach', 'Coach Nuevo');
  code3 := public.create_access_code('Jugador', 'Para rol equivocado');
  code4 := public.create_access_code('Jugador', 'Se revocará');
  code5 := public.create_access_code('Jugador', 'Se vencerá');
  -- (si el coach dueño no pudiera crear estos códigos, el script se detendría aquí con un error distinto)
  begin perform public.create_owner_code('ZZ_TEST_A','x'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Ni el dueño puede crear códigos de dueño desde la app', 'bloqueado', got));

  -- ============ 6. COACH A2 (aprobado, no dueño) ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_ca2,'email','zz-ca2@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items where key='p1');           res := res || jsonb_build_array(jsonb_build_array('Otro coach NO ve el comprobante privado de clase de su compañero', 0, n));
  n := (select count(*) from public.items where kind='private_book'); res := res || jsonb_build_array(jsonb_build_array('Otro coach NO ve la libreta privada de su compañero', 0, n));
  n := (select count(*) from public.items where key='r1');           res := res || jsonb_build_array(jsonb_build_array('Coach aprobado SÍ ve las evaluaciones de su academia', 1, n));
  begin perform public.create_access_code('Coach','Intruso'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach que no es dueño NO puede crear códigos de Coach', 'bloqueado', got));
  begin perform public.create_access_code('Jugador','Alumno'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach que no es dueño SÍ puede crear códigos de Jugador', 'permitido', got));

  -- ============ 7. COACH SIN APROBAR ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_cu,'email','zz-cu@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items where key in ('r1','r2','p1','tca')); res := res || jsonb_build_array(jsonb_build_array('Coach sin aprobar NO ve evaluaciones ni datos privados', 0, n));
  n := (select count(*) from public.profiles);                                  res := res || jsonb_build_array(jsonb_build_array('Coach sin aprobar solo ve su propio perfil', 1, n));
  begin perform public.create_access_code('Jugador','Intruso'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach sin aprobar NO puede crear códigos', 'bloqueado', got));

  -- ============ 8. COACH B (otra academia) ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_cb,'email','zz-cb@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items where academy_id = aid); res := res || jsonb_build_array(jsonb_build_array('Coach de otra academia NO ve nada de la academia A', 0, n));
  n := (select count(*) from public.items where key='r3');         res := res || jsonb_build_array(jsonb_build_array('Coach de B SÍ ve lo de su propia academia', 1, n));
  n := (select count(*) from public.profiles);                     res := res || jsonb_build_array(jsonb_build_array('Coach de B ve solo los 2 perfiles de su academia', 2, n));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'','plan','x1'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach de B NO puede escribir en la academia A', 'bloqueado', got));
  codeb := public.create_access_code('Jugador', 'Codigo de B');
  n := (select count(*) from jsonb_array_elements(public.list_access_codes()) e where e->>'label' = 'Jugador Nuevo');
  res := res || jsonb_build_array(jsonb_build_array('Coach de B NO ve los códigos de la academia A', 0, n));

  -- ============ 9. COACH A otra vez: no ve los códigos de B ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_ca,'email','zz-ca@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from jsonb_array_elements(public.list_access_codes()) e where e->>'label' = 'Codigo de B');
  res := res || jsonb_build_array(jsonb_build_array('Coach de A NO ve los códigos de la academia B', 0, n));
  n := (select count(*) from jsonb_array_elements(public.list_access_codes()) e where e->>'label' = 'Jugador Nuevo');
  res := res || jsonb_build_array(jsonb_build_array('Coach de A SÍ ve los códigos de su academia', 1, n));

  -- ============ 10. JUGADOR INDEPENDIENTE (sin academia) ============
  reset role; perform set_config('request.jwt.claims', json_build_object('sub',id_in,'email','zz-in@prueba.invalid','role','authenticated')::text, true); set local role authenticated;
  n := (select count(*) from public.items);    res := res || jsonb_build_array(jsonb_build_array('Jugador independiente NO ve ningún dato de academias', 0, n));
  n := (select count(*) from public.profiles); res := res || jsonb_build_array(jsonb_build_array('Jugador independiente solo ve su propio perfil', 1, n));
  begin insert into public.items (academy_id, member_id, kind, key) values (aid,'tin','goal','i1'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador independiente NO puede escribir en una academia', 'bloqueado', got));

  -- ============ 11. SIN SESIÓN (anon) ============
  reset role; perform set_config('request.jwt.claims', '', true); set local role anon;
  begin perform count(*) from public.items; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Sin sesión NO puede leer datos', 'bloqueado', got));
  begin perform count(*) from public.profiles; got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Sin sesión NO puede leer perfiles', 'bloqueado', got));
  begin perform public.list_access_codes(); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Sin sesión NO puede listar códigos', 'bloqueado', got));
  begin perform public.create_access_code('Jugador','x'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Sin sesión NO puede crear códigos', 'bloqueado', got));
  begin perform public.create_owner_code('ZZ_TEST_A','x'); got:='permitido'; exception when others then got:='bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Sin sesión NO puede crear códigos de dueño', 'bloqueado', got));
  got := coalesce((public.check_access_code('XXXX-XXXX'))::text, 'nulo');
  res := res || jsonb_build_array(jsonb_build_array('Un código inventado no revela nada', 'nulo', got));
  got := coalesce(public.check_access_code(code1)->>'role', 'nulo');
  res := res || jsonb_build_array(jsonb_build_array('Un código válido solo revela perfil, academia y nombre (sin sesión)', 'Jugador', got));

  -- ============ 12. REGISTRO CON CÓDIGO (como lo hace Supabase al crear la cuenta) ============
  reset role; perform set_config('request.jwt.claims', '', true);
  update public.access_codes set revoked = true where code = public.normalize_code(code4);
  update public.access_codes set expires_at = now() - interval '1 day' where code = public.normalize_code(code5);
  codeo  := public.create_owner_code('ZZ_TEST_A', 'Dueño nuevo de A');
  codeo2 := public.create_owner_code('ZZ_TEST_C', 'Dueño de C');

  nid := gen_random_uuid();
  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (nid, nil, 'authenticated', 'authenticated', 'zz-n1@prueba.invalid', jsonb_build_object('role','Jugador','academy','ZZ_TEST_B','code',code1));
    got := (select academy_id::text || '/' || approved::text from public.profiles where id = nid);
  exception when others then got := 'error'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador con código de A entra a A (aunque en el registro diga academia B)', aid::text || '/true', got));

  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (gen_random_uuid(), nil, 'authenticated', 'authenticated', 'zz-n2@prueba.invalid', jsonb_build_object('role','Jugador','code',code1));
    got := 'permitido';
  exception when others then got := 'bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Un código ya usado NO sirve otra vez', 'bloqueado', got));

  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (gen_random_uuid(), nil, 'authenticated', 'authenticated', 'zz-n3@prueba.invalid', jsonb_build_object('role','Coach','code',code3));
    got := 'permitido';
  exception when others then got := 'bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Un código de Jugador NO sirve para registrarse como Coach', 'bloqueado', got));

  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (gen_random_uuid(), nil, 'authenticated', 'authenticated', 'zz-n4@prueba.invalid', jsonb_build_object('role','Coach','academy','ZZ_TEST_A'));
    got := 'permitido';
  exception when others then got := 'bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach sin código NO puede registrarse', 'bloqueado', got));

  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (gen_random_uuid(), nil, 'authenticated', 'authenticated', 'zz-n5@prueba.invalid', jsonb_build_object('role','Tutor','academy','ZZ_TEST_A'));
    got := 'permitido';
  exception when others then got := 'bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Tutor sin código NO puede registrarse', 'bloqueado', got));

  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (gen_random_uuid(), nil, 'authenticated', 'authenticated', 'zz-n6@prueba.invalid', jsonb_build_object('role','Jugador','code',code4));
    got := 'permitido';
  exception when others then got := 'bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Un código revocado NO sirve', 'bloqueado', got));

  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (gen_random_uuid(), nil, 'authenticated', 'authenticated', 'zz-n7@prueba.invalid', jsonb_build_object('role','Jugador','code',code5));
    got := 'permitido';
  exception when others then got := 'bloqueado'; end;
  res := res || jsonb_build_array(jsonb_build_array('Un código vencido NO sirve', 'bloqueado', got));

  nid := gen_random_uuid();
  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (nid, nil, 'authenticated', 'authenticated', 'zz-n8@prueba.invalid', jsonb_build_object('role','Jugador','academy','ZZ_TEST_A'));
    got := coalesce((select academy_id::text from public.profiles where id = nid), 'sin academia');
  exception when others then got := 'error'; end;
  res := res || jsonb_build_array(jsonb_build_array('Jugador sin código queda SIN academia (aunque escriba la de A)', 'sin academia', got));

  nid := gen_random_uuid();
  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (nid, nil, 'authenticated', 'authenticated', 'zz-n9@prueba.invalid', jsonb_build_object('role','Coach','code',code2));
    got := (select role::text || '/' || approved::text || '/' || (academy_id = aid)::text from public.profiles where id = nid);
  exception when others then got := 'error'; end;
  res := res || jsonb_build_array(jsonb_build_array('Coach con código de Coach entra aprobado a su academia', 'Coach/true/true', got));

  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (gen_random_uuid(), nil, 'authenticated', 'authenticated', 'zz-n10@prueba.invalid', jsonb_build_object('role','Coach','code',codeo));
  exception when others then null; end;
  got := (select (owner_id = id_ca)::text from public.academies where id = aid);
  res := res || jsonb_build_array(jsonb_build_array('Un código de dueño NO le quita la academia a su dueño actual', 'true', got));

  nid := gen_random_uuid();
  begin
    insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (nid, nil, 'authenticated', 'authenticated', 'zz-n11@prueba.invalid', jsonb_build_object('role','Coach','code',codeo2));
  exception when others then null; end;
  got := (select (owner_id = nid)::text from public.academies where id = cid);
  res := res || jsonb_build_array(jsonb_build_array('Con el código de dueño, una academia sin dueño lo estrena', 'true', got));

  -- ============ REPORTE ============
  for x in select value from jsonb_array_elements(res) loop
    if (x->>1) = (x->>2) then
      good := good + 1; rep := rep || E'\n  ok     ' || (x->>0);
    else
      bad := bad + 1;   rep := rep || E'\n  FALLA  ' || (x->>0) || ' (esperado: ' || (x->>1) || ', salió: ' || (x->>2) || ')';
    end if;
  end loop;
  raise exception E'\n\nPRUEBAS DE SEGURIDAD: % bien, % fallaron.%\n\n(Este ERROR es normal: deshace todo y no deja datos de prueba.)', good, bad, rep;
end $$;
