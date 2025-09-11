-- PROFILES TABLE --------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Reset policies (idempotent)
drop policy if exists profiles_select_self on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;
drop policy if exists profiles_update_self on public.profiles;

create policy profiles_select_self on public.profiles
  for select using (auth.uid() = id);

create policy profiles_insert_self on public.profiles
  for insert with check (auth.uid() = id);

create policy profiles_update_self on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Auto-create a profile row on new user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- STORAGE: AVATARS BUCKET ----------------------------------------------
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

-- Reset storage policies (idempotent)
drop policy if exists "avatars read public" on storage.objects;
drop policy if exists "avatars owner insert" on storage.objects;
drop policy if exists "avatars owner update" on storage.objects;
drop policy if exists "avatars owner delete" on storage.objects;

-- Public read
create policy "avatars read public" on storage.objects
  for select using (bucket_id = 'avatars');

-- Owner can write only to their own folder: <user_id>/...
create policy "avatars owner insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  )
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );

create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = split_part(name, '/', 1)
  );
