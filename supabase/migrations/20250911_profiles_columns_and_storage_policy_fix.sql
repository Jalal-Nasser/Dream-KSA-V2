-- Ensure required profile columns exist for the app's save flow
alter table public.profiles
  add column if not exists gender text,
  add column if not exists birthday date,
  add column if not exists country text,
  add column if not exists title text,
  add column if not exists signature text;

-- Adjust storage policies to allow paths like 'u/<user_id>/avatar'
-- Reset owner write policies (idempotent)
drop policy if exists "avatars owner insert" on storage.objects;
drop policy if exists "avatars owner update" on storage.objects;
drop policy if exists "avatars owner delete" on storage.objects;

-- Owner insert/update/delete only within their folder. Support both '<uid>/...' and 'u/<uid>/...'
create policy "avatars owner insert" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and (
      auth.uid()::text = split_part(name, '/', 1)
      or name like 'u/' || auth.uid()::text || '/%'
    )
  );

create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and (
      auth.uid()::text = split_part(name, '/', 1)
      or name like 'u/' || auth.uid()::text || '/%'
    )
  )
  with check (
    bucket_id = 'avatars' and (
      auth.uid()::text = split_part(name, '/', 1)
      or name like 'u/' || auth.uid()::text || '/%'
    )
  );

create policy "avatars owner delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and (
      auth.uid()::text = split_part(name, '/', 1)
      or name like 'u/' || auth.uid()::text || '/%'
    )
  );


