import React, { useState } from 'react'
import { View, TextInput, Button, Alert, StyleSheet, Text, Pressable } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from './lib/supabase';

export default function AuthScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSignUp, setIsSignUp] = useState(false)

  async function signUp() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            display_name: email.split('@')[0], // Use part of email as display name
          }
        }
      })
      
      if (error) throw error
      
      if (data.user && !data.session) {
        Alert.alert('Success!', 'Check your email to confirm your account.')
      } else if (data.session) {
        onLogin(data.user)
      }
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function signIn() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
      onLogin(data.user)
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  async function signInAsGuest() {
    // For demo purposes, create a guest user
    const guestEmail = `guest_${Date.now()}@dreams-ksa.app`
    const guestPassword = 'guest123456'
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({ 
        email: guestEmail, 
        password: guestPassword,
        options: {
          data: {
            display_name: `Guest_${Date.now().toString().slice(-4)}`,
            is_guest: true
          }
        }
      })
      
      if (error) throw error
      
      if (data.user) {
        onLogin(data.user)
      }
    } catch (error) {
      Alert.alert('Error', error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <LinearGradient
      colors={['#1F2937', '#111827', '#0A0E15']}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>
          {isSignUp ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}
        </Text>
        <Text style={styles.subtitle}>Dreams KSA Voice Chat</Text>
        
        <TextInput
          placeholder="البريد الإلكتروني"
          placeholderTextColor="#9ca3af"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          editable={!isLoading}
        />
        
        <TextInput
          placeholder="كلمة المرور"
          placeholderTextColor="#9ca3af"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          editable={!isLoading}
        />
        
        <Pressable 
          style={[styles.primaryButton, isLoading && styles.disabledButton]} 
          onPress={isSignUp ? signUp : signIn}
          disabled={isLoading}
        >
          <Text style={styles.primaryButtonText}>
            {isLoading ? 'جاري التحميل...' : (isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول')}
          </Text>
        </Pressable>
        
        <Pressable 
          style={styles.secondaryButton} 
          onPress={() => setIsSignUp(!isSignUp)}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>
            {isSignUp ? 'لديك حساب؟ تسجيل الدخول' : 'ليس لديك حساب؟ إنشاء حساب'}
          </Text>
        </Pressable>
        
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>أو</Text>
          <View style={styles.dividerLine} />
        </View>
        
        <Pressable 
          style={[styles.guestButton, isLoading && styles.disabledButton]} 
          onPress={signInAsGuest}
          disabled={isLoading}
        >
          <Text style={styles.guestButtonText}>
            دخول كضيف
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ca3af',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    color: '#fff',
    fontSize: 16,
    textAlign: 'right',
  },
  primaryButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    padding: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  secondaryButtonText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  dividerText: {
    color: '#9ca3af',
    fontSize: 14,
    marginHorizontal: 16,
  },
  guestButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  guestButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
