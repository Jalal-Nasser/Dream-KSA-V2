import { supabase } from "@/lib/supabase";

export async function getMyId() {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return data.user?.id || null;
}

export async function getMyAgencyRoles(agencyId: string) {
  const me = await getMyId();
  if (!me) return [];
  
  // Owner via agencies table
  const { data: ownerRow } = await supabase
    .from("agencies")
    .select("id")
    .eq("id", agencyId)
    .eq("owner_id", me)
    .maybeSingle();

  if (ownerRow) return ["owner"];

  // Member roles via agency_members
  const { data: members } = await supabase
    .from("agency_members")
    .select("role")
    .eq("agency_id", agencyId)
    .eq("user_id", me);

  return (members || []).map((r: any) => r.role);
}

export async function canFeatureRoom(room: { owner_id: string; agency_id?: string | null }) {
  const me = await getMyId();
  if (!me) return false;
  
  if (room.owner_id === me) return true;
  if (!room.agency_id) return false;
  
  const roles = await getMyAgencyRoles(room.agency_id);
  return roles.includes("owner") || roles.includes("manager");
}

