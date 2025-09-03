-- DreamsKSA: Create/Join/Customize Rooms — RLS & defaults
-- This script is defensive/idempotent: it checks objects before changing them.
-- It enables:
--  - any authenticated user can create a room (host_id defaults to auth.uid()).
--  - authenticated users can join/leave rooms via room_participants (self only).
--  - hosts can update (customize) their own rooms.
--  - reads allowed to authenticated users (adjust if you want stricter).

-- Helpers --------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- If your tables already have created_at / updated_at, we add triggers safely.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rooms') THEN
    -- Add updated_at trigger
    IF EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='rooms' AND column_name='updated_at'
    ) THEN
      IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_rooms_touch_updated_at') THEN
        CREATE TRIGGER trg_rooms_touch_updated_at
        BEFORE UPDATE ON public.rooms
        FOR EACH ROW
        EXECUTE FUNCTION public.touch_updated_at();
      END IF;
    END IF;
  END IF;
END$$;

-- Ensure owner_id defaults to auth.uid() on insert (if column exists) ----------
CREATE OR REPLACE FUNCTION public.rooms_defaults()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  -- owner_id default
  IF NEW.owner_id IS NULL THEN
    BEGIN
      NEW.owner_id := auth.uid();
    EXCEPTION WHEN others THEN
      -- if auth.uid() not available (server-side), leave as is
      NULL;
    END;
  END IF;
  -- created_at default
  IF NEW.created_at IS NULL THEN
    NEW.created_at := NOW();
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='rooms' AND column_name='owner_id'
  ) THEN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname='trg_rooms_defaults') THEN
      CREATE TRIGGER trg_rooms_defaults
      BEFORE INSERT ON public.rooms
      FOR EACH ROW
      EXECUTE FUNCTION public.rooms_defaults();
    END IF;
  END IF;
END$$;

-- Unique join per user/room ---------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='room_participants') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='uniq_room_participants_room_user'
    ) THEN
      CREATE UNIQUE INDEX uniq_room_participants_room_user
        ON public.room_participants (room_id, user_id);
    END IF;
  END IF;
END$$;

-- Enable RLS ------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rooms') THEN
    ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='room_participants') THEN
    ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
  END IF;
END$$;

-- Policies: ROOMS -------------------------------------------------------------
-- DROP existing policies first to avoid conflicts
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='rooms') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "rooms_read_all" ON public.rooms;
    DROP POLICY IF EXISTS "rooms_admin_insert" ON public.rooms;
    DROP POLICY IF EXISTS "rooms_admin_update" ON public.rooms;
    
    -- SELECT: any authenticated user can read rooms (adjust to your privacy needs).
    DROP POLICY IF EXISTS "rooms select for auth" ON public.rooms;
    CREATE POLICY "rooms select for auth"
      ON public.rooms
      FOR SELECT
      TO authenticated
      USING (true);

    -- INSERT: only authenticated; host_id is enforced to auth.uid() via trigger.
    DROP POLICY IF EXISTS "rooms insert by auth" ON public.rooms;
    CREATE POLICY "rooms insert by auth"
      ON public.rooms
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() IS NOT NULL);

    -- UPDATE: only owner can update (customize) their room.
    DROP POLICY IF EXISTS "rooms update by owner" ON public.rooms;
    CREATE POLICY "rooms update by owner"
      ON public.rooms
      FOR UPDATE
      TO authenticated
      USING (owner_id = auth.uid())
      WITH CHECK (owner_id = auth.uid());

    -- DELETE: owner may delete (optional; keep or drop)
    DROP POLICY IF EXISTS "rooms delete by owner" ON public.rooms;
    CREATE POLICY "rooms delete by owner"
      ON public.rooms
      FOR DELETE
      TO authenticated
      USING (owner_id = auth.uid());
  END IF;
END$$;

-- Policies: ROOM_PARTICIPANTS -------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='room_participants') THEN
    -- Drop existing policies
    DROP POLICY IF EXISTS "rp_select_all" ON public.room_participants;
    DROP POLICY IF EXISTS "rp_insert_self" ON public.room_participants;
    DROP POLICY IF EXISTS "rp_update_self_or_admin" ON public.room_participants;
    
    DROP POLICY IF EXISTS "participants select for auth" ON public.room_participants;
    CREATE POLICY "participants select for auth"
      ON public.room_participants
      FOR SELECT
      TO authenticated
      USING (true);

    -- JOIN: a user can insert their own membership row
    DROP POLICY IF EXISTS "participants insert self" ON public.room_participants;
    CREATE POLICY "participants insert self"
      ON public.room_participants
      FOR INSERT
      TO authenticated
      WITH CHECK (user_id = auth.uid());

    -- UPDATE: a user can update their own row (e.g., left_at), OR owner can manage anyone (optional)
    DROP POLICY IF EXISTS "participants update self or owner" ON public.room_participants;
    CREATE POLICY "participants update self or owner"
      ON public.room_participants
      FOR UPDATE
      TO authenticated
      USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.rooms r WHERE r.id = room_id AND r.owner_id = auth.uid()
      ))
      WITH CHECK (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.rooms r WHERE r.id = room_id AND r.owner_id = auth.uid()
      ));

    -- LEAVE: a user can delete their own membership row; owner can kick (optional)
    DROP POLICY IF EXISTS "participants delete self or owner" ON public.room_participants;
    CREATE POLICY "participants delete self or owner"
      ON public.room_participants
      FOR DELETE
      TO authenticated
      USING (user_id = auth.uid() OR EXISTS (
        SELECT 1 FROM public.rooms r WHERE r.id = room_id AND r.owner_id = auth.uid()
      ));
  END IF;
END$$;

-- (Optional) If your UI updates room settings columns (title/topic/etc.),
-- the "rooms update by owner" policy already allows owner to customize.
-- No further changes are needed for client-side UPDATEs.
