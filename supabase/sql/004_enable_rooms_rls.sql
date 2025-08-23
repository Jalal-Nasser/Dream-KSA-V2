-- ROOMS
alter table public.rooms enable row level security;

create policy if not exists "rooms_read_all"
on public.rooms for select
using (true);

create policy if not exists "rooms_admin_insert"
on public.rooms for insert
with check (auth.uid() = admin_id);

create policy if not exists "rooms_admin_update"
on public.rooms for update
using (auth.uid() = admin_id);

-- PARTICIPANTS
alter table public.room_participants enable row level security;

-- Anyone can list participants for a room (relax for now; tighten later if you want)
create policy if not exists "rp_select_all"
on public.room_participants for select
using (true);

-- Users can join themselves
create policy if not exists "rp_insert_self"
on public.room_participants for insert
with check (user_id = auth.uid());

-- User can update their own row; admin can update anyone
create policy if not exists "rp_update_self_or_admin"
on public.room_participants for update
using (
  user_id = auth.uid()
  or exists (select 1 from public.rooms r where r.id = room_participants.room_id and r.admin_id = auth.uid())
);

-- MIC REQUESTS
alter table public.mic_requests enable row level security;

-- Members can see mic requests for the room (relax for now)
create policy if not exists "mr_select_all"
on public.mic_requests for select
using (true);

-- A user can create their own mic request
create policy if not exists "mr_insert_self"
on public.mic_requests for insert
with check (user_id = auth.uid());

-- Only admin may update request status
create policy if not exists "mr_update_admin_only"
on public.mic_requests for update
using (exists (select 1 from public.rooms r where r.id = mic_requests.room_id and r.admin_id = auth.uid()));
