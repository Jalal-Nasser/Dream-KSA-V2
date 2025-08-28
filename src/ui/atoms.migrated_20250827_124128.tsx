import * as React from 'react';
import { View, Text, Image, Pressable, ViewStyle, TextStyle, ImageStyle } from 'react-native';
type Style = ViewStyle | TextStyle | ImageStyle;

export function Spacer({ size = 12, horizontal = false }: { size?: number; horizontal?: boolean }) {
  return <View style={horizontal ? { width: size } : { height: size }} />;
}
export function Row({ children, style, align='center', justify='flex-start', wrap=false }:{
  children?: React.ReactNode; style?: Style|Style[]; align?: ViewStyle['alignItems']; justify?: ViewStyle['justifyContent']; wrap?: boolean;
}) {
  return <View style={[{ flexDirection:'row', alignItems:align, justifyContent:justify, flexWrap: wrap?'wrap':'nowrap' }, style as any]}>{children}</View>;
}
export function Col({ children, style, align='stretch', justify='flex-start' }:{
  children?: React.ReactNode; style?: Style|Style[]; align?: ViewStyle['alignItems']; justify?: ViewStyle['justifyContent'];
}) {
  return <View style={[{ flexDirection:'column', alignItems:align, justifyContent:justify }, style as any]}>{children}</View>;
}
export function Title({ children, style }: { children?: React.ReactNode; style?: TextStyle|TextStyle[] }) {
  return <Text style={[{ fontSize:22, fontWeight:'700' }, style as any]}>{children}</Text>;
}
export function Subtitle({ children, style }: { children?: React.ReactNode; style?: TextStyle|TextStyle[] }) {
  return <Text style={[{ fontSize:14, opacity:0.8 }, style as any]}>{children}</Text>;
}
export function TextMuted({ children, style }: { children?: React.ReactNode; style?: TextStyle|TextStyle[] }) {
  return <Text style={[{ color:'#6b7280' }, style as any]}>{children}</Text>;
}
export function Divider({ inset=0, style }: { inset?: number; style?: ViewStyle|ViewStyle[] }) {
  return <View style={[{ height:1, backgroundColor:'#e5e7eb', marginLeft: inset }, style as any]} />;
}
export function Chip({ children, selected=false, onPress, style }:{
  children?: React.ReactNode; selected?: boolean; onPress?: () => void; style?: ViewStyle|ViewStyle[];
}) {
  return (
    <Pressable onPress={onPress} style={[{ paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor: selected ? '#0ea5e9' : '#f1f5f9' }, style as any]}>
      <Text style={{ color: selected ? '#fff' : '#0f172a', fontWeight:'600' }}>{children}</Text>
    </Pressable>
  );
}
export function Badge({ children, style }:{ children?: React.ReactNode; style?: ViewStyle|ViewStyle[] }) {
  return <View style={[{ paddingVertical:2, paddingHorizontal:8, borderRadius:999, backgroundColor:'#e2e8f0' }, style as any]}><Text style={{ fontSize:12, fontWeight:'600', color:'#0f172a' }}>{children}</Text></View>;
}
export function Avatar({ uri, size=40, label, style }:{ uri?: string|null; size?: number; label?: string; style?: ViewStyle|ViewStyle[] }) {
  const r = size/2; if (uri) return <Image source={{ uri }} style={[{ width:size, height:size, borderRadius:r }, style as any]} />;
  const letter = (label ?? '?').slice(0,1).toUpperCase();
  return <View style={[{ width:size, height:size, borderRadius:r, alignItems:'center', justifyContent:'center', backgroundColor:'#cbd5e1' }, style as any]}><Text style={{ fontWeight:'700', color:'#0f172a' }}>{letter}</Text></View>;
}
const Atoms = { Row, Col, Spacer, Title, Subtitle, TextMuted, Divider, Chip, Badge, Avatar };
export default Atoms;






