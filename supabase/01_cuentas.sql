-- CORDA · Fase A: cuentas reales
-- Pega todo este archivo en Supabase → SQL Editor → New query → Run.
-- Crea las academias y un perfil por cada persona que se registra (correo, nombre, rol y academia).
-- Seguridad: cada tabla tiene RLS activado; nadie ve ni cambia datos que no le corresponden.

-- 1. Academias ---------------------------------------------------------------
create table if not exists public.academies (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);
alter table public.academies enable row level security;

-- Cualquiera con sesión puede ver la lista (para elegir su academia al registrarse).
-- Nadie la modifica desde la app: las academias se dan de alta aquí, en SQL.
drop policy if exists "academias visibles con sesion" on public.academies;
create policy "academias visibles con sesion" on public.academies
  for select to authenticated using (true);

insert into public.academies (name)
values ('Mouratoglou Tennis Center Guadalajara')
on conflict (name) do nothing;

-- 2. Perfiles ----------------------------------------------------------------
do $$ begin
  create type public.corda_role as enum ('Jugador', 'Coach', 'Tutor');
exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text not null,
  name       text not null default '',
  role       public.corda_role not null default 'Jugador',
  academy_id uuid references public.academies (id),
  -- Meta, nivel, mano dominante, raqueta, foto, etc. (lo que hoy guarda state.profile)
  details    jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

-- Academia de quien tiene la sesión (security definer para no chocar con RLS).
create or replace function public.my_academy()
returns uuid language sql stable security definer set search_path = public as $$
  select academy_id from public.profiles where id = auth.uid()
$$;

drop policy if exists "ver mi perfil y los de mi academia" on public.profiles;
create policy "ver mi perfil y los de mi academia" on public.profiles
  for select to authenticated
  using (id = auth.uid() or (academy_id is not null and academy_id = public.my_academy()));

drop policy if exists "editar solo mi perfil" on public.profiles;
create policy "editar solo mi perfil" on public.profiles
  for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());

-- 3. Perfil automático al registrarse -----------------------------------------
-- La app manda nombre, rol, academia y la copia del perfil (details) como metadata del registro.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  wanted_role public.corda_role;
begin
  wanted_role := case new.raw_user_meta_data->>'role'
    when 'Coach' then 'Coach'::public.corda_role
    when 'Tutor' then 'Tutor'::public.corda_role
    else 'Jugador'::public.corda_role end;
  insert into public.profiles (id, email, name, role, academy_id, details)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', ''),
    wanted_role,
    (select id from public.academies where name = new.raw_user_meta_data->>'academy'),
    case when jsonb_typeof(new.raw_user_meta_data->'details') = 'object'
      then new.raw_user_meta_data->'details' else '{}'::jsonb end
  );
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Nadie puede cambiarse el rol, el correo ni el id desde la app ---------------
-- (Evita que un jugador se haga "Coach" por su cuenta. Los cambios de rol se hacen aquí, en SQL.)
create or replace function public.protect_profile_fields()
returns trigger language plpgsql as $$
begin
  -- auth.uid() solo existe cuando el cambio viene de la app; en el SQL Editor es null y sí se permite.
  if auth.uid() is not null and (new.id <> old.id or new.email <> old.email or new.role <> old.role) then
    raise exception 'Ese dato no se puede cambiar desde la app.';
  end if;
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists protect_profile on public.profiles;
create trigger protect_profile
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- 5. Permisos del Data API -----------------------------------------------------
-- El proyecto se creó sin "exponer tablas automáticamente": aquí se abre solo lo necesario.
-- Visitantes sin sesión (anon) no tienen acceso a nada; RLS decide qué filas ve cada usuario.
revoke all on public.academies, public.profiles from anon;
grant select on public.academies to authenticated;
grant select, update on public.profiles to authenticated;
revoke execute on function public.my_academy() from public, anon;
grant execute on function public.my_academy() to authenticated;
revoke execute on function public.handle_new_user() from public, anon, authenticated;
