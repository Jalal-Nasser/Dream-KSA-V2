import * as React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { SUPABASE_URL, SUPABASE_ANON } from '../../lib/env';

export default function EnvCheck() {
  return (
    <SafeAreaView style={{ flex:1, backgroundColor:'#FFF0F3' }}>
      <View style={styles.wrap}>
        <Text style={styles.h}>Env Check</Text>
        <Text>SUPABASE_URL: {(SUPABASE_URL || '').slice(0,48)}...</Text>
        <Text>ANON LEN: {(SUPABASE_ANON || '').length}</Text>
        <Text style={{ marginTop:10, opacity:0.6 }}>If ANON LEN is 0, Expo didn't inject your .env.</Text>
      </View>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  wrap:{ padding:16, gap:8 },
  h:{ fontWeight:'900', fontSize:18 }
});
