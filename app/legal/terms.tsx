import * as React from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';

export default function Terms() {
  return (
    <ScrollView style={{ flex:1, backgroundColor:'#FFF' }} contentContainerStyle={{ padding:16, gap:8 }}>
      <Text style={s.h}>Terms of Service</Text>
      <Text style={s.p}>Welcome to DreamKSA. By using our app you agree to these Terms.</Text>
      <Text style={s.sh}>Accounts & Eligibility</Text>
      <Text style={s.p}>You must be at least 13 years old. You are responsible for the security of your account.</Text>
      <Text style={s.sh}>Content & Conduct</Text>
      <Text style={s.p}>Do not post illegal, infringing, hateful, or harmful content. We may remove content or suspend accounts that violate these rules.</Text>
      <Text style={s.sh}>Virtual Items</Text>
      <Text style={s.p}>Virtual items and currency have no real-world value and are non-refundable unless required by law.</Text>
      <Text style={s.sh}>Termination</Text>
      <Text style={s.p}>We may suspend or terminate access for violations of these Terms.</Text>
      <Text style={s.sh}>Contact</Text>
      <Text style={s.p}>Email: support@dreamsksa.online{'\n'}Address: EEDA3244 Khobar, Saudi Arabia</Text>
      <Text style={[s.p,{opacity:0.6, marginTop:8}]}>Last updated: {new Date().toISOString().slice(0,10)}</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({
  h:{ fontSize:22, fontWeight:'900' },
  sh:{ fontSize:16, fontWeight:'900', marginTop:6 },
  p:{ fontSize:14, fontWeight:'600' },
});
