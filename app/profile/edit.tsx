import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Pressable, Alert, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Screen, Card } from "@/src/ui/atoms";
import { getMe, updateProfile } from "@/src/db/profile";
import { supabase } from "@/lib/supabase";
import { useTheme } from "@/lib/ThemeProvider";

export default function ProfileEdit() {
  const theme = useTheme();
  const [me, setMe] = useState<any>(null);
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const m = await getMe();
      setMe(m);
      setUsername(m.username || "");
      setBio(m.bio || "");
      setAvatar(m.avatar_url || null);
    })();
  }, []);

  async function pickAvatar() {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ImagePicker.MediaTypeOptions.Images, 
      allowsEditing: true, 
      quality: 0.85 
    });
    if (res.canceled) return;
    const asset = res.assets[0];
    const bin = await fetch(asset.uri).then((r) => r.blob());
    const path = `avatars/${me.id}.jpg`;
    const { error } = await supabase.storage.from("agency-icons").upload(path, bin, { 
      upsert: true, 
      contentType: bin.type || "image/jpeg" 
    });
    if (error) return Alert.alert("Upload failed", error.message);
    const { data } = supabase.storage.from("agency-icons").getPublicUrl(path);
    setAvatar(data.publicUrl);
  }

  async function save() {
    try {
      setBusy(true);
      await updateProfile({ 
        username: username.trim(), 
        bio: bio.trim(), 
        avatar_url: avatar || "" 
      });
      Alert.alert("Saved");
    } catch (e: any) {
      Alert.alert("Save failed", e?.message || "Unknown");
    } finally {
      setBusy(false);
    }
  }

  if (!me) return <Screen><Text style={{ color: "white" }}>Loading…</Text></Screen>;

  return (
    <Screen>
      <Card>
        <Text style={{ color: "white", fontWeight: "800" }}>Edit Profile</Text>
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <View style={{ width: 72, height: 72, borderRadius: 999, backgroundColor: "#1f2937", overflow: "hidden" }}>
            {avatar ? <Image source={{ uri: avatar }} style={{ width: "100%", height: "100%" }} /> : null}
          </View>
          <Pressable onPress={pickAvatar} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: theme.colors.primary }}>
            <Text style={{ color: "white", fontWeight: "700" }}>Change avatar</Text>
          </Pressable>
        </View>

        <View style={{ height: 12 }} />
        <Text style={{ color: "white" }}>Username</Text>
        <TextInput 
          value={username} 
          onChangeText={setUsername} 
          placeholder="your name" 
          placeholderTextColor="#6b7280" 
          style={{ 
            color: "white", 
            borderWidth: 1, 
            borderColor: "#1f2937", 
            borderRadius: 12, 
            padding: 10, 
            marginTop: 6 
          }} 
        />
        <View style={{ height: 12 }} />
        <Text style={{ color: "white" }}>Bio</Text>
        <TextInput 
          value={bio} 
          onChangeText={setBio} 
          placeholder="about you" 
          placeholderTextColor="#6b7280" 
          multiline 
          style={{ 
            color: "white", 
            borderWidth: 1, 
            borderColor: "#1f2937", 
            borderRadius: 12, 
            padding: 10, 
            marginTop: 6, 
            height: 100 
          }} 
        />

        <View style={{ height: 12 }} />
        <Pressable 
          disabled={busy} 
          onPress={save} 
          style={{ 
            padding: 12, 
            borderRadius: 12, 
            backgroundColor: busy ? "#4B5563" : theme.colors.primary 
          }}
        >
          <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>
            {busy ? "Saving…" : "Save"}
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}
