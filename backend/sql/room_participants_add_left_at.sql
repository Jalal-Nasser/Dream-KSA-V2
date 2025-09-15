alter table public.room_participants
  add column if not exists left_at timestamptz;
