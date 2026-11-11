-- CORDA · Página web (corda.mx) · Solicitudes de demo
--
-- IMPORTANTE: córrelo en un proyecto de Supabase APARTE del de la app.
-- Así los contactos de ventas no se mezclan con los datos de jugadores.
--
-- Cómo funciona:
--  · La tabla demo_requests guarda cada solicitud del formulario.
--  · Quien visita la página NO puede leer, cambiar ni borrar nada de la tabla.
--  · Solo puede ENVIAR una solicitud, a través de la función submit_demo_request,
--    que revisa los datos y limita el abuso (máx. 3 por correo y 60 en total por hora).
--  · Tú ves las solicitudes en Supabase → Table Editor → demo_requests.
--
-- Se puede correr más de una vez sin romper nada.

create table if not exists public.demo_requests (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  nombre      text not null check (char_length(nombre)   between 1 and 80),
  academia    text not null check (char_length(academia) between 1 and 100),
  ciudad      text not null check (char_length(ciudad)   between 1 and 60),
  puesto      text not null check (char_length(puesto)   between 1 and 40),
  plan        text check (plan is null or char_length(plan) <= 40),
  jugadores   integer check (jugadores is null or jugadores between 1 and 5000),
  correo      text not null check (
                char_length(correo) between 5 and 120
                and correo ~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'
              ),
  telefono    text check (telefono is null or char_length(telefono) <= 30),
  mensaje     text check (mensaje is null or char_length(mensaje) <= 500),
  origen      text not null default 'web',
  -- Para tu seguimiento (los editas tú desde el panel de Supabase):
  estado      text not null default 'nuevo'
              check (estado in ('nuevo', 'contactado', 'demo agendada', 'cerrado', 'descartado')),
  notas       text
);

create index if not exists demo_requests_created_idx on public.demo_requests (created_at desc);
create index if not exists demo_requests_correo_idx  on public.demo_requests (correo, created_at desc);

-- Seguridad: con RLS activo y SIN políticas, nadie puede tocar la tabla directamente.
alter table public.demo_requests enable row level security;
revoke all on table public.demo_requests from anon, authenticated;

-- Única puerta de entrada desde la página: esta función.
create or replace function public.submit_demo_request(
  p_nombre    text,
  p_academia  text,
  p_ciudad    text,
  p_puesto    text,
  p_correo    text,
  p_plan      text    default null,
  p_jugadores integer default null,
  p_telefono  text    default null,
  p_mensaje   text    default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correo text := lower(btrim(coalesce(p_correo, '')));
begin
  -- Tope global contra abuso: 60 solicitudes por hora.
  if (select count(*) from public.demo_requests
       where created_at > now() - interval '1 hour') >= 60 then
    raise exception 'demasiadas solicitudes, intenta más tarde' using errcode = 'P0001';
  end if;

  -- La misma persona: máximo 3 por hora. Las repetidas se ignoran sin error.
  if (select count(*) from public.demo_requests
       where correo = v_correo
         and created_at > now() - interval '1 hour') >= 3 then
    return;
  end if;

  insert into public.demo_requests
    (nombre, academia, ciudad, puesto, plan, jugadores, correo, telefono, mensaje)
  values (
    btrim(coalesce(p_nombre, '')),
    btrim(coalesce(p_academia, '')),
    btrim(coalesce(p_ciudad, '')),
    btrim(coalesce(p_puesto, '')),
    nullif(btrim(coalesce(p_plan, '')), ''),
    p_jugadores,
    v_correo,
    nullif(btrim(coalesce(p_telefono, '')), ''),
    nullif(btrim(coalesce(p_mensaje, '')), '')
  );
end;
$$;

revoke all on function public.submit_demo_request(text, text, text, text, text, text, integer, text, text) from public;
grant execute on function public.submit_demo_request(text, text, text, text, text, text, integer, text, text) to anon;
