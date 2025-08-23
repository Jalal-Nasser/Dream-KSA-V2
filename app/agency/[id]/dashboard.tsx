import React, { useEffect, useState } from "react";
import { View, Text, Pressable, Alert, ScrollView } from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";
import { createInvite, listInvites } from "@/src/db/invites";

export default function Dashboard() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id!;

  const [invites, setInvites] = useState<any[]>([]);

  async function loadInvites() {
    try {
      const rows = await listInvites(agencyId);
      setInvites(rows);
    } catch (e: any) {
      console.warn("listInvites failed", e?.message);
    }
  }

  useEffect(() => {
    if (!agencyId) return;
    loadInvites();
    const ch = supabase
      .channel(`invites_${agencyId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "agency_invites", filter: `agency_id=eq.${agencyId}` }, loadInvites)
      .subscribe();
    return () => supabase.removeChannel(ch);
  }, [agencyId]);

  async function handleCreateInvite(role: "member" | "host") {
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
      Alert.alert("Failed", e?.message || "Not allowed");
    }
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#0E131A" }} contentContainerStyle={{ padding: 16, gap: 12 }}>
      {/* Invite via Link buttons */}
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <Text style={{ color: "white", fontWeight: "800", marginBottom: 8 }}>Invite via Link</Text>
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pressable
            onPress={() => handleCreateInvite("member")}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "#6C5CE7" }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Create Member Link</Text>
          </Pressable>
          <Pressable
            onPress={() => handleCreateInvite("host")}
            style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: "#22c55e" }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Create Host Link</Text>
          </Pressable>
        </View>
        <Text style={{ color: "#9BA7B4", marginTop: 8, fontSize: 12 }}>
          Share the link. Users must be signed in; tapping it joins them to this agency.
        </Text>
      </View>

      {/* Active Invites list */}
      <View style={{ padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" }}>
        <Text style={{ color: "white", fontWeight: "800", marginBottom: 8 }}>Active Invites</Text>
        {invites.length === 0 ? (
          <Text style={{ color: "#9BA7B4" }}>No invites yet.</Text>
        ) : (
          invites.map((it) => {
            const disabled =
              it.uses >= (it.max_uses ?? 1) || (it.expires_at && new Date(it.expires_at) < new Date());
            const url = Linking.createURL("invite", { queryParams: { code: it.code } });
            return (
              <View
                key={it.id}
                style={{ paddingVertical: 8, borderTopWidth: 1, borderColor: "rgba(255,255,255,0.06)" }}
              >
                <Text style={{ color: "white", fontWeight: "700" }}>
                  {it.role.toUpperCase()} • {it.code} {disabled ? " (disabled)" : ""}
                </Text>
                <Text style={{ color: "#9BA7B4", fontSize: 12 }}>
                  uses {it.uses}/{it.max_uses ?? "∞"} • exp{" "}
                  {it.expires_at ? new Date(it.expires_at).toLocaleDateString() : "—"}
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
                          const { error } = await supabase
                            .from("agency_invites")
                            .update({ max_uses: it.uses })
                            .eq("id", it.id);
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
          })
        )}
      </View>
    </ScrollView>
  );
}