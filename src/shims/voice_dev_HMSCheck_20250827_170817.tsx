// app/voice/dev/HMSCheck.tsx
import React, { useMemo } from "react";
import { View, Text, Pressable, Alert } from "react-native";

export default function HMSCheck() {
  if (!__DEV__) return null;

  let pkg: any = null;
  let hasSdk = false;
  try {
    // Try to require the native module
    const m = require("@100mslive/react-native-hms");
    pkg = m;
    hasSdk = !!(m && (m.HMSSDK || m.default || m.HMSInstance));
  } catch (e) {
    hasSdk = false;
  }

  const verdict = useMemo(() => (hasSdk ? "✅ HMS native SDK detected" : "❌ HMS native SDK NOT found"), [hasSdk]);

  return (
    <View style={{ marginTop: 12, gap: 8, padding: 12, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.06)" }}>
      <Text style={{ color: "white", fontWeight: "800" }}>DEV: 100ms SDK Check</Text>
      <Text style={{ color: hasSdk ? "#22c55e" : "#ef4444" }}>{verdict}</Text>
      <Pressable
        onPress={() => {
          console.log("[DEV] 100ms module:", pkg);
          Alert.alert("See console", hasSdk ? "Module details logged" : "Module not present");
        }}
        style={{ alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#334155" }}
      >
        <Text style={{ color: "white", fontWeight: "700" }}>Log Module</Text>
      </Pressable>
      <Text style={{ color: "#9BA7B4", fontSize: 12 }}>
        If NOT found, install & rebuild the Dev Client: 
        {"\n"}1) npx expo install @100mslive/react-native-hms
        {"\n"}2) npx expo run:android
        {"\n"}3) npx expo start -c
      </Text>
    </View>
  );
}


