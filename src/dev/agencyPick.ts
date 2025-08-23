import { supabase } from "@/lib/supabase";

export async function pickAnyAgencyId(): Promise<string | null> {
  // Prefer one I own
  const { data: me } = await supabase.auth.getUser();
  const uid = me.user?.id;
  if (!uid) return null;

  const { data: own } = await supabase
    .from("agencies")
    .select("id")
    .eq("owner_id", uid)
    .limit(1);
  if (own && own[0]?.id) return own[0].id;

  // Else any I'm a member of
  const { data: roster } = await supabase
    .from("v_agency_roster")
    .select("agency_id")
    .eq("user_id", uid)
    .limit(1);
  if (roster && roster[0]?.agency_id) return roster[0].agency_id;

  // Else any agency in DB (for quick QA)
  const { data: anyA } = await supabase
    .from("agencies")
    .select("id")
    .limit(1);
  return anyA && anyA[0]?.id ? anyA[0].id : null;
}

