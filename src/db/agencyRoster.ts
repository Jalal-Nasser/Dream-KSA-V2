import { supabase } from "@/lib/supabase";

export async function listRoster(agencyId: string) {
  const { data, error } = await supabase
    .from("agency_members")
    .select("user_id, role, joined_at")
    .eq("agency_id", agencyId)
    .order("joined_at", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function setRole(agencyId: string, userId: string, role: "manager"|"host"|"member") {
  const { error } = await supabase
    .from("agency_members")
    .update({ role })
    .eq("agency_id", agencyId)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}

export async function removeMember(agencyId: string, userId: string) {
  const { error } = await supabase
    .from("agency_members")
    .delete()
    .eq("agency_id", agencyId)
    .eq("user_id", userId);
  if (error) throw error;
  return true;
}
