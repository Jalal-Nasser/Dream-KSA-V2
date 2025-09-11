import React from "react";
import { View, Pressable, Text, I18nManager } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function VoiceBar({
  role, muted, handRaised,
  onToggleMic, onToggleHand, onLeave,
}: {
  role: "host" | "speaker" | "listener";
  muted: boolean;
  handRaised?: boolean;
  onToggleMic: () => void;
  onToggleHand: () => void;
  onLeave: () => void;
}) {
  const isRTL = true;
  const isSpeakerish = role === "host" || role === "speaker";

  const Btn = ({ onPress, children, danger=false }:{onPress:()=>void; children:React.ReactNode; danger?:boolean}) => (
    <Pressable
      onPress={onPress}
      style={({pressed})=>({
        width: 56, height: 56, borderRadius: 28,
        alignItems:"center", justifyContent:"center",
        backgroundColor: danger ? "#fee2e2" : "#ffffff",
        borderWidth: 1, borderColor: danger ? "#fecaca" : "#f1d6e3",
        opacity: pressed ? 0.85 : 1
      })}
      android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
    >
      {children}
    </Pressable>
  );

  return (
    <View style={{
      flexDirection: isRTL ? "row-reverse" : "row",
      gap: 14, padding: 12, backgroundColor: "rgba(255,255,255,0.96)",
      borderTopLeftRadius: 16, borderTopRightRadius: 16,
      borderTopWidth: 1, borderColor: "#f1d6e3",
      justifyContent: "space-between", alignItems: "center"
    }}>
      {/* Leave (right) */}
      <Btn onPress={onLeave} danger>
        <Ionicons name="exit-outline" size={26} color="#b91c1c" />
      </Btn>

      {/* Hand (middle) */}
      <Btn onPress={onToggleHand}>
        {handRaised
          ? <MaterialCommunityIcons name="hand-back-left" size={26} color="#7c3aed" />
          : <MaterialCommunityIcons name="hand-back-left-outline" size={26} color="#7c3aed" />}
      </Btn>

      {/* Mic (left) */}
      <Btn onPress={onToggleMic}>
        {muted
          ? <Ionicons name="mic-off" size={26} color="#111827" />
          : <Ionicons name="mic" size={26} color="#111827" />}
      </Btn>
    </View>
  );
}
