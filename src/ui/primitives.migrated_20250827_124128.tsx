// app/src/ui/primitives.tsx
import React from "react";
import { View, Text, TextInput, Pressable, Switch, ViewStyle, TextStyle, TextInputProps } from "react-native";

type VN = ViewStyle | undefined;
type TN = TextStyle | undefined;

export function Spacer({ h = 12 }: { h?: number }) {
  return <View style={{ height: h }} />;
}

/** Card shell with soft border */
export function Card(props: { children?: React.ReactNode; style?: VN }) {
  return (
    <View
      style={[
        {
          padding: 12,
          borderRadius: 12,
          backgroundColor: "rgba(255,255,255,0.06)",
          borderWidth: 1,
          borderColor: "#1a2330",
        },
        props.style,
      ]}
    >
      {props.children}
    </View>
  );
}

export function SectionTitle({ children, style }: { children: React.ReactNode; style?: TN }) {
  return <Text style={[{ color: "white", fontWeight: "800", fontSize: 16 }, style]}>{children}</Text>;
}

export function Subtext({ children, style }: { children: React.ReactNode; style?: TN }) {
  return <Text style={[{ color: "#9BA7B4", fontSize: 12 }, style]}>{children}</Text>;
}

export function Row(props: { children?: React.ReactNode; style?: VN }) {
  return <View style={[{ flexDirection: "row", alignItems: "center" }, props.style]}>{props.children}</View>;
}

export function Divider() {
  return <View style={{ height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 8 }} />;
}

/** Inputs & Controls */
export function Input(props: TextInputProps & { containerStyle?: VN }) {
  const { containerStyle, style, ...rest } = props;
  return (
    <View style={[{ borderWidth: 1, borderColor: "#1f2937", borderRadius: 10 }, containerStyle]}>
      <TextInput
        placeholderTextColor="#6b7280"
        style={[{ color: "white", paddingHorizontal: 12, paddingVertical: 10 }, style]}
        {...rest}
      />
    </View>
  );
}

type BtnProps = {
  onPress?: () => void;
  children?: React.ReactNode;
  style?: VN;
  disabled?: boolean;
};

export function ButtonPrimary({ onPress, children, style, disabled }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: "#6C5CE7",
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: "white", fontWeight: "800" }}>{children}</Text>
    </Pressable>
  );
}

export function ButtonGhost({ onPress, children, style, disabled }: BtnProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 12,
          backgroundColor: "#334155",
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      <Text style={{ color: "white", fontWeight: "700" }}>{children}</Text>
    </Pressable>
  );
}

export function Toggle({
  value,
  onValueChange,
  label,
}: {
  value: boolean;
  onValueChange: (v: boolean) => void;
  label?: string;
}) {
  return (
    <Row style={{ justifyContent: "space-between" }}>
      {label ? <Text style={{ color: "white", fontWeight: "700" }}>{label}</Text> : <View />}
      <Switch value={value} onValueChange={onValueChange} />
    </Row>
  );
}

/** Color helpers for theme pickers */
export function ColorDot({ color = "#6C5CE7", selected = false, onPress }: { color?: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: color,
        borderWidth: selected ? 3 : 1,
        borderColor: selected ? "#ffffff" : "rgba(255,255,255,0.35)",
      }}
    />
  );
}

export function ColorRow({
  colors = ["#6C5CE7", "#22c55e", "#ef4444", "#f59e0b", "#3b82f6", "#e11d48"],
  value,
  onChange,
}: {
  colors?: string[];
  value?: string;
  onChange?: (c: string) => void;
}) {
  return (
    <Row style={{ gap: 10, flexWrap: "wrap" }}>
      {colors.map((c) => (
        <ColorDot key={c} color={c} selected={c === value} onPress={() => onChange?.(c)} />
      ))}
    </Row>
  );
}




