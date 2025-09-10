-- Add foreign keys for agency relations (idempotent, safe to re-run)

-- agency_members.user_id → profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agency_members_user_fk'
  ) THEN
    ALTER TABLE public.agency_members
      ADD CONSTRAINT agency_members_user_fk
      FOREIGN KEY (user_id) REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- agency_members.agency_id → agencies.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agency_members_agency_fk'
  ) THEN
    ALTER TABLE public.agency_members
      ADD CONSTRAINT agency_members_agency_fk
      FOREIGN KEY (agency_id) REFERENCES public.agencies(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- agencies.owner_id → profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agencies_owner_fk'
  ) THEN
    ALTER TABLE public.agencies
      ADD CONSTRAINT agencies_owner_fk
      FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
      ON DELETE RESTRICT;
  END IF;
END$$;

-- agency_invites.invited_user_id → profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agency_invites_invited_user_fk'
  ) THEN
    ALTER TABLE public.agency_invites
      ADD CONSTRAINT agency_invites_invited_user_fk
      FOREIGN KEY (invited_user_id) REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- agency_invites.invited_by → profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agency_invites_invited_by_fk'
  ) THEN
    ALTER TABLE public.agency_invites
      ADD CONSTRAINT agency_invites_invited_by_fk
      FOREIGN KEY (invited_by) REFERENCES public.profiles(id)
      ON DELETE SET NULL;
  END IF;
END$$;

-- agency_invites.agency_id → agencies.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'agency_invites_agency_fk'
  ) THEN
    ALTER TABLE public.agency_invites
      ADD CONSTRAINT agency_invites_agency_fk
      FOREIGN KEY (agency_id) REFERENCES public.agencies(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- hosts.user_id → profiles.id
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hosts_user_fk'
  ) THEN
    ALTER TABLE public.hosts
      ADD CONSTRAINT hosts_user_fk
      FOREIGN KEY (user_id) REFERENCES public.profiles(id)
      ON DELETE CASCADE;
  END IF;
END$$;

-- Helpful indexes (no-ops if they already exist)
CREATE INDEX IF NOT EXISTS agency_members_user_idx   ON public.agency_members(user_id);
CREATE INDEX IF NOT EXISTS agency_members_agency_idx ON public.agency_members(agency_id);
CREATE INDEX IF NOT EXISTS agencies_owner_idx        ON public.agencies(owner_id);
CREATE INDEX IF NOT EXISTS agency_invites_agency_idx ON public.agency_invites(agency_id);
CREATE INDEX IF NOT EXISTS agency_invites_invited_idx ON public.agency_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS hosts_user_idx            ON public.hosts(user_id);

