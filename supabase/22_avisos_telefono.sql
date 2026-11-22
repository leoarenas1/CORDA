-- CORDA · Avisos al teléfono (notificaciones push) · Paso 1 de 2: tablas y reglas.
-- Pega todo en Supabase → SQL Editor → New query → Run. Se puede correr más de una vez.
--
-- Qué crea:
--   push_subscriptions  los teléfonos que activaron avisos (uno por teléfono, ligado a una cuenta)
--   push_sent           registro de lo ya enviado, para no mandar el mismo aviso dos veces
--   push_config         dirección y clave de la función que envía (se llena en el paso 2)
-- Seguridad: las tres tienen RLS. Desde la app solo se puede registrar o dar de baja el propio teléfono.

-- 1. Teléfonos con avisos activados -------------------------------------------------
create table if not exists public.push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index if not exists push_subscriptions_user on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;

drop policy if exists "push: ver los mios" on public.push_subscriptions;
create policy "push: ver los mios" on public.push_subscriptions for select to authenticated using (user_id = auth.uid());
drop policy if exists "push: borrar los mios" on public.push_subscriptions;
create policy "push: borrar los mios" on public.push_subscriptions for delete to authenticated using (user_id = auth.uid());

-- Registrar este teléfono para la cuenta que tiene la sesión. Si el teléfono ya estaba ligado a otra cuenta, pasa a esta.
create or replace function public.register_push(p_endpoint text, p_p256dh text, p_auth text, p_ua text default '')
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Necesitas iniciar sesión.'; end if;
  if coalesce(p_endpoint, '') = '' or coalesce(p_p256dh, '') = '' or coalesce(p_auth, '') = '' then
    raise exception 'Faltan datos del teléfono.';
  end if;
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values (auth.uid(), p_endpoint, p_p256dh, p_auth, left(coalesce(p_ua, ''), 300))
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
        user_agent = excluded.user_agent, created_at = now();
end $$;

create or replace function public.unregister_push(p_endpoint text)
returns void language sql security definer set search_path = public as $$
  delete from public.push_subscriptions where endpoint = p_endpoint and user_id = auth.uid()
$$;

revoke execute on function public.register_push(text, text, text, text), public.unregister_push(text) from public, anon;
grant  execute on function public.register_push(text, text, text, text), public.unregister_push(text) to authenticated;

-- 2. Lo ya enviado (solo lo usa la función, con la llave de servicio) --------------------
create table if not exists public.push_sent (
  dedupe  text primary key,
  sent_at timestamptz not null default now()
);
alter table public.push_sent enable row level security;      -- sin reglas: nadie la ve desde la app

-- 3. Dirección y clave de la función (se llenan en el paso 2) ----------------------------
create table if not exists public.push_config (
  id     int primary key default 1 check (id = 1),
  url    text not null,
  secret text not null
);
alter table public.push_config enable row level security;    -- sin reglas: nadie la ve desde la app

-- 4. Si se borra una cuenta, se borran sus teléfonos (ya lo hace el on delete cascade de arriba).
select 'Listo: ' || (select count(*) from public.push_subscriptions) || ' teléfonos registrados' as resultado;
