import * as React from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
export default function Help() {
  return (
    <ScrollView style={{ flex:1, backgroundColor:'#FFF' }} contentContainerStyle={{ padding:16, gap:8 }}>
      <Text style={s.h}>لا استطيع الدخول؟</Text>
      <Text style={s.p}>جرب مزود مختلف (Apple/Google/Phone). تأكد من أن وقت الجهاز صحيح وأن لديك اتصال بالإنترنت.</Text>
      <Text style={s.p}>إذا استمرت المشكلة، اتصل بـ support@dreamsksa.online.</Text>
    </ScrollView>
  );
}
const s = StyleSheet.create({ h:{ fontSize:22, fontWeight:'900' }, p:{ fontSize:14, fontWeight:'600' }});
