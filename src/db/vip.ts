import { supabase } from "@/lib/supabase";

export async function listVipLevels() {
  const { data, error } = await supabase
    .from("vip_levels")
    .select("id,name,badge_color,priority")
    .order("priority", { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function getUserVip(userId: string) {
  const { data, error } = await supabase
    .from("v_user_with_vip")
    .select("user_id,vip_level_id,vip_name,badge_color,priority")
    .eq("user_id", userId).maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function grantVip(userId: string, vip_level_id: string) {
  const { data: me } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("user_vip")
    .upsert({ user_id: userId, vip_level_id, granted_by: me.user?.id || null }, { onConflict: "user_id" });
  if (error) throw error;
  return true;
}

export async function revokeVip(userId: string) {
  const { error } = await supabase.from("user_vip").delete().eq("user_id", userId);
  if (error) throw error;
  return true;
}





