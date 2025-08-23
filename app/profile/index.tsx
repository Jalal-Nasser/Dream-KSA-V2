import React, { useEffect, useState } from "react";
import { View, Text, Image, Pressable, FlatList } from "react-native";
import { Link } from "expo-router";
import { Screen, Card } from "@/src/ui/atoms";
import { getMe, getMyVip, listMyAgenciesLite } from "@/src/db/profile";
import VipBadge from "@/src/components/VipBadge";
import { useTheme } from "@/lib/ThemeProvider";

export default function ProfileScreen() {
  const theme = useTheme();
  const [me, setMe] = useState<any>(null);
  const [vip, setVip] = useState<any>(null);
  const [agencies, setAgencies] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const _me = await getMe();
      setMe(_me);
      setVip(await getMyVip(_me.id));
      setAgencies(await listMyAgenciesLite(_me.id));
    })();
  }, []);

  if (!me) return <Screen><Text style={{ color: "white" }}>Loading…</Text></Screen>;

  const display = me.username || me.email?.split("@")[0] || me.id.slice(0, 6);
  const handle = "@" + (me.username || me.id.slice(0, 6));

  return (
    <Screen>
      {/* Banner */}
      <View style={{ height: 120, borderRadius: 16, overflow: "hidden", backgroundColor: "#1a2330" }}>
        {/* Simple gradient substitute */}
        <View style={{ flex: 1, backgroundColor: "#0E131A" }} />
      </View>

      {/* Header row */}
      <View style={{ marginTop: -32, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between" }}>
        <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 12 }}>
          <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: "#1f2937", overflow: "hidden", borderWidth: 3, borderColor: "#0E131A" }}>
            {me.avatar_url ? <Image source={{ uri: me.avatar_url }} style={{ width: "100%", height: "100%" }} /> : null}
          </View>
          <View>
            <Text style={{ color: "white", fontWeight: "800", fontSize: 18 }}>{display}</Text>
            <Text style={{ color: "#9BA7B4" }}>{handle}</Text>
            <VipBadge name={vip?.vip_name} color={vip?.badge_color} />
          </View>
        </View>
        <Link href="/profile/edit" asChild>
          <Pressable style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12, backgroundColor: theme.colors.primary }}>
            <Text style={{ color: "white", fontWeight: "700" }}>Edit</Text>
          </Pressable>
        </Link>
      </View>

      {/* Bio */}
      {me.bio ? (
        <Text style={{ color: "#E6EDF3", marginTop: 12 }}>{me.bio}</Text>
      ) : (
        <Text style={{ color: "#9BA7B4", marginTop: 12 }}>Add a short bio to let others know you.</Text>
      )}

      {/* Agencies */}
      <View style={{ height: 16 }} />
      <Text style={{ color: "white", fontWeight: "800" }}>My Agencies</Text>
      {agencies.length ? (
        <FlatList
          style={{ marginTop: 8 }}
          data={agencies}
          keyExtractor={(i) => i.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Card>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
                  <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: "#1f2937", overflow: "hidden" }}>
                    {item.icon_url ? <Image source={{ uri: item.icon_url }} style={{ width: "100%", height: "100%" }} /> : null}
                  </View>
                  <Text style={{ color: "white", fontWeight: "700" }}>{item.name}</Text>
                </View>
                                  <Link href={{ pathname: `/agency/${item.id}/explore` }} asChild>
                    <Pressable><Text style={{ color: theme.colors.primary, fontWeight: "700" }}>Open →</Text></Pressable>
                  </Link>
              </View>
            </Card>
          )}
        />
      ) : (
        <Text style={{ color: "#9BA7B4", marginTop: 8 }}>You are not in any agency yet.</Text>
      )}
    </Screen>
  );
}
