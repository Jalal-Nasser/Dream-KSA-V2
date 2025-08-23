-- Ensure UUID generation is available
create extension if not exists "uuid-ossp";

-- 1) room_participants.mic_status (none/requested/granted)
alter table if exists public.room_participants
  add column if not exists mic_status text
  check (mic_status in ('none','requested','granted'))
  default 'none';

-- 2) mic_requests table (the raise-hand queue)
create table if not exists public.mic_requests (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null check (status in ('pending','approved','denied','revoked')) default 'pending',
  approved_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Uniqueness per user per room for an active request
create unique index if not exists mic_requests_room_user_unique
on public.mic_requests (room_id, user_id);

create index if not exists mic_requests_room_status_idx
on public.mic_requests (room_id, status);

-- 3) Helper: count granted speakers in a room
create or replace function public._count_granted(p_room uuid)
returns int
language sql
stable
as $$
  select count(*)::int
  from public.room_participants rp
  where rp.room_id = p_room and rp.mic_status = 'granted';
$$;

-- 4) RPC: raise hand (adds/refreshes request + marks participant requested)
create or replace function public.raise_hand(p_room uuid, p_user uuid)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.mic_requests (room_id, user_id, status)
  values (p_room, p_user, 'pending')
  on conflict (room_id, user_id)
  do update set status = 'pending', updated_at = now();

  update public.room_participants
  set mic_status = 'requested'
  where room_id = p_room and user_id = p_user;
end;
$$;

-- 5) RPC: grant mic (caps at 2)
create or replace function public.grant_mic(p_room uuid, p_user uuid, p_admin uuid)
returns text
language plpgsql
security definer
as $$
declare
  current_granted int;
  is_host boolean;
begin
  select (rooms.host_id = p_admin) into is_host
  from public.rooms where id = p_room;

  if not coalesce(is_host,false) then
    return 'forbidden';
  end if;

  select public._count_granted(p_room) into current_granted;
  if current_granted >= 2 then
    return 'max_reached';
  end if;

  update public.room_participants
  set mic_status = 'granted'
  where room_id = p_room and user_id = p_user;

  insert into public.mic_requests (room_id, user_id, status, approved_by)
  values (p_room, p_user, 'approved', p_admin)
  on conflict (room_id, user_id)
  do update set status = 'approved', approved_by = p_admin, updated_at = now();

  return 'ok';
end;
$$;

-- 6) RPC: revoke mic
create or replace function public.revoke_mic(p_room uuid, p_user uuid, p_admin uuid)
returns text
language plpgsql
security definer
as $$
declare
  is_host boolean;
begin
  select (rooms.host_id = p_admin) into is_host
  from public.rooms where id = p_room;

  if not coalesce(is_host,false) then
    return 'forbidden';
  end if;

  update public.room_participants
  set mic_status = 'none'
  where room_id = p_room and user_id = p_user;

  insert into public.mic_requests (room_id, user_id, status, approved_by)
  values (p_room, p_user, 'revoked', p_admin)
  on conflict (room_id, user_id)
  do update set status = 'revoked', approved_by = p_admin, updated_at = now();

  return 'ok';
end;
$$;

-- 7) RLS: enable & permissive policies
alter table public.mic_requests enable row level security;

-- View own & room items
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='mic_requests' and policyname='mic_requests_select'
  ) then
    create policy mic_requests_select on public.mic_requests
      for select
      using (
        exists (select 1 from public.room_participants rp
                where rp.room_id = mic_requests.room_id
                  and rp.user_id = auth.uid())
        or exists (select 1 from public.rooms r
                   where r.id = mic_requests.room_id
                     and r.host_id = auth.uid())
      );
  end if;
end$$;

-- Allow users to raise hand for rooms they’re in
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='mic_requests' and policyname='mic_requests_insert'
  ) then
    create policy mic_requests_insert on public.mic_requests
      for insert
      with check (
        exists (select 1 from public.room_participants rp
                where rp.room_id = mic_requests.room_id
                  and rp.user_id = auth.uid())
      );
  end if;
end$$;

-- Allow host to approve/deny/revoke
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='mic_requests' and policyname='mic_requests_update_host'
  ) then
    create policy mic_requests_update_host on public.mic_requests
      for update
      using (
        exists (select 1 from public.rooms r
                where r.id = mic_requests.room_id
                  and r.host_id = auth.uid())
      )
      with check (
        exists (select 1 from public.rooms r
                where r.id = mic_requests.room_id
                  and r.host_id = auth.uid())
      );
  end if;
end$$;

-- 8) Make sure room_participants also has RLS that lets members update their own mic_status to 'requested'
alter table public.room_participants enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_select_member'
  ) then
    create policy rp_select_member on public.room_participants
      for select
      using (user_id = auth.uid()
             or exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid()));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_update_self_request'
  ) then
    create policy rp_update_self_request on public.room_participants
      for update
      using (user_id = auth.uid())
      with check (user_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='room_participants' and policyname='rp_update_host_grant'
  ) then
    create policy rp_update_host_grant on public.room_participants
      for update
      using (exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid()))
      with check (exists (select 1 from public.rooms r where r.id = room_id and r.host_id = auth.uid()));
  end if;
end$$;


