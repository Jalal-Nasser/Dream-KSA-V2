alter table public.profiles
  add column if not exists display_name text;

alter table public.profiles
  add column if not exists country text;

alter table public.profiles
  add column if not exists birthday date;