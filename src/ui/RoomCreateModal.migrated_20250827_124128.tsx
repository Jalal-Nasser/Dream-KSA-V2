// app/src/ui/RoomCreateModal.tsx
import React, { useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { supabase } from "@/supabase";

type Props = {
  visible: boolean;
  onClose: () => void;
  onCreated?: (room: any) => void; // receive created room row
  agencyId?: string | null; // optional agency scope
};

export function RoomCreateModal({ visible, onClose, onCreated, agencyId }: Props) {
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  async function createRoom() {
    if (!name.trim()) {
      Alert.alert("Name required", "Please enter a room name.");
      return;
    }
    try {
      setCreating(true);
      const { data: me } = await supabase.auth.getUser();
      if (!me.user?.id) {
        Alert.alert("Login required", "Please sign in first.");
        return;
      }
      // Adjust columns to match your schema (id, name, owner_id, featured?, agency_id?)
      const payload: Record<string, any> = {
        name: name.trim(),
        owner_id: me.user.id,
        featured: false,
      };
      if (agencyId != null) payload.agency_id = agencyId;

      const { data, error } = await supabase
        .from("rooms")
        .insert(payload)
        .select("*")
        .single();
      if (error) throw error;

      setName("");
      onCreated?.(data);
      onClose();
    } catch (e: any) {
      Alert.alert("Create failed", e?.message || "Unknown error");
    } finally {
      setCreating(false);
    }
  }

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "center",
          alignItems: "center",
          padding: 20,
        }}
      >
        <View
          style={{
            width: "100%",
            maxWidth: 420,
            backgroundColor: "#0E131A",
            borderRadius: 16,
            padding: 16,
            borderWidth: 1,
            borderColor: "#1a2330",
          }}
        >
          <Text style={{ color: "white", fontWeight: "800", fontSize: 18 }}>Create Room</Text>
          <View style={{ height: 12 }} />
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Room name"
            placeholderTextColor="#6b7280"
            style={{
              color: "white",
              borderWidth: 1,
              borderColor: "#1f2937",
              borderRadius: 12,
              paddingHorizontal: 12,
              paddingVertical: 10,
            }}
          />
          <View style={{ height: 12 }} />
          <View style={{ flexDirection: "row", gap: 8, justifyContent: "flex-end" }}>
            <Pressable
              onPress={onClose}
              disabled={creating}
              style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#334155" }}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={createRoom}
              disabled={creating}
              style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#6C5CE7" }}
            >
              {creating ? (
                <ActivityIndicator />
              ) : (
                <Text style={{ color: "white", fontWeight: "700" }}>Create</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default RoomCreateModal;
