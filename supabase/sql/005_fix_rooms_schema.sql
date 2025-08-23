alter table public.rooms
  add column if not exists admin_id uuid references auth.users(id),
  add column if not exists created_at timestamptz default now();

create index if not exists idx_rooms_admin on public.rooms(admin_id);

alter table public.rooms enable row level security;

create policy if not exists "rooms_public_read"
  on public.rooms for select using (true);

create policy if not exists "rooms_owner_insert"
  on public.rooms for insert with check (admin_id = auth.uid());

select pg_notify('pgrst', 'reload schema');
