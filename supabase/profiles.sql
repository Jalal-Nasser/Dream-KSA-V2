-- profiles table
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  gender text check (gender in ('male','female','other')) default null,
  birthday date default null,
  country text,
  title text,
  signature text,
  avatar_url text,
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

-- Anyone may read (like Binmo public profiles)
do $$ begin
  if not exists (
    select 1 from pg_policies where polname = 'profiles_read_all' and tablename = 'profiles'
  ) then
    create policy "profiles_read_all" on public.profiles
      for select using (true);
  end if;
end $$;

-- Only the owner can insert/update their row
do $$ begin
  if not exists (
    select 1 from pg_policies where polname = 'profiles_insert_own' and tablename = 'profiles'
  ) then
    create policy "profiles_insert_own" on public.profiles
      for insert with check (auth.uid() = id);
  end if;
  if not exists (
    select 1 from pg_policies where polname = 'profiles_update_own' and tablename = 'profiles'
  ) then
    create policy "profiles_update_own" on public.profiles
      for update using (auth.uid() = id);
  end if;
end $$;

-- avatars bucket
insert into storage.buckets (id, name, public) values ('avatars','avatars',true)
on conflict (id) do nothing;

-- Public read
do $$ begin
  if not exists(
    select 1 from pg_policies where polname = 'avatars_public_read' and tablename = 'objects'
  ) then
    create policy "avatars_public_read" on storage.objects
      for select using (bucket_id = 'avatars');
  end if;
end $$;

-- Authenticated users can write/update/delete inside their own folder: {uid}/...
do $$ begin
  if not exists(
    select 1 from pg_policies where polname = 'avatars_insert_own' and tablename = 'objects'
  ) then
    create policy "avatars_insert_own" on storage.objects
      for insert to authenticated with check (
        bucket_id = 'avatars' and (auth.uid()::text = (storage.foldername(name))[1])
      );
  end if;
  if not exists(
    select 1 from pg_policies where polname = 'avatars_update_own' and tablename = 'objects'
  ) then
    create policy "avatars_update_own" on storage.objects
      for update to authenticated using (
        bucket_id = 'avatars' and (auth.uid()::text = (storage.foldername(name))[1])
      );
  end if;
  if not exists(
    select 1 from pg_policies where polname = 'avatars_delete_own' and tablename = 'objects'
  ) then
    create policy "avatars_delete_own" on storage.objects
      for delete to authenticated using (
        bucket_id = 'avatars' and (auth.uid()::text = (storage.foldername(name))[1])
      );
  end if;
end $$;

-- RPC function to set avatar URL
create or replace function public.set_avatar_url(_path text)
returns void
language plpgsql
security definer
as $$
begin
  update public.profiles 
  set avatar_url = _path, updated_at = now()
  where id = auth.uid();
end;
$$;
