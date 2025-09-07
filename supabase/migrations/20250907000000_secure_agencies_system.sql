-- Secure Agencies System (RLS + Policies + Indexes)
-- Safe (no DROP/TRUNCATE). Creates indexes & RLS policies if missing.

-- 1) Enable RLS
ALTER TABLE public.agencies          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_members    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agency_invites    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hosts             ENABLE ROW LEVEL SECURITY;

-- 2) Helpful indexes (idempotent)
CREATE INDEX IF NOT EXISTS agencies_owner_idx          ON public.agencies(owner_id);
CREATE INDEX IF NOT EXISTS agency_members_agency_idx   ON public.agency_members(agency_id);
CREATE INDEX IF NOT EXISTS agency_members_user_idx     ON public.agency_members(user_id);
CREATE INDEX IF NOT EXISTS agency_invites_agency_idx   ON public.agency_invites(agency_id);
CREATE INDEX IF NOT EXISTS agency_invites_invited_idx  ON public.agency_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS hosts_user_idx              ON public.hosts(user_id);

-- 3) Agencies policies
-- View agencies: any signed-in user
CREATE POLICY agencies_select_auth
  ON public.agencies FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Create an agency: owner must be the inserter
CREATE POLICY agencies_insert_owner
  ON public.agencies FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Update/Delete: only owner
CREATE POLICY agencies_update_owner
  ON public.agencies FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY agencies_delete_owner
  ON public.agencies FOR DELETE
  USING (owner_id = auth.uid());

-- 4) Agency members policies
-- Read members if: you're the member OR you own the agency that row belongs to
CREATE POLICY agency_members_select
  ON public.agency_members FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
    )
  );

-- Add member: only agency owner
CREATE POLICY agency_members_insert_owner
  ON public.agency_members FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
  );

-- Update a membership: only agency owner
CREATE POLICY agency_members_update_owner
  ON public.agency_members FOR UPDATE
  USING (
    EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
  );

-- Remove member: owner or the member themself (leave agency)
CREATE POLICY agency_members_delete_owner_or_self
  ON public.agency_members FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
    )
  );

-- 5) Agency invites policies
-- Read invite if you're the invited user OR you own the agency
CREATE POLICY agency_invites_select
  ON public.agency_invites FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND (
      invited_user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
    )
  );

-- Create invite: only agency owner
CREATE POLICY agency_invites_insert_owner
  ON public.agency_invites FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND
    EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
  );

-- Accept/Reject (UPDATE status): invited user or agency owner
CREATE POLICY agency_invites_update_owner_or_invited
  ON public.agency_invites FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      invited_user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
    )
  )
  WITH CHECK (true);

-- Delete invite: owner only
CREATE POLICY agency_invites_delete_owner
  ON public.agency_invites FOR DELETE
  USING (
    EXISTS (SELECT 1 FROM public.agencies a WHERE a.id = agency_id AND a.owner_id = auth.uid())
  );

-- 6) Hosts policies
-- Public can read host list (or restrict later)
CREATE POLICY hosts_select_public
  ON public.hosts FOR SELECT
  USING (true);

-- Add/update/delete host: agency owner OR the user themself (for self-host activation)
CREATE POLICY hosts_insert_owner_or_self
  ON public.hosts FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.agencies a WHERE (hosts.metadata->>'agency_id')::uuid = a.id AND a.owner_id = auth.uid())
    )
  );

CREATE POLICY hosts_update_owner_or_self
  ON public.hosts FOR UPDATE
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.agencies a WHERE (hosts.metadata->>'agency_id')::uuid = a.id AND a.owner_id = auth.uid())
    )
  )
  WITH CHECK (true);

CREATE POLICY hosts_delete_owner_or_self
  ON public.hosts FOR DELETE
  USING (
    auth.uid() IS NOT NULL AND (
      user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM public.agencies a WHERE (hosts.metadata->>'agency_id')::uuid = a.id AND a.owner_id = auth.uid())
    )
  );

-- Quick visibility check (uses pg_policies view)
SELECT
  tablename   AS "table",
  policyname  AS policy_name,
  cmd         AS for_cmd
FROM pg_policies
WHERE tablename IN ('agencies','agency_members','agency_invites','hosts')
ORDER BY tablename, policyname;
