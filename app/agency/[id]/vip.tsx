import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert, FlatList, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { listRoster } from "@/src/db/agencyRoster";
import { listVipLevels, grantVip, revokeVip, getUserVip } from "@/src/db/vip";
import VipBadge from "@/src/components/VipBadge";

export default function VipManager() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id!;
  const [me, setMe] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [levels, setLevels] = useState<any[]>([]);
  const [vipByUser, setVipByUser] = useState<Record<string, any>>({});

  useEffect(() => { (async()=>{ const { data } = await supabase.auth.getUser(); setMe(data.user?.id || null); })(); }, []);

  async function load() {
    const roster = await listRoster(agencyId);
    const { data: a } = await supabase.from("agencies").select("owner_id").eq("id", agencyId).single();
    setOwnerId(a?.owner_id || null);
    setMembers(roster);
    const lvls = await listVipLevels();
    setLevels(lvls);
    // fetch current vip per member
    const dict: Record<string, any> = {};
    for (const m of roster) {
      const v = await getUserVip(m.user_id);
      if (v) dict[m.user_id] = v;
    }
    setVipByUser(dict);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`vip_${agencyId}`)
      .on("postgres_changes", { event:"*", schema:"public", table:"user_vip" }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [agencyId]);

  const myRole = useMemo(() => {
    if (!me) return null;
    if (ownerId === me) return "owner";
    const mine = members.find(r=>r.user_id===me);
    return mine?.role || null;
  }, [me, ownerId, members]);

  const canManage = myRole === "owner" || myRole === "manager";

  if (!me) return <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#0E131A" }}><Text style={{ color:"white" }}>⚠️ Please login first</Text></View>;

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#0E131A" }} contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ color:"white", fontWeight:"800", fontSize:18 }}>VIP Manager</Text>
      <Text style={{ color:"#9BA7B4" }}>Your role: {myRole || "-"}</Text>
      {!canManage ? <Text style={{ color:"#9BA7B4", marginTop:8 }}>You don't have permission to manage VIPs.</Text> : null}

      <View style={{ padding:12, borderRadius:12, backgroundColor:"rgba(255,255,255,0.06)" }}>
        <Text style={{ color:"white", fontWeight:"800" }}>Members</Text>
        <FlatList
          data={members}
          keyExtractor={(i)=>i.user_id}
          renderItem={({ item }) => {
            const v = vipByUser[item.user_id];
            return (
              <View style={{ paddingVertical:10, borderTopWidth:1, borderColor:"rgba(255,255,255,0.06)" }}>
                <Text style={{ color:"white", fontWeight:"700" }}>{item.user_id.slice(0,8)}… • {item.role.toUpperCase()}</Text>
                <VipBadge name={v?.vip_name} color={v?.badge_color} />
                {canManage ? (
                  <View style={{ flexDirection:"row", flexWrap:"wrap", gap:8, marginTop:6 }}>
                    {levels.map((lvl:any) => (
                      <Pressable key={lvl.id}
                        onPress={async ()=>{ try { await grantVip(item.user_id, lvl.id); } catch(e:any){ Alert.alert("Failed", e?.message); } }}
                        style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:10, backgroundColor:"#334155" }}>
                        <Text style={{ color: lvl.badge_color || "#FFD700", fontWeight:"700" }}>{lvl.name}</Text>
                      </Pressable>
                    ))}
                    {v ? (
                      <Pressable onPress={async ()=>{ try { await revokeVip(item.user_id); } catch(e:any){ Alert.alert("Failed", e?.message); } }}
                        style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:10, backgroundColor:"#ef4444" }}>
                        <Text style={{ color:"white", fontWeight:"700" }}>Remove VIP</Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      </View>
    </ScrollView>
  );
}
