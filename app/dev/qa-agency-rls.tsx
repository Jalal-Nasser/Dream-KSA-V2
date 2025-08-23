import React, { useEffect, useState } from "react";
import { View, Text, Pressable, FlatList, Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { fetchAgency, tryUpdateThemeBanner, getMyUid } from "@/src/qa/agencyRlsQA";

export default function QaAgencyRls() {
  const { agencyId } = useLocalSearchParams<{ agencyId?: string }>();
  const [signedIn, setSignedIn] = useState<boolean>(false);
  const [agency, setAgency] = useState<any>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [me, setMe] = useState<string|null>(null);

  function log(msg: string) {
    setLogs(L => [`${new Date().toLocaleTimeString()} ${msg}`, ...L].slice(0,50));
  }

  useEffect(() => { (async () => {
    const { data } = await supabase.auth.getUser();
    setSignedIn(!!data.user);
    setMe(await getMyUid());
    if (agencyId) setAgency(await fetchAgency(agencyId));
  })(); }, [agencyId]);

  async function testUpdate() {
    if (!agency) return;
    const nextColor = agency.theme_color === "#22c55e" ? "#6C5CE7" : "#22c55e";
    const result = await tryUpdateThemeBanner(agency.id, nextColor, "QA Banner " + Math.floor(Math.random()*100));
    if (result.ok) {
      log(`[PASS] UPDATE succeeded (uid=${me?.slice(0,8)}).`);
      setAgency(await fetchAgency(agency.id));
    } else {
      log(`[${result.code === "42501" ? "PASS" : "FAIL"}] UPDATE blocked (uid=${me?.slice(0,8)}). code=${result.code} msg=${result.msg}`);
    }
  }

  if (!signedIn) {
    return (
      <View style={{ flex:1, justifyContent:"center", alignItems:"center", backgroundColor:"#0E131A" }}>
        <Text style={{ color:"white", fontSize:16 }}>⚠️ Please login first</Text>
      </View>
    );
  }

  if (!agency) return <View style={{ flex:1, backgroundColor:"#0E131A", justifyContent:"center", alignItems:"center" }}><Text style={{ color:"white" }}>Loading…</Text></View>;

  return (
    <View style={{ flex:1, backgroundColor:"#0E131A", padding:16 }}>
      <Text style={{ color:"white", fontWeight:"800", fontSize:18 }}>QA: Agency RLS</Text>
      <Text style={{ color:"#9BA7B4", marginTop:4 }}>agency {agency.id.slice(0,8)}… name={agency.name}</Text>
      <Text style={{ color:"white", marginTop:8 }}>theme={agency.theme_color} • banner={agency.featured_banner}</Text>

      <View style={{ height:12 }} />
      <Pressable onPress={testUpdate} style={{ padding:12, borderRadius:12, backgroundColor:"#334155" }}>
        <Text style={{ color:"white", fontWeight:"700" }}>Test Update</Text>
      </Pressable>

      <View style={{ height:12 }} />
      <FlatList
        data={logs}
        keyExtractor={(i, idx)=>idx.toString()}
        renderItem={({ item }) => <Text style={{ color:"#9BA7B4", fontSize:12 }}>{item}</Text>}
      />
    </View>
  );
}
