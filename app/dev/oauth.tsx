import * as React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { authRedirectUri, redirectDouble, redirectSingle } from '../../lib/linking';

export default function OAuthDebug() {
  return (
    <View style={s.root}>
      <Text style={s.h}>OAuth Redirects</Text>
      <Text style={s.k}>AuthSession makeRedirectUri</Text>
      <Text style={s.code}>{authRedirectUri}</Text>
      <Text style={s.k}>Linking.createURL (Android triple-slash form)</Text>
      <Text style={s.code}>{redirectDouble}</Text>
      <Text style={s.k}>Single-slash form</Text>
      <Text style={s.code}>{redirectSingle}</Text>
      <Text style={[s.k,{opacity:0.7}]}>Add ALL above to Supabase → Auth → URL Configuration → Redirect URLs.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, padding:16, gap:10, backgroundColor:'#fff' },
  h:{ fontWeight:'900', fontSize:18 },
  k:{ fontWeight:'800' },
  code:{ fontFamily:Platform.select({ ios:'Menlo', android:'monospace' }), backgroundColor:'#F3F4F6', padding:10, borderRadius:8 },
});
