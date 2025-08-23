import { supabase } from "@/lib/supabase";

export async function getMe() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const user = data.user;
  return {
    id: user?.id || "",
    email: user?.email || "",
    username: user?.user_metadata?.username || "",
    bio: user?.user_metadata?.bio || "",
    avatar_url: user?.user_metadata?.avatar_url || "",
  };
}

export async function getMyVip(user_id: string) {
  if (!user_id) return null;
  const { data } = await supabase
    .from("v_user_with_vip")
    .select("vip_name,priority,badge_color")
    .eq("user_id", user_id)
    .maybeSingle();
  return data || null;
}

export async function updateProfile(meta: { username?: string; bio?: string; avatar_url?: string }) {
  const { error } = await supabase.auth.updateUser({ data: meta });
  if (error) throw error;
  return true;
}

export async function listMyAgenciesLite(user_id: string) {
  if (!user_id) return [];
  const { data: roster } = await supabase
    .from("v_agency_roster")
    .select("agency_id")
    .eq("user_id", user_id);
  const ids = Array.from(new Set((roster || []).map((r: any) => r.agency_id)));
  if (!ids.length) return [];
  const { data } = await supabase
    .from("agencies")
    .select("id,name,icon_url,theme_color")
    .in("id", ids);
  return data || [];
}


