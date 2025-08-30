import React from 'react';
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function Shell() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Debug Shell</Text>
        <Text style={styles.sub}>Temporary — avoids mounting tab navigator until router issue is fixed</Text>
      </View>

      <View style={styles.list}>
        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(tabs)/index')}>
          <Ionicons name="planet" size={18} color="#fff" />
          <Text style={styles.btnTxt}>Open Explore (index)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(tabs)/live')}>
          <Ionicons name="radio" size={18} color="#fff" />
          <Text style={styles.btnTxt}>Open Live</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(tabs)/agencies')}>
          <Ionicons name="people" size={18} color="#fff" />
          <Text style={styles.btnTxt}>Open Agencies</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btn} onPress={() => router.push('/(tabs)/profile')}>
          <Ionicons name="person" size={18} color="#fff" />
          <Text style={styles.btnTxt}>Open Profile (may still crash if route duplicates exist)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.btn, styles.back]} onPress={() => router.replace('/login')}>
          <Text style={styles.btnTxt}>Back to Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#071021', padding: 20 },
  header: { marginTop: 18, marginBottom: 18 },
  title: { color: '#fff', fontSize: 20, fontWeight: '900' },
  sub: { color: 'rgba(255,255,255,0.7)', marginTop: 6 },
  list: { marginTop: 18, gap: 12 },
  btn: { backgroundColor: '#0f1625', padding: 14, borderRadius: 12, flexDirection: 'row', alignItems: 'center', gap: 12 },
  btnTxt: { color: '#fff', marginLeft: 8, fontWeight: '800' },
  back: { marginTop: 24, backgroundColor: '#e21b73', justifyContent: 'center' },
});
