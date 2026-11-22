-- CORDA · Avisos al teléfono · Paso 2 de 2: programar la función para que corra cada 5 minutos.
-- ANTES de correr esto: (a) la función «enviar-avisos» ya está publicada y (b) cambiaste los dos textos marcados con  ◄◄.
-- Pega todo en Supabase → SQL Editor → New query → Run.

create extension if not exists pg_net;
create extension if not exists pg_cron;

-- Dirección de tu función y la clave secreta (la misma que pusiste como CORDA_PUSH_SECRET).
insert into public.push_config (id, url, secret)
values (1,
  'https://fdscfjykdazkqknguzim.supabase.co/functions/v1/enviar-avisos',
  'PEGA_AQUI_TU_CLAVE_SECRETA'                                        -- ◄◄ cambia este texto
)
on conflict (id) do update set url = excluded.url, secret = excluded.secret;

-- Cada 5 minutos Supabase llama a la función.
select cron.unschedule(jobid) from cron.job where jobname = 'corda-avisos';
select cron.schedule('corda-avisos', '*/5 * * * *', $job$
  select net.http_post(
    url     := c.url,
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-corda-secret', c.secret),
    body    := '{}'::jsonb,
    timeout_milliseconds := 20000
  ) from public.push_config c where c.id = 1
$job$);

select jobname, schedule from cron.job where jobname = 'corda-avisos';

-- ---------------------------------------------------------------------------------------------
-- PRUEBA (opcional): manda una notificación «Prueba de CORDA» a todos los teléfonos registrados.
-- Corre solo este bloque, después de activar avisos en tu teléfono desde la campana de la app:
--
--   select net.http_post(url := c.url || '?prueba=1',
--                        headers := jsonb_build_object('x-corda-secret', c.secret),
--                        body := '{}'::jsonb)
--   from public.push_config c where c.id = 1;
--
-- PARA APAGAR los avisos programados:  select cron.unschedule('corda-avisos');
