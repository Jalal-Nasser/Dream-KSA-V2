import React from 'react';
import { SafeAreaView, View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';

/**
 * UI-only login screen - uses assets/images/logo.png
 */

export default function LoginScreen(): JSX.Element {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        {/* Use the real logo path you provided */}
        <Image source={require('../assets/images/logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>Dreams</Text>
        <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>اسم العرض</Text>
        <TextInput placeholder="أدخل اسم العرض" placeholderTextColor="#94a3b8" style={styles.input} editable={false} />

        <Text style={[styles.label, { marginTop: 16 }]}>تسجيل الدخول بواسطة</Text>
        <TouchableOpacity style={styles.socialBtn} disabled>
          <Text style={styles.socialText}>متابعة بـ Google (تصميم فقط)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.socialBtn} disabled>
          <Text style={styles.socialText}>متابعة برقم الهاتف (تصميم فقط)</Text>
        </TouchableOpacity>

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
  header: { alignItems: 'center', marginTop: Platform.OS === 'ios' ? 28 : 20 },
  logo: { width: 120, height: 120, marginBottom: 12, borderRadius: 12, backgroundColor: 'transparent' },
  title: { color: '#ffffff', fontSize: 30, fontWeight: '800' },
  subtitle: { color: '#9aa4bf', fontSize: 14, marginTop: 6 },
  card: { width: '100%', backgroundColor: '#061126', borderRadius: 16, padding: 16, marginTop: 24, elevation: 2 },
  label: { color: '#9aa4bf', fontSize: 12, marginBottom: 8, textAlign: 'right' },
  input: { backgroundColor: '#021226', color: '#fff', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#0b1826', textAlign: 'right' },
  socialBtn: { marginTop: 10, padding: 12, borderRadius: 10, borderWidth: 1, borderColor: '#14202b', alignItems: 'center' },
  socialText: { color: '#fff', fontSize: 14 },
  primaryBtn: { marginTop: 16, padding: 14, borderRadius: 12, backgroundColor: '#7b2cff', alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  footer: { marginBottom: 20 },
  small: { color: '#6b7280', fontSize: 12, textAlign: 'center' }
});
