import * as React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { authRedirectUri } from '../../lib/linking';

export default function DebugOAuth() {
  return (
    <View style={s.root}>
      <Text style={s.h}>OAuth Debug</Text>
      <Text style={s.p}>Redirect URI:</Text>
      <Text style={s.code}>{authRedirectUri}</Text>
      <Pressable style={s.btn} onPress={() => WebBrowser.openBrowserAsync(authRedirectUri)}>
        <Text style={s.btnTxt}>Open Redirect (test)</Text>
      </Pressable>
      <Text style={[s.p,{opacity:0.7}]}>Add this Redirect URI to Supabase → Authentication → URL Configuration.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  root:{ flex:1, padding:16, gap:10, backgroundColor:'#fff' },
  h:{ fontWeight:'900', fontSize:18 },
  p:{ fontWeight:'700' },
  code:{ fontFamily:Platform.select({ ios:'Menlo', android:'monospace' }), backgroundColor:'#F3F4F6', padding:10, borderRadius:8 },
  btn:{ backgroundColor:'#111827', paddingVertical:12, borderRadius:10, alignItems:'center' },
  btnTxt:{ color:'#fff', fontWeight:'900' },
});
