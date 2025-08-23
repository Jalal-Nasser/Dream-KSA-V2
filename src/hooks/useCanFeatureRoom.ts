import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

async function getMyId() {
  const { data } = await supabase.auth.getUser();
  return data.user?.id || null;
}

async function getRoles(agencyId: string, me: string) {
  if (!agencyId || !me) return [];
  
  // agency owner?
  const { data: owner } = await supabase
    .from("agencies")
    .select("id")
    .eq("id", agencyId)
    .eq("owner_id", me)
    .maybeSingle();
  
  if (owner) return ["owner"];
  
  // membership roles
  const { data: rows } = await supabase
    .from("agency_members")
    .select("role")
    .eq("agency_id", agencyId)
    .eq("user_id", me);
  
  return (rows || []).map((r: any) => r.role);
}

const cache = new Map<string, boolean>(); // key: `${roomId}:${ownerId}:${agencyId}:${me}`

export function useCanFeatureRoom(room: { id: string; owner_id: string; agency_id?: string | null }) {
  const [allowed, setAllowed] = useState<boolean>(false);
  const key = useMemo(() => `${room?.id}:${room?.owner_id}:${room?.agency_id || ""}`, [room?.id, room?.owner_id, room?.agency_id]);

  useEffect(() => {
    let mounted = true;
    
    (async () => {
      if (!room?.id) return;
      
      const me = await getMyId();
      if (!me) { 
        mounted && setAllowed(false); 
        return; 
      }
      
      const cacheKey = `${key}:${me}`;
      if (cache.has(cacheKey)) { 
        mounted && setAllowed(!!cache.get(cacheKey)); 
        return; 
      }
      
      const isOwner = room.owner_id === me;
      let ok = isOwner;
      
      if (!ok && room.agency_id) {
        const roles = await getRoles(room.agency_id, me);
        ok = roles.includes("owner") || roles.includes("manager");
      }
      
      cache.set(cacheKey, ok);
      mounted && setAllowed(ok);
    })();
    
    return () => { mounted = false; };
  }, [key]);

  return allowed;
}

