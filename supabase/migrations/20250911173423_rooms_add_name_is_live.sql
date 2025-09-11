alter table public.rooms
  add column if not exists name text,
  add column if not exists is_live boolean default false;