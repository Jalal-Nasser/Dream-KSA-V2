import * as React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';

export default function Privacy() {
  return (
    <ScrollView style={{ flex:1, backgroundColor:'#FFF' }} contentContainerStyle={{ padding:16, gap:8 }}>
      <Text style={s.h}>Privacy Policy</Text>
      <Text style={s.p}>This policy explains how DreamKSA collects and uses information.</Text>
      <Text style={s.sh}>Information We Collect</Text>
      <Text style={s.p}>Account data (e.g., phone, email), device info, usage analytics, and content you create.</Text>
      <Text style={s.sh}>How We Use Information</Text>
      <Text style={s.p}>To provide features, secure accounts, prevent abuse, and improve the service.</Text>
      <Text style={s.sh}>Sharing</Text>
      <Text style={s.p}>We do not sell personal data. We may share with service providers (hosting, SMS, analytics) under contract.</Text>
      <Text style={s.sh}>Your Choices</Text>
      <Text style={s.p}>You may access/update your info or delete your account by contacting us.</Text>
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
