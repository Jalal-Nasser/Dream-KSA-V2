-- DreamsKSA — Fix Security Advisor WARNINGS
-- 1) Pin search_path for flagged functions in schema public
-- 2) Move pg_trgm extension to "extensions" schema (away from public)
-- This script is idempotent: it skips items that don't exist.

-- Ensure the dedicated schema for extensions exists
CREATE SCHEMA IF NOT EXISTS extensions;

-- Move pg_trgm extension out of public (if installed)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_trgm') THEN
    -- Only move if not already in "extensions"
    IF NOT EXISTS (
      SELECT 1
      FROM pg_extension e
      JOIN pg_namespace n ON n.oid = e.extnamespace
      WHERE e.extname = 'pg_trgm' AND n.nspname = 'extensions'
    ) THEN
      ALTER EXTENSION pg_trgm SET SCHEMA extensions;
    END IF;
  END IF;
END$$;

-- Helper: set search_path for a list of function names in "public"
-- We compute their full signatures dynamically so ALTER FUNCTION works.
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      p.proname AS func_name,
      oidvectortypes(p.proargtypes) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.proname IN (
        'enforce_max_two_speakers',
        'touch_updated_at',
        'set_avatar_url',
        'redeem_agency_invite',
        'create_index_if_columns_exist',
        'fn_aggregate_monthly',
        'update_updated_at_column',
        'mic_requests_sync_participant',
        'enforce_two_speakers',
        'object_agency_id',
        'is_agency_admin',
        'is_room_moderator',
        'speakers_count',
        'create_room',
        'join_room',
        'grant_mic',
        'raise_hand',
        'revoke_mic',
        'set_role',
        'transfer_host'
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path = public, extensions, pg_temp',
      r.schema_name, r.func_name, r.args
    );
  END LOOP;
END$$;

-- Optional: if you prefer to pin search_path for ALL functions in public,
-- replace the WHERE clause above with:
--   WHERE n.nspname = ''public''
-- But we keep it scoped to only the flagged list for minimal impact.
