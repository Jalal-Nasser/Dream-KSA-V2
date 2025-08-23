import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Image, Alert, ScrollView } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from "expo-router";
import { Screen, Card } from "@/src/ui/atoms";
import { getAgencyById, updateAgency } from "@/src/db/agencySettings";
import { supabase } from "@/lib/supabase";
import { useSetPrimary } from "@/lib/ThemeProvider";

const SWATCHES = ["#6C5CE7", "#FF4F9A", "#22c55e", "#f59e0b", "#38bdf8", "#e11d48", "#a78bfa"];

export default function AgencySettings() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id!;
  const setPrimary = useSetPrimary();

  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [iconUrl, setIconUrl] = useState<string | null>(null);
  const [themeColor, setThemeColor] = useState("#6C5CE7");
  const [banner, setBanner] = useState("");

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const a = await getAgencyById(agencyId);
        if (!mounted) return;
        setName(a?.name || "");
        setIconUrl(a?.icon_url || null);
        setThemeColor(a?.theme_color || "#6C5CE7");
        setBanner(a?.featured_banner || "");
        setPrimary(a?.theme_color || "#6C5CE7");
      } catch (e: any) {
        Alert.alert("Load failed", e?.message || "Unknown");
      } finally {
        setLoading(false);
      }
    })();
    return () => { mounted = false; setPrimary("#6C5CE7"); };
  }, [agencyId]);

  async function pickIcon() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1,1], quality: 0.9 });
    if (res.canceled) return;
    const asset = res.assets[0];
    const blob = await fetch(asset.uri).then(r => r.blob());
    const path = `agency/${agencyId}/icon.jpg`;
    const { error } = await supabase.storage.from("agency-icons").upload(path, blob, { upsert: true, contentType: blob.type || "image/jpeg" });
    if (error) return Alert.alert("Upload failed", error.message);
    const { data } = supabase.storage.from("agency-icons").getPublicUrl(path);
    setIconUrl(data.publicUrl);
  }

  async function save() {
    setBusy(true);
    try {
      await updateAgency(agencyId, { name: name.trim(), icon_url: iconUrl || "", theme_color: themeColor, featured_banner: banner.trim() });
      Alert.alert("Saved");
      setPrimary(themeColor);
    } catch (e: any) {
      // RLS or other errors
      Alert.alert("Not allowed", e?.message || "You don't have permission.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <Screen><Text style={{ color: "white" }}>Loading…</Text></Screen>;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ gap: 12 }}>
        <Card>
          <Text style={{ color: "white", fontWeight: "800" }}>Agency Settings</Text>
          <View style={{ height: 12 }} />
          {/* Icon */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={{ width: 72, height: 72, borderRadius: 14, overflow: "hidden", backgroundColor: "#1f2937" }}>
              {iconUrl ? <Image source={{ uri: iconUrl }} style={{ width: "100%", height: "100%" }} /> : null}
            </View>
            <Pressable onPress={pickIcon} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: themeColor }}>
              <Text style={{ color: "white", fontWeight: "700" }}>Change Icon</Text>
            </Pressable>
          </View>

          {/* Name */}
          <View style={{ height: 12 }} />
          <Text style={{ color: "white" }}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Agency name"
            placeholderTextColor="#6b7280"
            style={{ color: "white", borderWidth: 1, borderColor: "#1f2937", borderRadius: 12, padding: 10, marginTop: 6 }}
          />

          {/* Theme color */}
          <View style={{ height: 12 }} />
          <Text style={{ color: "white" }}>Theme Color</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {SWATCHES.map((hex) => (
              <Pressable key={hex} onPress={() => setThemeColor(hex)} style={{ width: 34, height: 34, borderRadius: 999, backgroundColor: hex, borderWidth: themeColor === hex ? 3 : 0, borderColor: "white" }} />
            ))}
          </View>

          {/* Featured banner (optional) */}
          <View style={{ height: 12 }} />
          <Text style={{ color: "white" }}>Featured Banner (optional)</Text>
          <TextInput
            value={banner}
            onChangeText={setBanner}
            placeholder="Short tagline shown in Explore"
            placeholderTextColor="#6b7280"
            style={{ color: "white", borderWidth: 1, borderColor: "#1f2937", borderRadius: 12, padding: 10, marginTop: 6 }}
          />

          <View style={{ height: 12 }} />
          <Pressable disabled={busy} onPress={save} style={{ padding: 12, borderRadius: 12, backgroundColor: themeColor }}>
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>{busy ? "Saving…" : "Save Settings"}</Text>
          </Pressable>
        </Card>
      </ScrollView>
    </Screen>
  );
}
