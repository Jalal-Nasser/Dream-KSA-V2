import React from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';

/**
 * UI-only login screen.
 * - Google button shows icon on left
 * - Apple button shows only on iOS
 * - Buttons are disabled (design-only)
 */

export default function LoginScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Dreams</Text>
        <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>اسم العرض</Text>
        <TextInput placeholder="أدخل اسم العرض" placeholderTextColor="#94a3b8" style={styles.input} editable={false} />

        <Text style={[styles.label, { marginTop: 16 }]}>تسجيل الدخول بواسطة</Text>

        {/* Google button */}
        <TouchableOpacity style={styles.socialRow} disabled>
          <View style={styles.iconWrap}>
            <Image source={require('../assets/icons/google.png')} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={styles.socialText}>متابعة بـ Google</Text>
        </TouchableOpacity>

        {/* Phone button (kept) */}
        <TouchableOpacity style={styles.socialRow} disabled>
          <View style={styles.iconWrap}>
            <Image source={require('../assets/icons/phone.png')} style={styles.icon} resizeMode="contain" />
          </View>
          <Text style={styles.socialText}>متابعة برقم الهاتف</Text>
        </TouchableOpacity>

        {/* Apple button — only show on iOS */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity style={styles.socialRow} disabled>
            <View style={styles.iconWrap}>
              <Image source={require('../assets/icons/apple.png')} style={styles.icon} resizeMode="contain" />
            </View>
            <Text style={styles.socialText}>متابعة بـ Apple</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.primaryBtn} disabled>
          <Text style={styles.primaryText}>متابعة</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.small}>بالاستمرار، أنت توافق على الشروط وسياسة الخصوصية</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#071233', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  header: { alignItems: 'center', marginTop: 28 },
  logo: { width: 120, height: 120, marginBottom: 12 },
  title: { color: '#ffffff', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#9aa4bf', fontSize: 14, marginTop: 6 },
  card: { width: '100%', backgroundColor: '#061126', borderRadius: 16, padding: 16, marginTop: 24, elevation: 2 },
  label: { color: '#9aa4bf', fontSize: 12, marginBottom: 8, textAlign: 'right' },
  input: { backgroundColor: '#021226', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#0b1826', textAlign: 'right' },

  socialRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#14202b',
    marginTop: 10,
    backgroundColor: 'transparent'
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginLeft: 8
  },
  icon: { width: 20, height: 20, tintColor: undefined },

  socialText: { color: '#fff', fontSize: 15, flex: 1, textAlign: 'center' },

  primaryBtn: { marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: '#7b2cff', alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  footer: { marginBottom: 20 },
  small: { color: '#6b7280', fontSize: 12, textAlign: 'center' }
});
