import React, { useEffect, useMemo, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, FlatList, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { createInvite, redeemInvite, listInvites } from "@/src/db/invites";

type Agency = { id: string; name: string; owner_id: string };
type Member = { user_id: string; role: "owner" | "manager" | "host" | "member" };

export default function QaInvites() {
  // optional: pass agencyId via deep link, else picker will load one
  const { agencyId: qpAgency } = useLocalSearchParams<{ agencyId?: string }>();
  const [me, setMe] = useState<string | null>(null);

  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyId, setAgencyId] = useState<string | null>(qpAgency || null);
  const [newAgencyName, setNewAgencyName] = useState("");

  const [members, setMembers] = useState<Member[]>([]);
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setMe(data.user?.id || null);
    })();
  }, []);

  useEffect(() => {
    if (!me) return;
    (async () => {
      // load agencies I own or belong to
      const { data: owned } = await supabase.from("agencies").select("id,name,owner_id").eq("owner_id", me);
      const { data: roster } = await supabase
        .from("v_agency_roster")
        .select("agency_id")
        .eq("user_id", me);
      const ids = new Set<string>([(owned || [])[0]?.id, ...(roster || []).map((r: any) => r.agency_id)].filter(Boolean) as string[]);
      const { data: anyA } = await supabase.from("agencies").select("id,name,owner_id").in("id", Array.from(ids));
      setAgencies(anyA || []);
      if (!qpAgency && anyA?.[0]?.id) setAgencyId(anyA[0].id);
    })();
  }, [me]);

  async function loadRosterAndInvites(aid: string) {
    const { data: roster } = await supabase
      .from("agency_members")
      .select("user_id, role")
      .eq("agency_id", aid);
    setMembers(
      (roster || []).concat(
        // include owner as 'owner'
        agencies
          .filter((a) => a.id === aid && a.owner_id)
          .map((a) => ({ user_id: a.owner_id, role: "owner" as const }))
      )
    );
    setInvites(await listInvites(aid));
  }

  useEffect(() => {
    if (!agencyId) return;
    loadRosterAndInvites(agencyId);
    const ch = supabase
      .channel(`qa_invites_${agencyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "agency_invites", filter: `agency_id=eq.${agencyId}` }, () =>
        loadRosterAndInvites(agencyId)
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "agency_members", filter: `agency_id=eq.${agencyId}` }, () =>
        loadRosterAndInvites(agencyId)
      )
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [agencyId, agencies]);

  const myRole = useMemo(() => {
    if (!me || !agencyId) return null;
    const a = agencies.find((x) => x.id === agencyId);
    if (a?.owner_id === me) return "owner";
    const m = members.find((x) => x.user_id === me);
    return m?.role || null;
  }, [me, agencyId, agencies, members]);

  async function createAgency() {
    if (!newAgencyName.trim()) return Alert.alert("Name required");
    const { data: meUser } = await supabase.auth.getUser();
    if (!meUser.user?.id) return Alert.alert("Sign in first");
    const { data, error } = await supabase
      .from("agencies")
      .insert({ name: newAgencyName.trim(), owner_id: meUser.user.id })
      .select("id,name,owner_id")
      .single();
    if (error) return Alert.alert("Create failed", error.message);
    setAgencies((prev) => [data, ...prev]);
    setAgencyId(data.id);
    setNewAgencyName("");
  }

  async function onCreateInvite(role: "member" | "host" | "manager") {
    if (!agencyId) return;
    try {
      const code = await createInvite(agencyId, role);
      const url = Linking.createURL("invite", { queryParams: { code } });
      if (typeof Clipboard.setStringAsync === "function") {
        await Clipboard.setStringAsync(url);
        Alert.alert("Link copied", url);
      } else {
        Alert.alert("Copy this link", url);
      }
    } catch (e: any) {
      Alert.alert("Invite failed", e?.message || "Not allowed");
    }
  }

  async function onRedeem(code: string) {
    try {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return Alert.alert("Login first", "Sign in, then retry.");
      const res = await redeemInvite(code.trim());
      if (res?.agency_id) {
        Alert.alert("Joined", `Role: ${res.role}`);
        setAgencyId(res.agency_id);
      } else {
        Alert.alert("Invalid", "Invite invalid or expired");
      }
    } catch (e: any) {
      Alert.alert("Redeem failed", e?.message || "Unknown");
    }
  }

  if (!me) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#0E131A" }}>
        <Text style={{ color: "white" }}>⚠️ Please login first</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0E131A" }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      <Text style={{ color: "white", fontWeight: "800", fontSize: 18 }}>QA: Invites</Text>
      <Text style={{ color: "#9BA7B4" }}>me: {me.slice(0, 8)}… • role: {myRole || "-"}</Text>

      {/* Agency picker / create */}
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <Text style={{ color: "white", fontWeight: "800" }}>Agency</Text>
        <View style={{ height: 8 }} />
        <FlatList
          horizontal
          data={agencies}
          keyExtractor={(i) => i.id}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setAgencyId(item.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                backgroundColor: agencyId === item.id ? "#6C5CE7" : "#334155",
                marginRight: 8,
              }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>{item.name}</Text>
            </Pressable>
          )}
        />
        <View style={{ height: 8 }} />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <TextInput
            value={newAgencyName}
            onChangeText={setNewAgencyName}
            placeholder="New agency name"
            placeholderTextColor="#6b7280"
            style={{ flex: 1, color: "white", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, paddingHorizontal: 10 }}
          />
          <Pressable onPress={createAgency} style={{ paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#22c55e", justifyContent: "center" }}>
            <Text style={{ color: "white", fontWeight: "800" }}>Create</Text>
          </Pressable>
        </View>
      </View>

      {/* Create invite (owner/manager only) */}
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <Text style={{ color: "white", fontWeight: "800" }}>Create Invite</Text>
        <Text style={{ color: "#9BA7B4", fontSize: 12 }}>
          Only owners/managers can create. Members/outsiders will hit RLS.
        </Text>
        <View style={{ height: 8 }} />
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
          <Pressable onPress={() => onCreateInvite("member")} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#6C5CE7" }}>
            <Text style={{ color: "white", fontWeight: "800" }}>Member Link</Text>
          </Pressable>
          <Pressable onPress={() => onCreateInvite("host")} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#22c55e" }}>
            <Text style={{ color: "white", fontWeight: "800" }}>Host Link</Text>
          </Pressable>
          <Pressable onPress={() => onCreateInvite("manager")} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#f59e0b" }}>
            <Text style={{ color: "white", fontWeight: "800" }}>Manager Link</Text>
          </Pressable>
        </View>
      </View>

      {/* Active invites + copy/disable */}
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <Text style={{ color: "white", fontWeight: "800" }}>Active Invites</Text>
        <View style={{ height: 8 }} />
        {agencyId ? (
          <FlatList
            data={invites}
            keyExtractor={(i) => i.id}
            renderItem={({ item: it }) => {
              const disabled = it.uses >= (it.max_uses ?? 1) || (it.expires_at && new Date(it.expires_at) < new Date());
              const url = Linking.createURL("invite", { queryParams: { code: it.code } });
              return (
                <View style={{ paddingVertical: 8, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}>
                  <Text style={{ color: "white", fontWeight: "700" }}>
                    {it.role.toUpperCase()} • {it.code} {disabled ? " (disabled)" : ""}
                  </Text>
                  <Text style={{ color: "#9BA7B4", fontSize: 12 }}>
                    uses {it.uses}/{it.max_uses ?? "∞"} • exp {it.expires_at ? new Date(it.expires_at).toLocaleDateString() : "—"}
                  </Text>
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                    <Pressable
                      onPress={async () => {
                        try {
                          if (typeof Clipboard.setStringAsync === "function") {
                            await Clipboard.setStringAsync(url);
                            Alert.alert("Link copied", url);
                          } else {
                            Alert.alert("Copy this link", url);
                          }
                        } catch (e: any) {
                          Alert.alert("Copy failed", e?.message || "Unknown");
                        }
                      }}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "#334155" }}
                    >
                      <Text style={{ color: "white", fontWeight: "700" }}>Copy</Text>
                    </Pressable>

                    {!disabled ? (
                      <Pressable
                        onPress={async () => {
                          try {
                            const { error } = await supabase.from("agency_invites").update({ max_uses: it.uses }).eq("id", it.id);
                            if (error) throw error;
                            Alert.alert("Disabled", "Invite disabled");
                          } catch (e: any) {
                            Alert.alert("Failed", e?.message || "Not allowed");
                          }
                        }}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: "#ef4444" }}
                      >
                        <Text style={{ color: "white", fontWeight: "700" }}>Disable</Text>
                      </Pressable>
                    ) : null}
                  </View>
                </View>
              );
            }}
          />
        ) : (
          <Text style={{ color: "#9BA7B4" }}>Pick an agency first.</Text>
        )}
      </View>

      {/* Redeem (as current signed-in user) */}
      <RedeemBox onRedeem={onRedeem} />
    </ScrollView>
  );
}

function RedeemBox({ onRedeem }: { onRedeem: (code: string) => void }) {
  const [code, setCode] = useState("");
  return (
    <View style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" }}>
      <Text style={{ color: "white", fontWeight: "800" }}>Redeem Invite</Text>
      <Text style={{ color: "#9BA7B4", fontSize: 12 }}>Paste a code or tap a deep link.</Text>
      <View style={{ height: 8 }} />
      <View style={{ flexDirection: "row", gap: 8 }}>
        <TextInput
          value={code}
          onChangeText={setCode}
          placeholder="CODE"
          placeholderTextColor="#6b7280"
          autoCapitalize="characters"
          style={{ flex: 1, color: "white", borderWidth: 1, borderColor: "#1f2937", borderRadius: 10, paddingHorizontal: 10 }}
        />
        <Pressable onPress={() => onRedeem(code)} style={{ paddingHorizontal: 12, borderRadius: 10, backgroundColor: "#6C5CE7", justifyContent: "center" }}>
          <Text style={{ color: "white", fontWeight: "800" }}>Redeem</Text>
        </Pressable>
      </View>
    </View>
  );
}
