-- Agency System and Voice Roles Schema (Supabase)
-- Safe to run multiple times; uses IF NOT EXISTS where possible

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- profiles extends auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  role text check (role in ('admin','agency_owner','host','user')) default 'user',
  country text,
  created_at timestamptz default now()
);

-- agencies
create table if not exists public.agencies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  payout_split int not null default 30, -- percentage to agency
  created_at timestamptz default now()
);
create index if not exists agencies_owner_idx on public.agencies(owner_id);

-- agency_invites
create table if not exists public.agency_invites (
  id uuid primary key default uuid_generate_v4(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  invitee_id uuid not null references public.profiles(id) on delete cascade,
  status text not null check (status in ('pending','accepted','expired','revoked')) default 'pending',
  expires_at timestamptz not null default (now() + interval '7 days'),
  created_at timestamptz default now()
);
create index if not exists agency_invites_agency_idx on public.agency_invites(agency_id);
create index if not exists agency_invites_invitee_idx on public.agency_invites(invitee_id);

-- hosts (membership of profiles to agencies as hosts)
create table if not exists public.hosts (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  agency_id uuid not null references public.agencies(id) on delete cascade,
  monthly_hours numeric default 0,
  monthly_gifts numeric default 0,
  created_at timestamptz default now()
);
create index if not exists hosts_agency_idx on public.hosts(agency_id);

-- gifts catalog
create table if not exists public.gifts_catalog (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  points int not null,
  icon_url text
);

-- rooms
create table if not exists public.rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  owner_id uuid references public.profiles(id) on delete set null,
  agency_id uuid references public.agencies(id) on delete set null,
  description text,
  type text default 'voice',
  theme varchar(7) default '#4f46e5',
  banner_image text,
  background_image text,
  country text default 'SA',
  hms_room_id text,
  is_live boolean default false,
  is_active boolean default true,
  created_at timestamptz default now()
);
create index if not exists rooms_owner_idx on public.rooms(owner_id);
create index if not exists rooms_agency_idx on public.rooms(agency_id);
create index if not exists rooms_country_idx on public.rooms(country);
create index if not exists rooms_created_idx on public.rooms(created_at);

-- room_participants
create table if not exists public.room_participants (
  room_id uuid references public.rooms(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  role text not null check (role in ('room_admin','speaker','listener')) default 'listener',
  hand_raised boolean default false,
  mic_granted boolean default false,
  joined_at timestamptz default now(),
  primary key (room_id, user_id)
);
create index if not exists room_participants_room_idx on public.room_participants(room_id);

-- gifts (events)
create table if not exists public.gifts (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_host_id uuid not null references public.profiles(id) on delete cascade,
  gift_id uuid not null references public.gifts_catalog(id),
  points int not null,
  created_at timestamptz default now()
);
create index if not exists gifts_room_idx on public.gifts(room_id);
create index if not exists gifts_sender_idx on public.gifts(sender_id);
create index if not exists gifts_receiver_idx on public.gifts(receiver_host_id);

-- monthly_earnings (aggregated)
create table if not exists public.monthly_earnings (
  id uuid primary key default uuid_generate_v4(),
  month text not null, -- YYYY-MM
  host_id uuid not null references public.profiles(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete set null,
  total_points int not null default 0,
  host_share_points int not null default 0,
  agency_share_points int not null default 0,
  converted_amount numeric default 0,
  created_at timestamptz default now(),
  unique(host_id, month)
);
create index if not exists monthly_earnings_agency_idx on public.monthly_earnings(agency_id);

-- payouts
create table if not exists public.payouts (
  id uuid primary key default uuid_generate_v4(),
  month text not null,
  beneficiary_type text not null check (beneficiary_type in ('host','agency')),
  beneficiary_id uuid not null references public.profiles(id) on delete cascade,
  agency_id uuid references public.agencies(id) on delete set null,
  amount numeric not null,
  status text not null check (status in ('pending','approved','paid','rejected')) default 'pending',
  created_at timestamptz default now()
);
create index if not exists payouts_beneficiary_idx on public.payouts(beneficiary_id);

-- RLS
alter table public.profiles enable row level security;
alter table public.agencies enable row level security;
alter table public.agency_invites enable row level security;
alter table public.hosts enable row level security;
alter table public.rooms enable row level security;
alter table public.room_participants enable row level security;
alter table public.gifts enable row level security;
alter table public.monthly_earnings enable row level security;
alter table public.payouts enable row level security;

-- profiles policies
create policy if not exists "profiles_self_read" on public.profiles
  for select using (auth.uid() = id or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy if not exists "profiles_self_update" on public.profiles
  for update using (auth.uid() = id);
create policy if not exists "profiles_insert_on_signup" on public.profiles
  for insert with check (auth.uid() = id);

-- agencies policies
create policy if not exists "agencies_select_owner_or_admin" on public.agencies
  for select using (owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy if not exists "agencies_insert_owner" on public.agencies
  for insert with check (owner_id = auth.uid());
create policy if not exists "agencies_update_owner_or_admin" on public.agencies
  for update using (owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- agency_invites policies
create policy if not exists "invites_owner_select" on public.agency_invites
  for select using (
    exists(select 1 from public.agencies a where a.id = agency_id and (a.owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')))
    or invitee_id = auth.uid()
  );
create policy if not exists "invites_owner_insert" on public.agency_invites
  for insert with check (
    exists(select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid())
  );
create policy if not exists "invites_owner_update" on public.agency_invites
  for update using (
    exists(select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid())
  );

-- hosts policies
create policy if not exists "hosts_owner_or_self_select" on public.hosts
  for select using (
    user_id = auth.uid() or exists(select 1 from public.agencies a where a.id = hosts.agency_id and a.owner_id = auth.uid())
  );
create policy if not exists "hosts_owner_insert" on public.hosts
  for insert with check (
    exists(select 1 from public.agencies a where a.id = agency_id and a.owner_id = auth.uid())
  );

-- rooms policies
create policy if not exists "rooms_read_all" on public.rooms for select using (true);
create policy if not exists "rooms_insert_owner" on public.rooms for insert with check (owner_id = auth.uid());
create policy if not exists "rooms_update_owner_or_admin" on public.rooms
  for update using (owner_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- room_participants policies
create policy if not exists "rp_select_room_member" on public.room_participants
  for select using (exists(select 1 from public.room_participants rp2 where rp2.room_id = room_id and rp2.user_id = auth.uid()));
create policy if not exists "rp_insert_self" on public.room_participants
  for insert with check (user_id = auth.uid());
create policy if not exists "rp_update_admin_or_self" on public.room_participants
  for update using (
    user_id = auth.uid() or exists(
      select 1 from public.room_participants rp2 where rp2.room_id = room_id and rp2.user_id = auth.uid() and rp2.role = 'room_admin'
    )
  );

-- gifts policies
create policy if not exists "gifts_read_room_member" on public.gifts
  for select using (exists(select 1 from public.room_participants rp where rp.room_id = gifts.room_id and rp.user_id = auth.uid()));
create policy if not exists "gifts_insert_room_member" on public.gifts
  for insert with check (exists(select 1 from public.room_participants rp where rp.room_id = room_id and rp.user_id = auth.uid()));

-- monthly_earnings and payouts (admin/agency/host scoped reads)
create policy if not exists "me_select_scope" on public.monthly_earnings
  for select using (
    host_id = auth.uid() or exists(select 1 from public.agencies a where a.id = monthly_earnings.agency_id and a.owner_id = auth.uid()) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
  );
create policy if not exists "payouts_select_scope" on public.payouts
  for select using (
    beneficiary_id = auth.uid() or exists(select 1 from public.agencies a where a.id = payouts.agency_id and a.owner_id = auth.uid()) or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role='admin')
  );




