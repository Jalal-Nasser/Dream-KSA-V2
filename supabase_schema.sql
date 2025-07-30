-- Users table
create table if not exists users (
  id uuid primary key default uuid_generate_v4(),
  email text unique,
  phone text unique,
  username text unique not null,
  avatar_url text,
  bio text,
  coins int default 0,
  created_at timestamp with time zone default now()
);

-- Rooms table
create table if not exists rooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  host_id uuid references users(id),
  is_live boolean default true,
  created_at timestamp with time zone default now()
);

-- Room participants
create table if not exists room_participants (
  id uuid primary key default uuid_generate_v4(),
  room_id uuid references rooms(id) on delete cascade,
  user_id uuid references users(id) on delete cascade,
  joined_at timestamp with time zone default now()
);

-- Gifts
create table if not exists gifts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  icon_url text,
  coin_cost int not null
);

-- Gift transactions
create table if not exists transactions (
  id uuid primary key default uuid_generate_v4(),
  sender_id uuid references users(id),
  receiver_id uuid references users(id),
  gift_id uuid references gifts(id),
  room_id uuid references rooms(id),
  coins_spent int not null,
  created_at timestamp with time zone default now()
);

-- Friends table
create table if not exists friends (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  friend_id uuid references users(id),
  status text check (status in ('pending', 'accepted', 'blocked')) default 'pending',
  created_at timestamp with time zone default now()
);

-- Leaderboards view
create or replace view leaderboards as
select 
  users.id as user_id,
  users.username,
  sum(transactions.coins_spent) as total_coins
from users
left join transactions on users.id = transactions.receiver_id
group by users.id, users.username
order by total_coins desc;

-- Reports table
create table if not exists reports (
  id uuid primary key default uuid_generate_v4(),
  reporter_id uuid references users(id),
  reported_user_id uuid references users(id),
  reason text,
  created_at timestamp with time zone default now()
);