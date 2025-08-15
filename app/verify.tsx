import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../lib/supabase';

export default function Verify() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const { phone, via } = useLocalSearchParams<{ phone: string; via?: string }>();

  const onVerify = async () => {
    if (!code.trim() || code.length !== 6) {
      Alert.alert('خطأ', 'يرجى إدخال رمز مكون من 6 أرقام');
      return;
    }

    setLoading(true);
    const { error, data } = await supabase.auth.verifyOtp({
      phone: String(phone),
      token: code,
      type: 'sms',
    });
    setLoading(false);
    
    if (error) {
      Alert.alert('خطأ في التحقق', error.message);
      return;
    }
    
    router.replace('/join');
  };

  const onResend = async () => {
    try {
      await supabase.auth.signInWithOtp({ 
        phone: String(phone), 
        options: { channel: 'sms' } 
      });
      Alert.alert('تم الإرسال', 'تم إرسال رمز جديد إلى رقم هاتفك');
    } catch (error: any) {
      Alert.alert('خطأ في الإرسال', error.message || 'حدث خطأ غير متوقع');
    }
  };

  return (
    <LinearGradient
      colors={['#A445F7', '#4A00E0']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>أدخل رمز التحقق</Text>
            <Text style={styles.subtitle}>
              تم إرسال رمز عبر {via === 'sms' ? 'رسالة نصية' : 'رسالة'} إلى {phone}
            </Text>
          </View>

          <View style={styles.card}>
            <TextInput
              style={styles.codeInput}
              placeholder="123456"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              value={code}
              onChangeText={setCode}
              maxLength={6}
              textAlign="center"
              autoFocus
            />

            <TouchableOpacity
              style={styles.verifyButton}
              onPress={onVerify}
              disabled={loading}
            >
              <Text style={styles.verifyButtonText}>
                {loading ? 'جاري التحقق...' : 'تأكيد'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.resendButton}
              onPress={onResend}
            >
              <Text style={styles.resendButtonText}>
                إعادة الإرسال
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  codeInput: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    backgroundColor: '#f9fafb',
    marginBottom: 24,
    letterSpacing: 8,
    textAlign: 'center',
  },
  verifyButton: {
    backgroundColor: '#7c3aed',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  resendButtonText: {
    color: '#7c3aed',
    fontSize: 14,
    fontWeight: '500',
  },
});
