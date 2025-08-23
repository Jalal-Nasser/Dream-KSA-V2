import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, FlatList, ScrollView } from "react-native";
import { useRouter, Link } from "expo-router";
import { supabase } from "@/lib/supabase";

type Agency = { id: string; name: string; owner_id: string };

export default function AgencyHome() {
  const router = useRouter();
  const [me, setMe] = useState<string | null>(null);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setMe(data.user?.id || null);
    })();
  }, []);

  async function load() {
    if (!me) return;
    // agencies I own or belong to
    const { data: owned } = await supabase
      .from("agencies")
      .select("id,name,owner_id")
      .eq("owner_id", me);

    const { data: roster } = await supabase
      .from("v_agency_roster")
      .select("agency_id")
      .eq("user_id", me);

    const ids = new Set<string>([...(owned || []).map(a => a.id), ...(roster || []).map((r: any) => r.agency_id)]);
    if (ids.size === 0) { setAgencies(owned || []); return; }

    const { data: all } = await supabase
      .from("agencies")
      .select("id,name,owner_id")
      .in("id", Array.from(ids));

    setAgencies(all || []);
  }

  useEffect(() => { load(); }, [me]);

  async function createAgency() {
    if (!me) return Alert.alert("Login required", "Please sign in first.");
    if (!newName.trim()) return Alert.alert("Name required");
    try {
      const { data, error } = await supabase
        .from("agencies")
        .insert({ name: newName.trim(), owner_id: me })
        .select("id,name,owner_id")
        .single();
      if (error) throw error;
      setNewName("");
      Alert.alert("Created", "Agency created. You are the owner.");
      router.push(`/agency/${data.id}`);
    } catch (e: any) {
      Alert.alert("Create failed", e?.message || "Unknown");
    }
  }

  if (!me) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#0E131A" }}>
        <Text style={{ color:"white", fontSize:16 }}>⚠️ Please login first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex:1, backgroundColor:"#0E131A" }} contentContainerStyle={{ padding:16, gap:12 }}>
      <Text style={{ color:"white", fontWeight:"800", fontSize:18 }}>Agencies</Text>

      {/* Create agency */}
      <View style={{ padding:12, borderRadius:12, backgroundColor:"rgba(255,255,255,0.06)" }}>
        <Text style={{ color:"white", fontWeight:"800" }}>Create New Agency</Text>
        <View style={{ height:8 }} />
        <View style={{ flexDirection:"row", gap:8 }}>
          <TextInput
            value={newName}
            onChangeText={setNewName}
            placeholder="Agency name"
            placeholderTextColor="#6b7280"
            style={{ flex:1, color:"white", borderWidth:1, borderColor:"#1f2937", borderRadius:10, paddingHorizontal:10 }}
          />
          <Pressable onPress={createAgency} style={{ paddingHorizontal:14, borderRadius:10, backgroundColor:"#6C5CE7", justifyContent:"center" }}>
            <Text style={{ color:"white", fontWeight:"800" }}>Create</Text>
          </Pressable>
        </View>
        <Text style={{ color:"#9BA7B4", fontSize:12, marginTop:6 }}>You will be the owner of the agency.</Text>
      </View>

      {/* My agencies list */}
      <View style={{ padding:12, borderRadius:12, backgroundColor:"rgba(255,255,255,0.06)" }}>
        <Text style={{ color:"white", fontWeight:"800" }}>My Agencies</Text>
        <View style={{ height:8 }} />
        {agencies.length === 0 ? (
          <Text style={{ color:"#9BA7B4" }}>You are not in any agency yet.</Text>
        ) : (
          <FlatList
            data={agencies}
            keyExtractor={(i) => i.id}
            renderItem={({ item }) => {
              const isOwner = item.owner_id === me;
              return (
                <View style={{ paddingVertical:10, borderTopWidth:1, borderColor:"rgba(255,255,255,0.06)" }}>
                  <Text style={{ color:"white", fontWeight:"700" }}>{item.name} {isOwner ? "• OWNER" : ""}</Text>
                  <View style={{ height:6 }} />
                  <Link href={`/agency/${item.id}`} asChild>
                    <Pressable style={{ alignSelf:"flex-start", paddingHorizontal:12, paddingVertical:6, borderRadius:10, backgroundColor:"#334155" }}>
                      <Text style={{ color:"white", fontWeight:"700" }}>Open</Text>
                    </Pressable>
                  </Link>
                </View>
              );
            }}
          />
        )}
      </View>
    </ScrollView>
  );
}
