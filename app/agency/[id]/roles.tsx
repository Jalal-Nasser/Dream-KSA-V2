import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, Alert, FlatList, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { listRoster, setRole, removeMember } from "@/src/db/agencyRoster";

export default function RolesManager() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id!;
  const [me, setMe] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setMe(data.user?.id || null);
    })();
  }, []);

  async function load() {
    const roster = await listRoster(agencyId);
    const { data: agencies } = await supabase.from("agencies").select("id,owner_id").eq("id", agencyId).limit(1);
    setOwnerId(agencies?.[0]?.owner_id || null);
    setRows(roster);
  }

  useEffect(() => {
    load();
    const ch = supabase
      .channel(`roles_${agencyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "agency_members", filter: `agency_id=eq.${agencyId}` }, load)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [agencyId]);

  const myRole = useMemo(() => {
    if (!me) return null;
    if (ownerId === me) return "owner";
    const mine = rows.find(r => r.user_id === me);
    return mine?.role || null;
  }, [me, ownerId, rows]);

  if (!me) {
    return <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#0E131A" }}>
      <Text style={{ color:"white" }}>⚠️ Please login first</Text>
    </View>;
  }

  const canManage = myRole === "owner" || myRole === "manager";

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#0E131A" }} contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ color:"white", fontWeight:"800", fontSize:18 }}>Agency Roles</Text>
      <Text style={{ color:"#9BA7B4" }}>Your role: {myRole || "-"}</Text>

      {!canManage ? (
        <Text style={{ color:"#9BA7B4", marginTop:8 }}>You don't have permission to manage roles.</Text>
      ) : null}

      <View style={{ padding:12, borderRadius:12, backgroundColor:"rgba(255,255,255,0.06)" }}>
        <Text style={{ color:"white", fontWeight:"800" }}>Members</Text>
        <FlatList
          data={rows}
          keyExtractor={(i) => i.user_id}
          renderItem={({ item }) => {
            const isOwner = item.user_id === ownerId;
            const isMe = item.user_id === me;
            return (
              <View style={{ paddingVertical:10, borderTopWidth:1, borderColor:"rgba(255,255,255,0.06)" }}>
                <Text style={{ color:"white", fontWeight:"700" }}>
                  {item.user_id.slice(0,8)}… • {isOwner ? "OWNER" : item.role.toUpperCase()}
                  {isMe ? " • YOU" : ""}
                </Text>
                {canManage && !isOwner ? (
                  <View style={{ flexDirection:"row", gap:8, marginTop:6, flexWrap:"wrap" }}>
                    <Pressable onPress={async () => { try { await setRole(agencyId, item.user_id, "manager"); } catch(e:any){ Alert.alert("Failed", e?.message); } }}
                      style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:10, backgroundColor:"#f59e0b" }}>
                      <Text style={{ color:"white", fontWeight:"700" }}>Make Manager</Text>
                    </Pressable>
                    <Pressable onPress={async () => { try { await setRole(agencyId, item.user_id, "host"); } catch(e:any){ Alert.alert("Failed", e?.message); } }}
                      style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:10, backgroundColor:"#22c55e" }}>
                      <Text style={{ color:"white", fontWeight:"700" }}>Make Host</Text>
                    </Pressable>
                    <Pressable onPress={async () => { try { await setRole(agencyId, item.user_id, "member"); } catch(e:any){ Alert.alert("Failed", e?.message); } }}
                      style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:10, backgroundColor:"#334155" }}>
                      <Text style={{ color:"white", fontWeight:"700" }}>Make Member</Text>
                    </Pressable>
                    {!isMe ? (
                      <Pressable onPress={async () => { try { await removeMember(agencyId, item.user_id); } catch(e:any){ Alert.alert("Failed", e?.message); } }}
                        style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:10, backgroundColor:"#ef4444" }}>
                        <Text style={{ color:"white", fontWeight:"700" }}>Remove</Text>
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
