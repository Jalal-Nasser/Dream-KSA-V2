import React, { useEffect, useState } from 'react';
import { Screen, Title, Card } from '@/src/ui/atoms';
import { View, Text, Pressable, FlatList } from "react-native";
import { Link, useRouter } from "expo-router";
import { supabase } from "@/lib/supabase";
import { listRooms, type Room } from "@/src/db/rooms";
import { RoomCreateModal } from "@/src/ui/RoomCreateModal";

export default function Rooms() {
  const router = useRouter();
  const [rows, setRows] = useState<Room[]>([]);
  const [openCreate, setOpenCreate] = useState(false);

  async function load() {
    const r = await listRooms();
    setRows(r);
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("rooms_insert")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "rooms" }, () => load())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  return (
    <Screen>
      <Title>Rooms</Title>
      <FlatList
        style={{ marginTop: 12 }}
        data={rows}
        keyExtractor={(i) => i.id}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Card>
            <Text style={{ color: "white", fontWeight: "800", fontSize: 16 }}>{item.name}</Text>
            {item.topic ? <Text style={{ color: "#9BA7B4", marginTop: 4 }}>{item.topic}</Text> : null}
            <View style={{ height: 8 }} />
            <Text style={{ color: "#9BA7B4" }}>
              Host: {item.owner_id.slice(0, 6)}… • {item.mic_policy === "free" ? "Free mic" : "Queue"}
            </Text>
            <View style={{ height: 10 }} />
            <Link href={{ pathname: "/voicechat", params: { appRoomId: item.id, hmsRoomId: item.id } }} asChild>
              <Pressable>
                <Text style={{ color: "#6C5CE7", fontWeight: "700" }}>Join →</Text>
              </Pressable>
            </Link>
          </Card>
        )}
      />

      <Pressable
        onPress={() => setOpenCreate(true)}
        style={{
          position: "absolute",
          right: 20,
          bottom: 30,
          backgroundColor: "#6C5CE7",
          paddingHorizontal: 18,
          paddingVertical: 12,
          borderRadius: 999,
          shadowColor: "#000",
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 4,
        }}
      >
        <Text style={{ color: "white", fontWeight: "800" }}>+ Create</Text>
      </Pressable>

      <RoomCreateModal
        visible={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreated={(roomId) => {
          setOpenCreate(false);
          router.push({ pathname: "/voicechat", params: { appRoomId: roomId, hmsRoomId: roomId } });
        }}
      />
    </Screen>
  );
}


