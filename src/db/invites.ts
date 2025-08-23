import { supabase } from "@/lib/supabase";

function randomCode(len = 10) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

export async function createInvite(agency_id: string, role: "member" | "host" | "manager" = "member", max_uses = 100, daysValid = 14) {
  // Server enforces owner/manager via RLS; client just passes values.
  const code = randomCode(10);
  const expires_at = new Date(Date.now() + daysValid * 24 * 3600 * 1000).toISOString();
  const { data, error } = await supabase
    .from("agency_invites")
    .insert({ agency_id, role, code, max_uses, expires_at, created_by: (await supabase.auth.getUser()).data.user?.id })
    .select("code")
    .single();
  if (error) throw error;
  return data.code as string;
}

export async function redeemInvite(code: string) {
  const { data, error } = await supabase.rpc("redeem_agency_invite", { p_code: code });
  if (error) throw error;
  // returns [{ agency_id, role }]
  return (data && data[0]) || null;
}

export async function listInvites(agency_id: string) {
  const { data, error } = await supabase
    .from("agency_invites")
    .select("id, code, role, uses, max_uses, expires_at, created_at")
    .eq("agency_id", agency_id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function disableInvite(inviteId: string) {
  // "Disable" by setting max_uses = uses (can't be redeemed anymore)
  const { error } = await supabase
    .from("agency_invites")
    .update({ max_uses: 0 })
    .eq("id", inviteId);
  if (error) throw error;
  return true;
}
