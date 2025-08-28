// app/components/DevTokenButton.tsx
import React from "react";
import { View, Pressable, Text, Alert } from "react-native";
import { supabase } from "@/supabase";
import { ENV } from "@/env";

export default function DevTokenButton() {
  if (!__DEV__) return null;

  async function onLogSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) throw error;
      const has = !!data?.session;
      console.log("[DEV] Supabase session:", data?.session);
      Alert.alert("DEV", has ? "Session: OK (see console)" : "No active session");
    } catch (e: any) {
      Alert.alert("DEV", e?.message || "Failed to read session");
    }
  }

  return (
    <View style={{ marginTop: 12, alignSelf: "flex-start" }}>
      <Pressable
        onPress={onLogSession}
        style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#334155" }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>
          DEV: Log Supabase Session
        </Text>
      </Pressable>
      <Text style={{ color: "#9BA7B4", fontSize: 10, marginTop: 6 }}>
        ENV URL: {ENV.SUPABASE_URL ? "set" : "missing"} • HMS Token URL: {ENV.HMS_TOKEN_URL ? "set" : "missing"}
      </Text>
    </View>
  );
}




