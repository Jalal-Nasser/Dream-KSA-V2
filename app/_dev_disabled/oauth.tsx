import * as React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { authRedirectUri, expoProxyUri, routerTriple, schemeSingle } from '../../lib/linking';

export default function OAuthDebug() {
  return (
    <View style={s.root}>
      <Text style={s.h}>OAuth Redirects to add in Supabase:</Text>
      <Text style={s.k}>Expo Proxy (Expo Go):</Text>
      <Text style={s.code}>{expoProxyUri}</Text>
      <Text style={s.k}>Android triple-slash:</Text>
      <Text style={s.code}>{routerTriple}</Text>
      <Text style={s.k}>Single-slash:</Text>
      <Text style={s.code}>{schemeSingle}</Text>
      <Text style={[s.k,{opacity:0.7}]}>AuthSession returnUrl used now:</Text>
      <Text style={s.code}>{authRedirectUri}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, padding:16, gap:10, backgroundColor:'#fff' },
  h:{ fontWeight:'900', fontSize:18 },
  k:{ fontWeight:'800' },
  code:{ fontFamily:Platform.select({ ios:'Menlo', android:'monospace' }), backgroundColor:'#F3F4F6', padding:10, borderRadius:8 },
});
