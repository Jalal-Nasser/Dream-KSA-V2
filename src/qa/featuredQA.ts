import { supabase } from "@/lib/supabase";

export async function tryToggleFeaturedOnce(roomId: string, current: boolean) {
  // Optimistic: flip, then flip back. Return { ok: boolean, code?: string, message?: string }
  const next = !current;
  const { error: e1 } = await supabase.from("rooms").update({ featured: next }).eq("id", roomId);
  if (e1) {
    return { ok: false, code: (e1 as any)?.code, message: (e1 as any)?.message || "denied" };
  }
  // rollback (don't care if this fails — best effort)
  await supabase.from("rooms").update({ featured: current }).eq("id", roomId);
  return { ok: true };
}

export async function fetchAgencyRooms(agencyId: string, limit = 10) {
  const { data } = await supabase
    .from("rooms")
    .select("id,name,featured,owner_id,agency_id,created_at")
    .eq("agency_id", agencyId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return data || [];
}

export async function getMyUserId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

