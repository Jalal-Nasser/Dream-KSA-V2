import { supabase } from "@/lib/supabase";

export async function getAgencyById(id: string) {
  const { data, error } = await supabase.from("agencies").select("id,name,icon_url,theme_color,featured_banner").eq("id", id).maybeSingle();
  if (error) throw error; return data;
}

export async function updateAgency(id: string, patch: { name?: string; icon_url?: string; theme_color?: string; featured_banner?: string }) {
  const { error } = await supabase.from("agencies").update(patch).eq("id", id);
  if (error) throw error;
  return true;
}
