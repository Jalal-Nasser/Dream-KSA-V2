-- =========================================================
-- Dreams KSA: SAFE schema for rooms & room_participants
-- - Adds columns only if missing
-- - Enables RLS
-- - Creates policies via DO blocks (no "IF NOT EXISTS" syntax errors)
-- - Supports roles: 'host','owner','speaker','listener' (owner kept for backward-compat)
-- =========================================================

-- ---------- Rooms table (non-destructive) ----------
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  title text,
  owner_id uuid,
  host_id uuid,
  created_at timestamptz default now()
);

-- Make sure columns exist (no drops)
alter table public.rooms
  add column if not exists title text,
  add column if not exists owner_id uuid,
  add column if not exists host_id uuid,
  add column if not exists created_at timestamptz default now();

-- Optional FKs (skip if you prefer no cross-schema refs)
do $$
begin
  -- owner_id → auth.users
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.rooms'::regclass 
      and contype = 'f' 
      and conname = 'rooms_owner_id_fkey'
  ) then
    alter table public.rooms
      add constraint rooms_owner_id_fkey
      foreign key (owner_id) references auth.users(id) on delete set null;
  end if;

  -- host_id → auth.users
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.rooms'::regclass 
      and contype = 'f' 
      and conname = 'rooms_host_id_fkey'
  ) then
    alter table public.rooms
      add constraint rooms_host_id_fkey
      foreign key (host_id) references auth.users(id) on delete set null;
  end if;
end$$;

-- ---------- Participants table (non-destructive) ----------
create table if not exists public.room_participants (
  room_id uuid not null,
  user_id uuid not null,
  role text not null default 'listener',
  hand_raised boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- Ensure columns exist
alter table public.room_participants
  add column if not exists room_id uuid,
  add column if not exists user_id uuid,
  add column if not exists role text default 'listener',
  add column if not exists hand_raised boolean default false,
  add column if not exists joined_at timestamptz default now();

-- FKs (safe-add)
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.room_participants'::regclass 
      and conname = 'room_participants_room_id_fkey'
  ) then
    alter table public.room_participants
      add constraint room_participants_room_id_fkey
      foreign key (room_id) references public.rooms(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.room_participants'::regclass 
      and conname = 'room_participants_user_id_fkey'
  ) then
    alter table public.room_participants
      add constraint room_participants_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end$$;

-- Role CHECK supports host + owner for backward-compat
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.room_participants'::regclass
      and conname = 'room_participants_role_check'
  ) then
    alter table public.room_participants
      add constraint room_participants_role_check
      check (role in ('host','owner','speaker','listener'));
  end if;
end$$;

-- ---------- RLS ----------
alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;

-- ---------- Policies (safe DO-block creations) ----------

-- rooms: SELECT for authenticated
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='rooms' and policyname='rooms_select_auth'
  ) then
    create policy rooms_select_auth
      on public.rooms for select
      to authenticated
      using (true);
  end if;
end$$;

-- rooms: INSERT only when creator is owner AND host (both set to auth user)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='rooms' and policyname='rooms_insert_self'
  ) then
    create policy rooms_insert_self
      on public.rooms for insert
      to authenticated
      with check (owner_id = auth.uid() and host_id = auth.uid());
  end if;
end$$;

-- room_participants: SELECT for authenticated
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_select_auth'
  ) then
    create policy rp_select_auth
      on public.room_participants for select
      to authenticated
      using (true);
  end if;
end$$;

-- room_participants: INSERT/UPDATE/DELETE only by the same user_id
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_insert_self'
  ) then
    create policy rp_insert_self
      on public.room_participants for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_update_self'
  ) then
    create policy rp_update_self
      on public.room_participants for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_delete_self'
  ) then
    create policy rp_delete_self
      on public.room_participants for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end$$;

-- ---------- (Optional) quick verification ----------
-- select tablename, policyname, cmd, roles from pg_policies
-- where schemaname='public' and tablename in ('rooms','room_participants')
-- order by tablename, policyname;

-- =========================================================
-- Dreams KSA: SAFE schema for rooms & room_participants
-- - Adds columns only if missing
-- - Enables RLS
-- - Creates policies via DO blocks (no "IF NOT EXISTS" syntax errors)
-- - Supports roles: 'host','owner','speaker','listener' (owner kept for backward-compat)
-- =========================================================

-- ---------- Rooms table (non-destructive) ----------
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  title text,
  owner_id uuid,
  host_id uuid,
  created_at timestamptz default now()
);

-- Make sure columns exist (no drops)
alter table public.rooms
  add column if not exists title text,
  add column if not exists owner_id uuid,
  add column if not exists host_id uuid,
  add column if not exists created_at timestamptz default now();

-- Optional FKs (skip if you prefer no cross-schema refs)
do $$
begin
  -- owner_id → auth.users
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.rooms'::regclass 
      and contype = 'f' 
      and conname = 'rooms_owner_id_fkey'
  ) then
    alter table public.rooms
      add constraint rooms_owner_id_fkey
      foreign key (owner_id) references auth.users(id) on delete set null;
  end if;

  -- host_id → auth.users
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.rooms'::regclass 
      and contype = 'f' 
      and conname = 'rooms_host_id_fkey'
  ) then
    alter table public.rooms
      add constraint rooms_host_id_fkey
      foreign key (host_id) references auth.users(id) on delete set null;
  end if;
end$$;

-- ---------- Participants table (non-destructive) ----------
create table if not exists public.room_participants (
  room_id uuid not null,
  user_id uuid not null,
  role text not null default 'listener',
  hand_raised boolean not null default false,
  joined_at timestamptz not null default now(),
  primary key (room_id, user_id)
);

-- Ensure columns exist
alter table public.room_participants
  add column if not exists room_id uuid,
  add column if not exists user_id uuid,
  add column if not exists role text default 'listener',
  add column if not exists hand_raised boolean default false,
  add column if not exists joined_at timestamptz default now();

-- FKs (safe-add)
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.room_participants'::regclass 
      and conname = 'room_participants_room_id_fkey'
  ) then
    alter table public.room_participants
      add constraint room_participants_room_id_fkey
      foreign key (room_id) references public.rooms(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.room_participants'::regclass 
      and conname = 'room_participants_user_id_fkey'
  ) then
    alter table public.room_participants
      add constraint room_participants_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end$$;

-- Role CHECK supports host + owner for backward-compat
do $$
begin
  if not exists (
    select 1 from pg_constraint 
    where conrelid = 'public.room_participants'::regclass
      and conname = 'room_participants_role_check'
  ) then
    alter table public.room_participants
      add constraint room_participants_role_check
      check (role in ('host','owner','speaker','listener'));
  end if;
end$$;

-- ---------- RLS ----------
alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;

-- ---------- Policies (safe DO-block creations) ----------

-- rooms: SELECT for authenticated
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='rooms' and policyname='rooms_select_auth'
  ) then
    create policy rooms_select_auth
      on public.rooms for select
      to authenticated
      using (true);
  end if;
end$$;

-- rooms: INSERT only when creator is owner AND host (both set to auth user)
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='rooms' and policyname='rooms_insert_self'
  ) then
    create policy rooms_insert_self
      on public.rooms for insert
      to authenticated
      with check (owner_id = auth.uid() and host_id = auth.uid());
  end if;
end$$;

-- room_participants: SELECT for authenticated
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_select_auth'
  ) then
    create policy rp_select_auth
      on public.room_participants for select
      to authenticated
      using (true);
  end if;
end$$;

-- room_participants: INSERT/UPDATE/DELETE only by the same user_id
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_insert_self'
  ) then
    create policy rp_insert_self
      on public.room_participants for insert
      to authenticated
      with check (user_id = auth.uid());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_update_self'
  ) then
    create policy rp_update_self
      on public.room_participants for update
      to authenticated
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;
end$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_delete_self'
  ) then
    create policy rp_delete_self
      on public.room_participants for delete
      to authenticated
      using (user_id = auth.uid());
  end if;
end$$;

-- ---------- (Optional) quick verification ----------
-- select tablename, policyname, cmd, roles from pg_policies
-- where schemaname='public' and tablename in ('rooms','room_participants')
-- order by tablename, policyname;


