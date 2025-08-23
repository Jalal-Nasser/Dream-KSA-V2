import { supabase } from '@/lib/supabase';

export type Room = { id: string; name: string; owner_id: string; agency_id?: string | null; mic_policy?: 'queue' | 'free' | null; topic?: string | null; featured?: boolean | null; created_at?: string };

export async function listRooms(): Promise<Room[]> {
  const { data } = await supabase
    .from('rooms')
    .select('id,name,owner_id,agency_id,mic_policy,topic,featured,created_at')
    .order('created_at', { ascending: false });
  return (data || []) as Room[];
}

export async function listRoomsByAgency(agencyId: string): Promise<Room[]> {
  const { data } = await supabase
    .from('rooms')
    .select('id,name,owner_id,agency_id,mic_policy,topic,featured,created_at')
    .eq('agency_id', agencyId)
    .order('created_at', { ascending: false });
  return (data || []) as Room[];
}

export async function getRoomLiveCounts(roomId: string): Promise<{ speakers: number; listeners: number }> {
  const { data } = await supabase
    .from('room_participants')
    .select('mic_status')
    .eq('room_id', roomId);
  const rows = (data || []) as { mic_status: string }[];
  const speakers = rows.filter((r) => r.mic_status === 'granted').length;
  const listeners = rows.length - speakers;
  return { speakers, listeners };
}

export async function createRoom(params: { name: string; topic?: string; agency_id?: string | null; mic_policy?: 'queue' | 'free'; featured?: boolean }) {
  const { data: auth } = await supabase.auth.getUser();
  const owner_id = auth.user?.id;
  if (!owner_id) throw new Error('Not authenticated');
  const { data, error } = await supabase
    .from('rooms')
    .insert({
      name: params.name,
      owner_id,
      topic: params.topic ?? null,
      agency_id: params.agency_id ?? null,
      mic_policy: params.mic_policy ?? null,
      featured: params.featured ?? false,
    })
    .select('*')
    .single();
  if (error) throw error;
  return data as Room;
}

type RoomRow = {
  id: string;
  name: string;
  owner_id: string;
  agency_id: string | null;
  featured: boolean;
  created_at: string;
};

export type HostVip = { vip_name?: string | null; badge_color?: string | null; priority?: number | null };

export async function listRoomsWithHostVip(filters?: { agencyId?: string; featuredOnly?: boolean; limit?: number }) {
  const q = supabase
    .from("rooms")
    .select("id,name,owner_id,agency_id,featured,created_at")
    .order("created_at", { ascending: false });

  if (filters?.agencyId) q.eq("agency_id", filters.agencyId);
  if (filters?.featuredOnly) q.eq("featured", true);
  if (filters?.limit) q.limit(filters.limit);

  const { data: rooms, error } = await q;
  if (error || !rooms?.length) return { rooms: rooms || [], vipByOwner: {} as Record<string, HostVip>, agencies: {} as Record<string, any> };

  const ownerIds = Array.from(new Set(rooms.map((r: RoomRow) => r.owner_id)));
  const agencyIds = Array.from(new Set(rooms.map((r: RoomRow) => r.agency_id).filter(Boolean)));
  
  const [vips, agencies] = await Promise.all([
    supabase.from("v_user_with_vip").select("user_id,vip_name,badge_color,priority").in("user_id", ownerIds),
    agencyIds.length > 0 ? supabase.from("agencies").select("id,name,featured_banner,theme_color").in("id", agencyIds) : { data: [] }
  ]);

  const vipByOwner: Record<string, HostVip> = {};
  (vips?.data || []).forEach((v: any) => {
    vipByOwner[v.user_id] = { vip_name: v.vip_name, badge_color: v.badge_color, priority: v.priority };
  });

  const agenciesById: Record<string, any> = {};
  (agencies?.data || []).forEach((a: any) => {
    agenciesById[a.id] = a;
  });

  return { rooms: rooms as RoomRow[], vipByOwner, agencies: agenciesById };
}

export async function listFeaturedWithHostVip(limit = 10) {
  return listRoomsWithHostVip({ featuredOnly: true, limit });
}


