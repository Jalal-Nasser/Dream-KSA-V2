-- Security Advisor hardening for DreamsKSA
-- This script is idempotent and will skip objects that don't exist.
-- PostgreSQL 15+ (Supabase default).

-- 1) Lock down view that references auth.users (avoid REST exposure)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_views
    WHERE schemaname = 'public' AND viewname = 'v_user_with_vip'
  ) THEN
    -- Ensure view runs with invoker privileges
    EXECUTE 'ALTER VIEW public.v_user_with_vip SET (security_invoker = true)';
    -- Remove REST/SQL access from anon/authenticated roles so it is not exposed
    EXECUTE 'REVOKE ALL ON TABLE public.v_user_with_vip FROM anon, authenticated';
    COMMENT ON VIEW public.v_user_with_vip IS 'Locked: not exposed to PostgREST. Use server-side functions only.';
  END IF;
END$$;

-- 2) Convert other flagged views to security invoker and ensure least-privilege
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='rooms_public_view') THEN
    EXECUTE 'ALTER VIEW public.rooms_public_view SET (security_invoker = true)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='leaderboards') THEN
    EXECUTE 'ALTER VIEW public.leaderboards SET (security_invoker = true)';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_views WHERE schemaname='public' AND viewname='v_featured_rooms') THEN
    EXECUTE 'ALTER VIEW public.v_featured_rooms SET (security_invoker = true)';
  END IF;
END$$;

-- 3) Tables with RLS disabled in public: enable RLS and block client roles.
-- If the app needs client access later, add explicit per-table policies then.

-- agency_members
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='agency_members'
  ) THEN
    -- Not exposed to clients
    REVOKE ALL ON TABLE public.agency_members FROM anon, authenticated;
    -- Enable RLS
    ALTER TABLE public.agency_members ENABLE ROW LEVEL SECURITY;
    -- Service role may manage rows (for server-side tasks)
    DROP POLICY IF EXISTS "service can manage agency_members" ON public.agency_members;
    CREATE POLICY "service can manage agency_members"
      ON public.agency_members
      AS PERMISSIVE
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;

-- webhook_events
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='webhook_events'
  ) THEN
    REVOKE ALL ON TABLE public.webhook_events FROM anon, authenticated;
    ALTER TABLE public.webhook_events ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "service can manage webhook_events" ON public.webhook_events;
    CREATE POLICY "service can manage webhook_events"
      ON public.webhook_events
      AS PERMISSIVE
      FOR ALL
      TO service_role
      USING (true)
      WITH CHECK (true);
  END IF;
END$$;

-- Notes:
-- - If any of these objects don’t exist, this script simply skips them.
-- - If the app later needs client access to any table, add explicit RLS
--   SELECT/INSERT/UPDATE policies for role 'authenticated'.
