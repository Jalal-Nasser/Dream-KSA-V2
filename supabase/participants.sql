-- Tables
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  title text,
  owner_id uuid not null,
  host_id uuid not null,
  created_at timestamp with time zone default now()
);

create table if not exists public.room_participants (
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'listener' check (role in ('host','speaker','listener')),
  hand_raised boolean not null default false,
  joined_at timestamp with time zone not null default now(),
  primary key (room_id, user_id)
);

-- RLS
alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;

-- Policies
do $$ begin
  perform 1;
exception when undefined_object then
  -- in case extension not available, ignore
  null;
end $$;

-- rooms: read for all authenticated
create policy if not exists rooms_select_auth
  on public.rooms for select
  to authenticated
  using (true);

-- rooms: insert by owner/host only for their own id
create policy if not exists rooms_insert_self
  on public.rooms for insert
  to authenticated
  with check (owner_id = auth.uid() and host_id = auth.uid());

-- room_participants: user can insert/select/update own membership
create policy if not exists rp_select_auth
  on public.room_participants for select
  to authenticated
  using (true);

create policy if not exists rp_insert_self
  on public.room_participants for insert
  to authenticated
  with check (user_id = auth.uid());

create policy if not exists rp_update_self
  on public.room_participants for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy if not exists rp_delete_self
  on public.room_participants for delete
  to authenticated
  using (user_id = auth.uid());


