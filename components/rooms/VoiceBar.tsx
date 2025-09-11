import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

type Props = {
  role: "host" | "speaker" | "listener";
  muted: boolean;
  onToggleMic: () => void;
  onRaiseLower: () => void;
  onLeave: () => void;
};

export default function VoiceBar({ role, muted, onToggleMic, onRaiseLower, onLeave }: Props) {
  const isSpeakerish = role === "host" || role === "speaker";
  return (
    <View
      style={{
        padding: 12,
        gap: 12,
        flexDirection: "row-reverse", // RTL
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "rgba(255,255,255,0.95)",
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
        borderTopWidth: 1,
        borderColor: "#fbcfe8",
      }}
    >
      <TouchableOpacity onPress={onLeave} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#fee2e2" }}>
        <Text style={{ color: "#b91c1c" }}>خروج</Text>
      </TouchableOpacity>

      {isSpeakerish ? (
        <TouchableOpacity onPress={onToggleMic} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#7c3aed" }}>
          <Text style={{ color: "#fff" }}>{muted ? "تشغيل الميك" : "إغلاق الميك"}</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onRaiseLower} style={{ paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, backgroundColor: "#0ea5e9" }}>
          <Text style={{ color: "#fff" }}>✋ ارفع/أنزل يدك</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
