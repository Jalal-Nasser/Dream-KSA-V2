import React from "react";
import { View, Pressable, Text, I18nManager } from "react-native";

export default function VoiceBar({
  role,
  muted,
  onToggleMic,
  onRaiseLower,
  onLeave,
}: {
  role: "host" | "speaker" | "listener";
  muted: boolean;
  onToggleMic: () => void;
  onRaiseLower: () => void;
  onLeave: () => void;
}) {
  const isRTL = I18nManager.isRTL;
  return (
    <View
      style={{
        flexDirection: isRTL ? "row-reverse" : "row",
        backgroundColor: "#fff",
        padding: 10,
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        alignItems: "center",
        justifyContent: "space-around",
        elevation: 6,
      }}
    >
      <Pressable onPress={onToggleMic} style={{ padding: 8 }}>
        <Text>{muted ? "تشغيل الميك" : "إغلاق الميك"}</Text>
      </Pressable>
      <Pressable onPress={onRaiseLower} style={{ padding: 8 }}>
        <Text>رفع/إنزال اليد</Text>
      </Pressable>
      <Pressable onPress={onLeave} style={{ padding: 8 }}>
        <Text style={{ color: "#b91c1c" }}>الخروج</Text>
      </Pressable>
    </View>
  );
}
