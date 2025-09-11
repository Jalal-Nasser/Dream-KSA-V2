import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type GenderValue = "male" | "female" | "other";
type Props = {
  value?: GenderValue | null;
  onChange: (v: GenderValue) => void;
  label?: string;
  disabled?: boolean;
};

const AR: Record<GenderValue, string> = { male: "ذكر", female: "أنثى", other: "أخرى" };

export default function GenderSelector({ value, onChange, label = "جنس", disabled }: Props) {
  // enforce RTL locally
  const order: GenderValue[] = ["male", "female", "other"]; // renders right→left
  return (
    <View style={[styles.container, styles.rtl]}>
      <Text style={[styles.label, styles.textRtl]}>{label}</Text>
      <View style={[styles.row, styles.rowRtl]}>
        {order.map((k) => {
          const selected = value === k;
          return (
            <Pressable
              key={k}
              onPress={() => onChange(k)}
              disabled={disabled}
              style={({ pressed }) => [
                styles.pill,
                selected ? styles.pillSelected : styles.pillUnselected,
                pressed && !selected ? { opacity: 0.9 } : null,
                disabled && { opacity: 0.5 },
              ]}
              android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
            >
              <Text style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextUnselected]}>
                {AR[k]}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: "100%", marginTop: 8 },
  rtl: { writingDirection: "rtl" as any },
  textRtl: { textAlign: "right" as any },
  label: { fontSize: 13, color: "#7f1d1d", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", columnGap: 8, rowGap: 8 },
  rowRtl: { flexDirection: "row-reverse", justifyContent: "flex-end" },
  pill: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1 },
  pillUnselected: { backgroundColor: "#ffffff", borderColor: "#fbcfe8" }, // WHITE bg
  pillSelected: { backgroundColor: "#be185d", borderColor: "#be185d" },
  pillText: { fontSize: 14 },
  pillTextUnselected: { color: "#7f1d1d" },
  pillTextSelected: { color: "#ffffff", fontWeight: "600" },
});
