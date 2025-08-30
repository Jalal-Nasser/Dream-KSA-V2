import React from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// local assets
const BG_LOCAL = require('../assets/images/login-bg.jpg');
const LOGO = require('../assets/images/logo.png');
const GOOGLE_ICON = require('../assets/icons/google.png');

export default function Login() {
  const router = useRouter();
  return (
    <ImageBackground source={BG_LOCAL} style={styles.bg} resizeMode="cover">
      <LinearGradient
        colors={['rgba(234,88,206,0.30)', 'rgba(123,82,255,0.22)', 'rgba(20,150,255,0.18)']}
        start={[0, 0]}
        end={[1, 1]}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.dim} />

      <View style={styles.topRow}>
        <Text style={styles.topLink}>Can't login?</Text>
      </View>

      {/* logo pushed upward (near top) */}
      <View style={styles.center}>
        <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
      </View>

      <View style={styles.cardWrap}>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>انضم إلى مجتمع Dream KSA</Text>
          <Text style={styles.cardSub}>اختر طريقة تسجيل الدخول المفضلة</Text>

          <TouchableOpacity activeOpacity={0.9} style={styles.btnWhite} onPress={() => router.replace('/(tabs)')}>
            <Image source={GOOGLE_ICON} style={styles.googleIcon} />
            <Text style={styles.btnWhiteText}>متابعة بـ Google</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} style={styles.btnFB} onPress={() => router.replace('/(tabs)')}>
            <View style={styles.iconLeft}><Ionicons name="logo-facebook" size={18} color="#fff" /></View>
            <Text style={styles.btnFBText}>متابعة بـ Facebook</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity activeOpacity={0.9} style={styles.fab} onPress={() => router.replace('/(tabs)')}>
          <Ionicons name="call" size={32} color="#00B050" />
        </TouchableOpacity>
      </View>

      <Text style={styles.terms}>باستمرارك، أنت توافق على الشروط وسياسة الخصوصية</Text>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, justifyContent: 'space-between', backgroundColor: '#000' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.06)' },

  topRow: { paddingTop: 44, paddingHorizontal: 18, alignItems: 'flex-end' },
  topLink: { color: 'rgba(255,255,255,0.95)', fontWeight: '700' },

  // pushed up by using a negative marginTop so logo sits higher on the screen
  center: { alignItems: 'center', marginTop: -72 },
  logo: { width: 140, height: 140, borderRadius: 18, backgroundColor: 'transparent' },
  subtitle: { color: 'rgba(255,255,255,0.95)', marginTop: 12, fontWeight: '600' },

  cardWrap: { alignItems: 'center', paddingHorizontal: 20 },
  card: {
    width: '94%',
    backgroundColor: 'rgba(255,255,255,0.92)',
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
  googleIcon: { width: 20, height: 20, position: 'absolute', left: 12 },

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
  iconLeft: { position: 'absolute', left: 12 },

  fab: {
    marginTop: 14,
    width: 56, height: 56, borderRadius: 28,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.96)',
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 6
  },

  terms: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: 14, fontSize: 12 }
});
