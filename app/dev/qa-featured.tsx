import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { fetchAgencyRooms, tryToggleFeaturedOnce, getMyUserId } from "@/src/qa/featuredQA";
import { useCanFeatureRoom } from "@/src/hooks/useCanFeatureRoom";

type Row = { id: string; name: string; featured: boolean; owner_id: string; agency_id: string|null };

export default function QAFeatured() {
  // open with deep link: exp+dream-ksa://dev/qa-featured?agencyId=<uuid>
  const { agencyId } = useLocalSearchParams<{ agencyId?: string }>();
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [me, setMe] = useState<string|null>(null);
  const [rooms, setRooms] = useState<Row[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [listening, setListening] = useState(false);

  function log(s: string) { setLogs((L) => [`${new Date().toLocaleTimeString()} ${s}`, ...L].slice(0, 200)); }

  useEffect(() => { 
    (async () => { 
      const { data } = await supabase.auth.getUser();
      setSignedIn(!!data.user);
      setMe(await getMyUserId()); 
      if (agencyId) setRooms(await fetchAgencyRooms(agencyId)); 
    })(); 
  }, [agencyId]);

  // Realtime probe
  useEffect(() => {
    if (!agencyId) return;
    const ch = supabase
      .channel(`qa_rooms_${agencyId}`)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "rooms", filter: `agency_id=eq.${agencyId}` }, (payload) => {
        log(`[RT] rooms UPDATE ${payload.new?.id} featured=${payload.new?.featured}`);
      })
      .subscribe();
    setListening(true);
    return () => { supabase.removeChannel(ch); setListening(false); };
  }, [agencyId]);

  if (!signedIn) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#0E131A" }}>
        <Text style={{ color:"white", fontSize:16 }}>⚠️ Please login first</Text>
      </View>
    );
  }

  return (
    <View style={{ flex:1, backgroundColor:"#0E131A", padding:16 }}>
      <Text style={{ color:"white", fontWeight:"800", fontSize:18 }}>QA: Featured Rooms</Text>
      <Text style={{ color:"#9BA7B4", marginTop:4 }}>agency: {agencyId || "(none)"} • me: {me?.slice(0,8) || "?"} • rt: {listening ? "ON" : "OFF"}</Text>

      <FlatList
        style={{ marginTop:12 }}
        data={rooms}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height:8 }} />}
        renderItem={({ item }) => {
          const allowed = useCanFeatureRoom(item);
          return (
            <View style={{ padding:12, borderRadius:12, borderWidth:1, borderColor:"rgba(255,255,255,0.08)", backgroundColor:"rgba(255,255,255,0.06)" }}>
              <Text style={{ color:"white", fontWeight:"700" }}>{item.name} {item.featured ? "★" : ""}</Text>
              <Text style={{ color:"#9BA7B4", fontSize:12 }}>room {item.id.slice(0,8)}… • owner {item.owner_id.slice(0,8)}… • canFeature={String(allowed)}</Text>

              <View style={{ height:8 }} />
              <Pressable
                onPress={async () => {
                  const r = await tryToggleFeaturedOnce(item.id, item.featured);
                  if (r.ok) {
                    log(`[PASS] RLS update allowed=${String(allowed)} (expected ${allowed})`);
                  } else {
                    log(`[${allowed ? "FAIL" : "PASS"}] RLS blocked (expected !allowed). code=${r.code || ""} msg=${r.message || ""}`);
                  }
                }}
                style={{ alignSelf:"flex-start", paddingHorizontal:12, paddingVertical:8, borderRadius:10, backgroundColor: allowed ? "#22c55e" : "#334155" }}
              >
                <Text style={{ color:"white", fontWeight:"700" }}>Test Toggle</Text>
              </Pressable>
            </View>
          );
        }}
      />

      <View style={{ height:12 }} />
      <Text style={{ color:"white", fontWeight:"800" }}>Logs</Text>
      <FlatList
        style={{ marginTop:8, height:180 }}
        data={logs}
        keyExtractor={(i, idx) => idx.toString()}
        renderItem={({ item }) => <Text style={{ color:"#9BA7B4", fontSize:12 }}>{item}</Text>}
      />
    </View>
  );
}

