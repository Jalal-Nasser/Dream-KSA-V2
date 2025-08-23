import React, { useEffect, useState } from "react";
import { Screen, Title, Card, Button } from "@/src/ui/primitives";
import { View, Text, TextInput, Alert, Switch } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { supabase } from "@/lib/supabase";

export default function CustomizeAgency() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id!;
  const [row, setRow] = useState<any>(null);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [color, setColor] = useState("#6C5CE7");
  const [welcome, setWelcome] = useState("");
  const [freeMic, setFreeMic] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from("agencies").select("*").eq("id", agencyId).maybeSingle();
      if (data) {
        setRow(data);
        setName((data as any).name || "");
        setDesc((data as any).description || "");
        setColor((data as any).theme_color || "#6C5CE7");
        setWelcome((data as any).welcome_text || "");
        setFreeMic(((data as any).default_mic_policy || "queue") === "free");
      }
    })();
  }, [agencyId]);

  async function save() {
    const { error } = await supabase
      .from("agencies")
      .update({
        name,
        description: desc,
        theme_color: color,
        welcome_text: welcome,
        default_mic_policy: freeMic ? "free" : "queue",
      })
      .eq("id", agencyId);
    if (error) return Alert.alert("Save failed", error.message);
    Alert.alert("Saved");
  }

  return (
    <Screen>
      <Title>Customize Agency</Title>
      <View style={{ height: 12 }} />
      <Card>
        <Text style={{ color: "white", fontWeight: "700" }}>Icon URL</Text>
        <TextInput
          value={(row?.icon_url as string) || ""}
          onChangeText={async (val) => {
            setRow((r: any) => ({ ...r, icon_url: val }));
            await supabase.from("agencies").update({ icon_url: val }).eq("id", agencyId);
          }}
          style={input}
          placeholder="https://..."
          placeholderTextColor="#6b7280"
        />
      </Card>

      <View style={{ height: 12 }} />
      <Card>
        <Text style={{ color: "white", fontWeight: "700" }}>Name</Text>
        <TextInput value={name} onChangeText={setName} style={input} />
        <Text style={{ color: "white", fontWeight: "700", marginTop: 8 }}>Description</Text>
        <TextInput value={desc} onChangeText={setDesc} style={[input, { height: 80 }]} multiline />
        <Text style={{ color: "white", fontWeight: "700", marginTop: 8 }}>Theme color (hex)</Text>
        <TextInput value={color} onChangeText={setColor} style={input} />
        <Text style={{ color: "white", fontWeight: "700", marginTop: 8 }}>Welcome text</Text>
        <TextInput value={welcome} onChangeText={setWelcome} style={[input, { height: 60 }]} multiline />
        <View style={{ height: 12 }} />
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Text style={{ color: "white" }}>Free mic (no queue)</Text>
          <Switch value={freeMic} onValueChange={setFreeMic} />
        </View>
        <View style={{ height: 12 }} />
        <Button label="Save" onPress={save} />
      </Card>
    </Screen>
  );
}

const input = {
  color: "white",
  borderWidth: 1,
  borderColor: "#1f2937",
  borderRadius: 12,
  padding: 10,
  marginTop: 6,
};



