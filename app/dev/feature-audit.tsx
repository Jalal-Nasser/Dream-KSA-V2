import React, { useEffect, useState } from "react";
import { View, Text, FlatList } from "react-native";
import { supabase } from "@/lib/supabase";
import { useCanFeatureRoom } from "@/src/hooks/useCanFeatureRoom";

export default function FeatureAudit() {
  const [rooms, setRooms] = useState<any[]>([]);
  
  useEffect(() => { 
    (async () => {
      const { data } = await supabase
        .from("rooms")
        .select("id,name,owner_id,agency_id,featured")
        .order("created_at", { ascending: false })
        .limit(30);
      setRooms(data || []);
    })(); 
  }, []);
  
  return (
    <View style={{ flex:1, backgroundColor:"#0E131A", padding:16 }}>
      <Text style={{ color:"white", fontWeight:"800", fontSize:18 }}>Feature Audit (dev)</Text>
      <FlatList
        style={{ marginTop:8 }}
        data={rooms}
        keyExtractor={(i)=>i.id}
        renderItem={({ item }) => {
          const allowed = useCanFeatureRoom(item);
          return (
            <View style={{ padding:12, borderRadius:12, backgroundColor:"rgba(255,255,255,0.06)", marginBottom:8 }}>
              <Text style={{ color:"white", fontWeight:"700" }}>{item.name} {item.featured ? "★" : ""}</Text>
              <Text style={{ color:"#9BA7B4", fontSize:12 }}>room: {item.id.slice(0,8)}… owner: {item.owner_id.slice(0,8)}…</Text>
              <Text style={{ color: allowed ? "#22c55e" : "#ef4444", marginTop:4 }}>{allowed ? "canFeature = true" : "canFeature = false"}</Text>
            </View>
          );
        }}
      />
    </View>
  );
}

