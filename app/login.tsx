import React, { useState } from 'react';
import { View, Text, Image, ImageBackground, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// local assets
const BG_LOCAL = require('../assets/images/login-bg.jpg');
const LOGO = require('../assets/images/logo.png');
const GOOGLE_ICON = require('../assets/icons/google.png');

export default function Login() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
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

          <TouchableOpacity activeOpacity={0.9} style={styles.btnWhite} onPress={() => { console.log('[login] Google pressed -> /(tabs)/index'); router.replace('/(tabs)/index'); }}>
            <Image source={GOOGLE_ICON} style={styles.googleIcon} />
            <Text style={styles.btnWhiteText}>متابعة بـ Google</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.9} style={styles.btnFB} onPress={() => { console.log('[login] Facebook pressed -> /(tabs)/index'); router.replace('/(tabs)/index'); }}>
            <View style={styles.iconLeft}><Ionicons name="logo-facebook" size={18} color="#fff" /></View>
            <Text style={styles.btnFBText}>متابعة بـ Facebook</Text>
          </TouchableOpacity>

          {/* divider and mobile login box */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>أو استخدام رقم الهاتف</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.phoneRow}>
            <View style={styles.flagBox}>
              <Text style={{ fontSize: 18 }}>🇸🇦</Text>
              <Text style={{ fontSize: 15, marginLeft: 6, color: '#111827', fontWeight: '700' }}>+966</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="5xxxxxxxx"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              maxLength={9}
            />
          </View>
        </View>
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
  center: { alignItems: 'center', marginTop: -92 },
  logo: { width: 140, height: 140, borderRadius: 18, backgroundColor: 'transparent' },
  subtitle: { color: 'rgba(255,255,255,0.95)', marginTop: 12, fontWeight: '600' },

  cardWrap: { alignItems: 'center', paddingHorizontal: 20 },
  card: {
    width: '94%',
    backgroundColor: 'rgba(255,255,255,0.80)',
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

  dividerRow: { flexDirection: 'row', alignItems: 'center', width: '100%', marginTop: 10, marginBottom: 10 },
  divider: { flex: 1, height: 1, backgroundColor: '#E6E6E9' },
  dividerText: { color: '#6B7280', marginHorizontal: 8, fontSize: 12, fontWeight: '700' },

  phoneRow: {
    width: '100%',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E6E6E9',
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  flagBox: { flexDirection: 'row', alignItems: 'center' },
  phoneInput: { flex: 1, textAlign: 'right', direction: 'ltr', fontSize: 15, color: '#111827' },

  terms: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', padding: 14, fontSize: 12 }
});
