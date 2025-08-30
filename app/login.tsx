import React from 'react';
import { View, Text, Image, StyleSheet, ImageBackground, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from './binmo-theme';

const BG_URI = 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1200&auto=format&fit=crop'; // soft sunset
export default function Login() {
  const router = useRouter();

  return (
    <ImageBackground source={{ uri: BG_URI }} resizeMode="cover" style={styles.bg}>
      <View style={styles.overlay} />
      <View style={styles.headerRow}>
        <Text style={styles.smallLink}>Can’t login?</Text>
      </View>

      <View style={styles.top}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.caption}>غرف الدردشة الصوتية</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.google}
          onPress={() => router.replace('/(tabs)')}
        >
          <Ionicons name="logo-google" size={18} color="#000" />
          <Text style={styles.googleTxt}>متابعة بـ Google</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.facebook}
          onPress={() => router.replace('/(tabs)')}
        >
          <Ionicons name="logo-facebook" size={18} color="#fff" />
          <Text style={styles.facebookTxt}>متابعة بـ Facebook</Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.phoneFab}
          onPress={() => router.replace('/(tabs)')}
        >
          <Ionicons name="call" size={22} color={colors.brand} />
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>باستمرارك، أنت توافق على الشروط وسياسة الخصوصية</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'space-between' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)' },
  headerRow: { paddingTop: 48, paddingHorizontal: 16, alignItems: 'flex-end' },
  smallLink: { color: '#fff', fontWeight: '700' },
  top: { alignItems: 'center', paddingTop: 16 },
  logo: { width: 120, height: 120, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.85)' },
  caption: { color: '#fff', marginTop: 8, fontWeight: '600' },
  actions: { paddingHorizontal: 16, paddingBottom: 60, gap: 12, alignItems: 'center' },
  google: {
    width: '88%', backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10
  },
  googleTxt: { color: '#111', fontWeight: '800', fontSize: 14, textAlign: 'center', flex: 1 },
  facebook: {
    width: '88%', backgroundColor: '#1877F2', borderRadius: 14,
    paddingVertical: 12, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 10
  },
  facebookTxt: { color: '#fff', fontWeight: '800', fontSize: 14, textAlign: 'center', flex: 1 },
  phoneFab: { width: 64, height: 64, borderRadius: 32, backgroundColor: 'rgba(255,255,255,0.95)', alignItems: 'center', justifyContent: 'center' },
  terms: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', paddingBottom: 16, fontSize: 12 }
});
