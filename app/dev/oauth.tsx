import * as React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { authRedirectUri, redirectDouble, redirectSingle } from '../../lib/linking';

export default function OAuthDebug() {
  return (
    <View style={s.root}>
      <Text style={s.h}>OAuth Redirects</Text>
      <Text style={s.k}>AuthSession makeRedirectUri</Text>
      <Text style={s.code}>{authRedirectUri}</Text>
      <Text style={s.k}>Linking.createURL (triple-slash on Android)</Text>
      <Text style={s.code}>{redirectDouble}</Text>
      <Text style={s.k}>Single-slash form</Text>
      <Text style={s.code}>{redirectSingle}</Text>
      <Pressable style={s.btn} onPress={() => WebBrowser.openBrowserAsync(authRedirectUri)}>
        <Text style={s.btnTxt}>Open Redirect</Text>
      </Pressable>
      <Text style={[s.k,{opacity:0.7}]}>Add ALL of the above to Supabase → Auth → URL Configuration → Redirect URLs.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, padding:16, gap:10, backgroundColor:'#fff' },
  h:{ fontWeight:'900', fontSize:18 },
  k:{ fontWeight:'800' },
  code:{ fontFamily:Platform.select({ ios:'Menlo', android:'monospace' }), backgroundColor:'#F3F4F6', padding:10, borderRadius:8 },
  btn:{ backgroundColor:'#111827', paddingVertical:12, borderRadius:10, alignItems:'center' },
  btnTxt:{ color:'#fff', fontWeight:'900' },
});
