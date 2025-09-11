import React from "react";
import { I18nManager, View, Text, Pressable, StyleSheet } from "react-native";

type GenderValue = "male" | "female" | "other";
type Props = {
  value?: GenderValue | null;
  onChange: (v: GenderValue) => void;
  label?: string;
  disabled?: boolean;
};

const AR_LABELS: Record<GenderValue, string> = {
  male: "ذكر",
  female: "أنثى",
  other: "أخرى",
};

export default function GenderSelector({ value, onChange, label = "جنس", disabled }: Props) {
  // Local RTL without forcing app-wide RTL
  const isRTL = true; // Arabic screen: render RTL regardless of global
  const order: GenderValue[] = isRTL ? ["male", "female", "other"] : ["male", "female", "other"];

  return (
    <View style={[styles.container, isRTL && styles.rtl]}>
      <Text style={[styles.label, isRTL && styles.labelRtl]}>{label}</Text>

      <View style={[styles.pillsRow, isRTL && styles.pillsRowRtl]}>
        {order.map((key) => {
          const selected = value === key;
          return (
            <Pressable
              key={key}
              disabled={disabled}
              onPress={() => onChange(key)}
              style={({ pressed }) => [
                styles.pill,
                selected && styles.pillSelected,
                pressed && !selected && styles.pillPressed,
                disabled && styles.pillDisabled,
              ]}
              android_ripple={{ color: "rgba(0,0,0,0.06)", borderless: true }}
              hitSlop={10}
              accessibilityRole="button"
              accessibilityLabel={AR_LABELS[key]}
              accessibilityState={{ selected, disabled: !!disabled }}
            >
              <Text style={[styles.pillText, selected && styles.pillTextSelected]}>{AR_LABELS[key]}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 8,
  },
  rtl: {
    writingDirection: "rtl" as any,
  },
  label: {
    fontSize: 13,
    color: "#7f1d1d", // tailwind rose-900-ish
    marginBottom: 8,
    textAlign: "left",
  },
  labelRtl: {
    textAlign: "right",
  },
  pillsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    columnGap: 8,
    rowGap: 8,
  },
  pillsRowRtl: {
    flexDirection: "row-reverse",
    justifyContent: "flex-end",
  },
  pill: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: "#fde2e8", // light rose
    borderWidth: 1,
    borderColor: "#fbcfe8",
  },
  pillPressed: {
    opacity: 0.9,
  },
  pillSelected: {
    backgroundColor: "#be185d", // rose-700
    borderColor: "#be185d",
  },
  pillDisabled: {
    opacity: 0.5,
  },
  pillText: {
    fontSize: 14,
    color: "#7f1d1d",
  },
  pillTextSelected: {
    color: "#ffffff",
    fontWeight: "600",
  },
});
