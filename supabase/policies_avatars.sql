-- Run this in Supabase Dashboard SQL editor (owner context)
-- Ensures profiles.avatar_url exists and creates safe storage policies for 'avatars' bucket

-- 1) Ensure avatar_url column exists
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2) Policies — wrap each CREATE POLICY in a DO block so it only creates if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars_public_read'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "avatars_public_read"
        ON storage.objects
        FOR SELECT
        USING (bucket_id = 'avatars');
    $q$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars_insert_own'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "avatars_insert_own"
        ON storage.objects
        FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
    $q$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars_update_own'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "avatars_update_own"
        ON storage.objects
        FOR UPDATE
        TO authenticated
        USING (bucket_id = 'avatars' AND auth.uid() = owner)
        WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);
    $q$;
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'avatars_delete_own'
  ) THEN
    EXECUTE $q$
      CREATE POLICY "avatars_delete_own"
        ON storage.objects
        FOR DELETE
        TO authenticated
        USING (bucket_id = 'avatars' AND auth.uid() = owner);
    $q$;
  END IF;
END
$$;

-- Refresh PostgREST schema cache
NOTIFY pgrst, 'reload schema';
