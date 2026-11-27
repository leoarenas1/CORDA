-- CORDA · Ajuste 25: academia de pruebas para probar con gente real (coach, jugador y tutor).
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Pasos (el 1 y el 2 se hacen aquí; lo demás, dentro de la app):
--   1. Corre este archivo: crea la academia «CORDA Pruebas».
--   2. En otra consulta, crea tu código de dueño (vence en 7 días, un solo uso):
--        select public.create_owner_code('CORDA Pruebas', 'Leonardo Arenas');
--      Te da algo como K7M2-9QXH.
--   3. En la app: Registrarme → Coach → escribe ese código. Quedas como dueño de «CORDA Pruebas».
--      Usa un correo distinto al de tu cuenta de Mouratoglou (por ejemplo nombre+pruebas@gmail.com).
--   4. En el Panel aparece la tarjeta «Academia de pruebas»: «Cargar datos de ejemplo» y «Hoja de códigos».
--
-- Nota: el nombre de la academia aparece en la lista pública de academias al registrarse. No afecta el contador de fundadoras (fundadora = false).

insert into public.academies (name) select 'CORDA Pruebas' where not exists (select 1 from public.academies where name = 'CORDA Pruebas');
update public.academies set fundadora = false where name = 'CORDA Pruebas';
