import React from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';

/**
 * Binmo-inspired Login screen (UI-only).
 * - No backend imports (safe at module load).
 * - White floating card, pill social buttons with left icons, big centered logo.
 * - Buttons disabled (design-only). RTL Arabic-friendly alignment.
 */

export default function LoginScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.screen}>
      {/* Decorative top shape to mimic Binmo gradient/header */}
      <View style={styles.headerShape} />

      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Dreams</Text>
        <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardLabel}>اسم العرض</Text>
        <TextInput placeholder="أدخل اسم العرض" placeholderTextColor="#8b95a6" style={styles.input} editable={false} />

        <Text style={[styles.cardLabel, { marginTop: 18 }]}>تسجيل الدخول بواسطة</Text>

        <TouchableOpacity style={styles.pill} disabled>
          <View style={styles.pillIconWrap}>
            <Image source={require('../assets/icons/google.png')} style={styles.pillIcon} resizeMode="contain" />
          </View>
          <Text style={styles.pillText}>متابعة بـ Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.pill} disabled>
          <View style={styles.pillIconWrap}>
            <Image source={require('../assets/icons/phone.png')} style={styles.pillIcon} resizeMode="contain" />
          </View>
          <Text style={styles.pillText}>متابعة برقم الهاتف</Text>
        </TouchableOpacity>

        {/* iOS-only Apple button (design-only) */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.pill} disabled>
            <View style={styles.pillIconWrap}>
              <Image source={require('../assets/icons/apple.png')} style={styles.pillIcon} resizeMode="contain" />
            </View>
            <Text style={styles.pillText}>متابعة بـ Apple</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.cta} disabled>
          <Text style={styles.ctaText}>متابعة</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.footerTxt}>بالاستمرار، أنت توافق على الشروط وسياسة الخصوصية</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#071233',
    alignItems: 'center',
  },
  headerShape: {
    position: 'absolute',
    top: -120,
    width: 420,
    height: 420,
    borderRadius: 210,
    backgroundColor: '#7b2cff',
    opacity: 0.12,
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginTop: 40,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 8,
  },
  title: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    marginTop: 6,
  },
  subtitle: {
    color: '#a9b4c6',
    fontSize: 13,
    marginTop: 4,
  },

  card: {
    width: '92%',
    backgroundColor: '#071826',
    borderRadius: 18,
    padding: 18,
    marginTop: 28,
    // subtle shadow (Android/iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  cardLabel: {
    color: '#9aa4bf',
    fontSize: 12,
    textAlign: 'right',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#021226',
    color: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#0b1826',
    textAlign: 'right',
  },

  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  pillIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
    marginRight: 8,
  },
  pillIcon: {
    width: 20,
    height: 20,
  },
  pillText: {
    flex: 1,
    textAlign: 'center',
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },

  cta: {
    marginTop: 18,
    backgroundColor: '#ff7a00',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },

  footerTxt: {
    color: '#6b7280',
    fontSize: 12,
    marginTop: 18,
    marginBottom: 22,
    textAlign: 'center',
  },
});
