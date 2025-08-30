import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

/**
 * Polished login screen:
 * - Couple background image (remote) + gradient tint (pink -> purple -> blue)
 * - Translucent white login card (rounded)
 * - Google (white pill), Facebook (blue pill), Phone FAB
 * - Tapping any CTA navigates to /(tabs) (UI only)
 */

const BG_URI = 'https://images.unsplash.com/photo-1508997449629-303059a0397b?q=80&w=1400&auto=format&fit=crop';

export default function Login() {
  const router = useRouter();
  return (
    <ImageBackground source={{ uri: BG_URI }} style={styles.bg} resizeMode="cover">
      {/* color tint */}
      <LinearGradient
        colors={['rgba(234,88,206,0.36)', 'rgba(123,82,255,0.28)', 'rgba(20,150,255,0.20)']}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* subtle dim so white elements read */}
      <View style={styles.dim} />

      {/* Top small link */}
      <View style={styles.topRow}>
        <Text style={styles.topLink}>Can't login?</Text>
      </View>

      <View style={styles.center}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
      </View>

      {/* translucent login card */}
      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>انضم إلى مجتمع Dream KSA</Text>
          <Text style={styles.cardSub}>اختر طريقة تسجيل الدخول المفضلة</Text>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.btnWhite}
            onPress={() => router.replace('/(tabs)')}
          >
            <View style={styles.iconLeft}><Ionicons name="logo-google" size={18} color="#DB4437" /></View>
            <Text style={styles.btnWhiteText}>متابعة بـ Google</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            style={styles.btnFB}
            onPress={() => router.replace('/(tabs)')}
          >
            <View style={styles.iconLeft}><Ionicons name="logo-facebook" size={18} color="#fff" /></View>
            <Text style={styles.btnFBText}>متابعة بـ Facebook</Text>
          </TouchableOpacity>

          <View style={{ height: 6 }} />
        </View>

        {/* Phone FAB below */}
        <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="call" size={22} color="#00B050" />
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>باستمرارك، أنت توافق على الشروط وسياسة الخصوصية</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'space-between', backgroundColor: '#000' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.08)' },

  topRow: { paddingTop: 44, paddingHorizontal: 18, alignItems: 'flex-end' },
  topLink: { color: 'rgba(255,255,255,0.95)', fontWeight: '700' },

  center: { alignItems: 'center', marginTop: 6 },
  logo: { width: 120, height: 120, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', padding: 8 },
  subtitle: { color: 'rgba(255,255,255,0.95)', marginTop: 10, fontWeight: '600' },

  cardWrap: { alignItems: 'center', paddingHorizontal: 20 },
  card: {
    width: '94%',
    backgroundColor: 'rgba(255,255,255,0.88)',
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 8
  },
  cardTitle: { fontWeight: '800', fontSize: 16, color: '#111827', marginBottom: 6 },
  cardSub: { color: '#6B7280', marginBottom: 12 },

  btnWhite: {
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E6E6E9',
    marginBottom: 10
  },
  btnWhiteText: { color: '#111', fontWeight: '800', fontSize: 15 },
  iconLeft: { position: 'absolute', left: 12 },

  btnFB: {
    width: '100%',
    backgroundColor: '#1877F2',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnFBText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  fab: {
    marginTop: 14,
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 6
  },

  terms: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: 14, fontSize: 12 }
});
