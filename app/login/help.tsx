import * as React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
export default function Help() {
  return (
    <ScrollView style={{ flex:1, backgroundColor:'#FFF' }} contentContainerStyle={{ padding:16, gap:8 }}>
      <Text style={s.h}>Can't login?</Text>
      <Text style={s.p}>Try a different provider (Apple/Google/Phone). Make sure your device time is correct and you have network access.</Text>
      <Text style={s.p}>If the problem persists, contact support@dreamsksa.online.</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({ h:{ fontSize:22, fontWeight:'900' }, p:{ fontSize:14, fontWeight:'600' }});
