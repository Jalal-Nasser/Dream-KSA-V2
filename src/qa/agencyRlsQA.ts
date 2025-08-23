import { supabase } from "@/lib/supabase";

export async function tryUpdateThemeBanner(agencyId: string, themeColor: string, banner: string) {
  const { error } = await supabase
    .from("agencies")
    .update({ theme_color: themeColor, featured_banner: banner })
    .eq("id", agencyId);
  if (error) return { ok: false, code: (error as any).code, msg: error.message };
  return { ok: true };
}

export async function fetchAgency(id: string) {
  const { data, error } = await supabase.from("agencies").select("id,name,theme_color,featured_banner,owner_id").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getMyUid() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}
