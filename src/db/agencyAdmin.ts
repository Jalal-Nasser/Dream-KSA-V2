import { supabase } from "@/lib/supabase";

export async function getAgency(agencyId: string) {
  const { data, error } = await supabase.from("agencies").select("*").eq("id", agencyId).maybeSingle();
  if (error) throw error; return data;
}

export async function getRoster(agencyId: string) {
  const { data, error } = await supabase
    .from("v_agency_roster")
    .select("user_id, role, joined_at")
    .eq("agency_id", agencyId)
    .order("joined_at", { ascending: true });
  if (error) throw error; return data || [];
}

export async function setRole(agencyId: string, userId: string, role: "owner"|"manager"|"host"|"member") {
  const { error } = await supabase.from("agency_members").upsert({ agency_id: agencyId, user_id: userId, role });
  if (error) throw error; return true;
}

export async function removeMember(agencyId: string, userId: string) {
  const { error } = await supabase.from("agency_members").delete().match({ agency_id: agencyId, user_id: userId });
  if (error) throw error; return true;
}

export async function listVipLevels() {
  const { data, error } = await supabase.from("vip_levels").select("id,name,badge_color,priority").order("priority", { ascending: false });
  if (error) throw error; return data || [];
}

export async function setUserVip(userId: string, vip_level_id: string|null) {
  if (!vip_level_id) {
    // remove VIP
    const { error } = await supabase.from("user_vip").delete().eq("user_id", userId);
    if (error) throw error; return true;
  }
  const { error } = await supabase.from("user_vip").upsert({ user_id: userId, vip_level_id });
  if (error) throw error; return true;
}

export async function kpisForAgency(agencyId: string) {
  const { data: rooms } = await supabase.from("rooms").select("id").eq("agency_id", agencyId);
  const roomIds = (rooms || []).map(r => r.id);
  let speakers = 0, listeners = 0, pending = 0;
  if (roomIds.length) {
    const { data: parts } = await supabase
      .from("room_participants")
      .select("mic_status")
      .in("room_id", roomIds);
    speakers = (parts || []).filter((p:any)=>p.mic_status==='granted').length;
    listeners = (parts || []).length - speakers;
    const { data: reqs } = await supabase
      .from("mic_requests")
      .select("id")
      .in("room_id", roomIds)
      .eq("status","pending");
    pending = (reqs||[]).length;
  }
  return { rooms: roomIds.length, speakers, listeners, pending };
}


