import React from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Replace ../../assets/logo.png with your real logo file; if missing it will simply show nothing */}
        {/* If you don't have assets/logo.png, add one or replace require with a local URI */}
        <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Dreams</Text>
        <Text style={styles.subtitle}>Group voice rooms — like Binmo</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Display name</Text>
        <TextInput placeholder="Your display name" placeholderTextColor="#94a3b8" style={styles.input} editable={false} />

        <Text style={[styles.label, { marginTop: 16 }]}>Sign in with</Text>
        <TouchableOpacity style={styles.socialBtn} disabled={true} onPress={() => { /* UI only */ }}>
          <Text style={styles.socialText}>Continue with Google (design only)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} disabled={true} onPress={() => { /* UI only */ }}>
          <Text style={styles.socialText}>Continue with Phone (design only)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.primaryBtn} disabled={true} onPress={() => { /* UI only */ }}>
          <Text style={styles.primaryText}>Continue</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.small}>By continuing you agree to our Terms & Privacy</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071233', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  header: { alignItems: 'center', marginTop: Platform.OS === 'ios' ? 28 : 20 },
  logo: { width: 92, height: 92, marginBottom: 10 },
  title: { color: '#ffffff', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#9aa4bf', fontSize: 12, marginTop: 6 },
  card: { width: '100%', backgroundColor: '#061126', borderRadius: 16, padding: 16, marginTop: 24, elevation: 2 },
  label: { color: '#9aa4bf', fontSize: 12, marginBottom: 8 },
  input: { backgroundColor: '#021226', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#0b1826' },
  socialBtn: { marginTop: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#14202b', alignItems: 'center' },
  socialText: { color: '#fff', fontSize: 14 },
  primaryBtn: { marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: '#ff7a00', alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  footer: { marginBottom: 20 },
  small: { color: '#6b7280', fontSize: 12, textAlign: 'center' }
});
