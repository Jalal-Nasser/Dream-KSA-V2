import * as React from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal, ImageBackground, Image, TextInput, KeyboardAvoidingView, Alert, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { getSupabase } from '../lib/supabase';
import { PALETTE } from '../lib/theme';
import { redirectNative, logRedirects } from '../lib/linking';
import { SUPABASE_URL } from '../lib/env';
import { openAndExchange } from '../lib/auth/oauthHelper';

// couples background (soft blur) – local asset
const BG_URI = require('../assets/images/login-bg.jpg');

export default function Login() {
  const supabase = getSupabase();
  const [showTips, setShowTips] = React.useState(false);
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // Animation values
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(50)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.9)).current;
  const logoBounceAnim = React.useRef(new Animated.Value(1)).current;
  const pulseAnim = React.useRef(new Animated.Value(1)).current;
  
  // Floating elements animations
  const flower1Anim = React.useRef(new Animated.Value(0)).current;
  const flower2Anim = React.useRef(new Animated.Value(0)).current;
  const flower3Anim = React.useRef(new Animated.Value(0)).current;
  const balloon1Anim = React.useRef(new Animated.Value(0)).current;
  const balloon2Anim = React.useRef(new Animated.Value(0)).current;
  const balloon3Anim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => { 
    logRedirects?.('[oauth]');
    const sub = supabase.auth.onAuthStateChange((_e,s)=>{ if(s?.user) router.replace('/(tabs)/rooms');}); 
    return ()=>sub.data.subscription.unsubscribe(); 
  }, []);

  // Start animations on component mount
  React.useEffect(() => {
    // Entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    // Elegant bounce animation for logo
    const logoBounceAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(logoBounceAnim, {
          toValue: 1.1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoBounceAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.delay(2000), // Pause between bounces
      ])
    );
    logoBounceAnimation.start();

    // Pulse animation for login box
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Floating flowers animations
    const createFloatingAnimation = (animValue: Animated.Value, duration: number, delay: number = 0) => {
      return Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(animValue, {
            toValue: 1,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(animValue, {
            toValue: 0,
            duration: duration,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ])
      );
    };

    const flower1Animation = createFloatingAnimation(flower1Anim, 4000, 0);
    const flower2Animation = createFloatingAnimation(flower2Anim, 5000, 1000);
    const flower3Animation = createFloatingAnimation(flower3Anim, 6000, 2000);
    const balloon1Animation = createFloatingAnimation(balloon1Anim, 8000, 500);
    const balloon2Animation = createFloatingAnimation(balloon2Anim, 7000, 1500);
    const balloon3Animation = createFloatingAnimation(balloon3Anim, 9000, 2500);

    flower1Animation.start();
    flower2Animation.start();
    flower3Animation.start();
    balloon1Animation.start();
    balloon2Animation.start();
    balloon3Animation.start();

    return () => {
      logoBounceAnimation.stop();
      pulseAnimation.stop();
      flower1Animation.stop();
      flower2Animation.stop();
      flower3Animation.stop();
      balloon1Animation.stop();
      balloon2Animation.stop();
      balloon3Animation.stop();
    };
  }, []);

  // Button press animation
  const handleButtonPress = (callback: () => void) => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
    callback();
  };

  const signInOAuth = async (provider: 'google' | 'facebook' | 'apple') => {
    if (provider === 'apple' && Platform.OS !== 'ios') return;

    console.log('[oauth] start', provider, 'returnUrl(native):', redirectNative);
    // Add Google-specific query params to force chooser & offline refresh
    const qp =
      provider === 'google'
        ? { prompt: 'select_account', access_type: 'offline' }
        : undefined;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: redirectNative,        // ← dream-ksa://auth-callback
        skipBrowserRedirect: true,
        scopes: provider === 'google' ? 'email profile' : undefined,
        queryParams: qp,
      },
    });
    if (error) { console.warn('[oauth] signInWithOAuth error:', error.message); return; }

    let authUrl = data?.url || '';
    if (!authUrl || !authUrl.includes('redirect_to=')) {
      const params: Record<string, string> = { 
        provider, 
        redirect_to: redirectNative,
        ...(provider === 'google' ? { 
          scopes: 'email profile',
          prompt: 'select_account',
          access_type: 'offline'
        } : {})
      };
      const qs = new URLSearchParams(params).toString();
      authUrl = `${SUPABASE_URL}/auth/v1/authorize?${qs}`;
      console.warn('[oauth] manual authorize url:', authUrl.slice(0, 180), '…');
    } else {
      console.log('[oauth] provider url:', authUrl.slice(0, 180), '…');
    }

    const how = await openAndExchange(authUrl);
    console.log('[oauth] flow via:', how);
    try {
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        router.replace('/(tabs)/rooms');
      }
    } catch (e) {
      // no-op; the auth listener will still route when it fires
    }
  };

  const signInWithEmail = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('خطأ', 'يرجى إدخال البريد الإلكتروني وكلمة المرور');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });
    setLoading(false);

    if (error) {
      Alert.alert('فشل تسجيل الدخول', error.message);
    } else {
      router.replace('/(tabs)/rooms');
    }
  };

  const signUpWithEmail = async () => {
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      Alert.alert('خطأ', 'يرجى ملء جميع الحقول');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('خطأ', 'كلمات المرور غير متطابقة');
      return;
    }

    if (password.length < 6) {
      Alert.alert('خطأ', 'كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });
    setLoading(false);

    if (error) {
      Alert.alert('فشل إنشاء الحساب', error.message);
    } else {
      Alert.alert('تم إنشاء الحساب', 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني');
    }
  };

  const handleAuth = () => {
    if (isSignUp) {
      signUpWithEmail();
    } else {
      signInWithEmail();
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ImageBackground
        source={BG_URI}
        style={StyleSheet.absoluteFill}
        imageStyle={{ opacity: 0.96, transform: [{ translateY: -20 }] }}
        resizeMode="cover"
      >

        <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.15)' }]} />
      </ImageBackground>

      {/* Floating Flowers and Balloons */}
      <Animated.View
        style={[
          styles.floatingElement,
          styles.flower1,
          {
            opacity: flower1Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.8, 0.3],
            }),
            transform: [
              {
                translateY: flower1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -30],
                }),
              },
              {
                rotate: flower1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '10deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.flowerEmoji}>🌸</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          styles.flower2,
          {
            opacity: flower2Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.4, 0.9, 0.4],
            }),
            transform: [
              {
                translateY: flower2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -40],
                }),
              },
              {
                rotate: flower2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '-15deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.flowerEmoji}>🌺</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          styles.flower3,
          {
            opacity: flower3Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.2, 0.7, 0.2],
            }),
            transform: [
              {
                translateY: flower3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -25],
                }),
              },
              {
                rotate: flower3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', '8deg'],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.flowerEmoji}>🌼</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          styles.balloon1,
          {
            opacity: balloon1Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.3, 0.8, 0.3],
            }),
            transform: [
              {
                translateY: balloon1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -50],
                }),
              },
              {
                translateX: balloon1Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 10],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.balloonEmoji}>🎈</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          styles.balloon2,
          {
            opacity: balloon2Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.4, 0.9, 0.4],
            }),
            transform: [
              {
                translateY: balloon2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -45],
                }),
              },
              {
                translateX: balloon2Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -15],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.balloonEmoji}>🎈</Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.floatingElement,
          styles.balloon3,
          {
            opacity: balloon3Anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0.2, 0.7, 0.2],
            }),
            transform: [
              {
                translateY: balloon3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -35],
                }),
              },
              {
                translateX: balloon3Anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 8],
                }),
              },
            ],
          },
        ]}
      >
        <Text style={styles.balloonEmoji}>🎈</Text>
      </Animated.View>

      <View style={styles.topRow}>
        <Pressable onPress={() => router.push('/login/help')}>
          <Text style={styles.help}>Can't login?</Text>
        </Pressable>
      </View>

      {/* center brand with logo and slug */}
      <Animated.View 
        style={[
          styles.brandSection,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}
      >
        <Animated.View
          style={{
            transform: [{ scale: logoBounceAnim }]
          }}
        >
          <ImageBackground
            source={require('../assets/images/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </Animated.View>
        <Animated.Text 
          style={[
            styles.slug,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          الدردشة الصوتية
        </Animated.Text>
      </Animated.View>

      {/* Transparent/White Login Box */}
      <Animated.View 
        style={[
          styles.loginContainer,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: pulseAnim }
            ]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.loginBox,
            {
              transform: [{ scale: pulseAnim }]
            }
          ]}
        >
          {/* Toggle between Sign In / Sign Up */}
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleBtn, !isSignUp && styles.toggleActive]}
              onPress={() => setIsSignUp(false)}
            >
              <Text style={[styles.toggleText, !isSignUp && styles.toggleTextActive]}>
                تسجيل الدخول
              </Text>
            </Pressable>
            <Pressable
              style={[styles.toggleBtn, isSignUp && styles.toggleActive]}
              onPress={() => setIsSignUp(true)}
            >
              <Text style={[styles.toggleText, isSignUp && styles.toggleTextActive]}>
                إنشاء حساب
              </Text>
            </Pressable>
          </View>

          {/* Email Input */}
          <TextInput
            style={styles.input}
            placeholder="البريد الإلكتروني"
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            textAlign="right"
          />

          {/* Password Input */}
          <TextInput
            style={styles.input}
            placeholder="كلمة المرور"
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textAlign="right"
          />

          {/* Confirm Password (only for sign up) */}
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder="تأكيد كلمة المرور"
              placeholderTextColor="#9CA3AF"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              textAlign="right"
            />
          )}

          {/* Auth Button */}
          <Pressable
            style={[styles.authBtn, loading && { opacity: 0.6 }]}
            onPress={handleAuth}
            disabled={loading}
          >
            <Text style={styles.authBtnText}>
              {loading ? '...' : isSignUp ? 'إنشاء حساب' : 'تسجيل الدخول'}
            </Text>
          </Pressable>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>أو</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* OAuth Icons Row */}
          <View style={styles.oauthRow}>
            <Pressable 
              style={styles.oauthBtn} 
              onPress={() => handleButtonPress(() => signInOAuth('google'))}
            >
              <Image
                source={require('../assets/images/google.png')}
                style={styles.oauthIcon}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable 
              style={styles.oauthBtn} 
              onPress={() => handleButtonPress(() => signInOAuth('facebook'))}
            >
              <Image
                source={require('../assets/images/facebook.png')}
                style={styles.oauthIcon}
                resizeMode="contain"
              />
            </Pressable>
            <Pressable 
              style={styles.oauthBtn} 
              onPress={() => handleButtonPress(() => setShowTips(true))}
            >
              <MaterialCommunityIcons name="cellphone" size={24} color={PALETTE.primaryDark} />
            </Pressable>
            {Platform.OS === 'ios' && (
              <Pressable 
                style={styles.oauthBtn} 
                onPress={() => handleButtonPress(() => signInOAuth('apple'))}
              >
                <Ionicons name="logo-apple" size={24} color="#000" />
              </Pressable>
            )}
          </View>
        </Animated.View>

        {/* Legal Text */}
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <Pressable onPress={() => router.push('/legal/terms')} style={{ marginTop: 16 }}>
            <Text style={styles.legal}>
              By continuing you agree to DreamKSA's <Text style={styles.link}>Terms of Service</Text> and <Text style={styles.link}>Privacy</Text>
            </Text>
          </Pressable>
        </Animated.View>
      </Animated.View>

      {/* Tips → Confirm → Phone */}
      <Modal visible={showTips} transparent animationType="fade" onRequestClose={()=>setShowTips(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Tips</Text>
            <Text style={styles.sheetBody}>By continuing, you agree to DreamKSA Terms of Service and Privacy Policy.</Text>
            <View style={{ flexDirection:'row', gap:12 }}>
              <Pressable onPress={()=>setShowTips(false)} style={[styles.sheetBtn,{ backgroundColor:'#e5e7eb'}]}>
                <Text style={[styles.sheetBtnTxt,{ color:'#111827'}]}>Cancel</Text>
              </Pressable>
              <Pressable onPress={()=>{ setShowTips(false); router.push('/login/phone'); }} style={styles.sheetBtn}>
                <Text style={styles.sheetBtnTxt}>Confirm</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topRow: { position: 'absolute', right: 16, top: 14 },
  help: { color: '#fff', fontWeight: '800', opacity: 0.95, textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 10 },
  brandSection: { position: 'absolute', left: 16, right: 16, top: 60, alignItems: 'center' },
  logo: { width: 100, height: 100, marginBottom: 12 },
  slug: { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center', opacity: 0.95, textShadowColor: 'rgba(0,0,0,0.6)', textShadowRadius: 8 },
  
  // New login container styles
  loginContainer: { position: 'absolute', left: 16, right: 16, bottom: 24, alignItems: 'center' },
  loginBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.50)',
    borderRadius: 20,
    padding: 20,
    width: '100%',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 8,
  },
  
  // Toggle buttons
  toggleRow: { flexDirection: 'row-reverse', marginBottom: 16, backgroundColor: '#F3F4F6', borderRadius: 12, padding: 2 },
  toggleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, alignItems: 'center' },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontWeight: '700', color: '#6B7280' },
  toggleTextActive: { color: PALETTE.primary, fontWeight: '800' },
  
  // Input styles
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  
  // Auth button
  authBtn: {
    backgroundColor: PALETTE.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: PALETTE.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  authBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
  
  // Divider
  divider: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 16, color: '#6B7280', fontWeight: '700' },
  
  // OAuth icons
  oauthRow: { flexDirection: 'row', justifyContent: 'center', gap: 16 },
  oauthBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  oauthIcon: { width: 24, height: 24 },
  
  // Legal text
  legal: { color: '#fff', opacity: 0.95, textAlign: 'center', fontWeight: '700', textShadowColor: 'rgba(0,0,0,0.45)', textShadowRadius: 10, fontSize: 12 },
  link: { textDecorationLine: 'underline' },
  
  // Modal styles
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' },
  sheet: { width: '86%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', gap: 10 },
  sheetTitle: { fontWeight: '900', fontSize: 18 },
  sheetBody: { textAlign: 'center', opacity: 0.7, marginBottom: 6, fontWeight: '700' },
  sheetBtn: { backgroundColor: PALETTE.primary, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  sheetBtnTxt: { color: '#fff', fontWeight: '900' },
  
  // Floating elements styles
  floatingElement: {
    position: 'absolute',
    zIndex: 1,
  },
  flower1: { top: '20%', left: '10%' },
  flower2: { top: '60%', right: '15%' },
  flower3: { top: '40%', left: '5%' },
  balloon1: { top: '15%', right: '20%' },
  balloon2: { top: '70%', left: '20%' },
  balloon3: { top: '35%', right: '5%' },
  flowerEmoji: { fontSize: 24, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
  balloonEmoji: { fontSize: 28, textShadowColor: 'rgba(0,0,0,0.3)', textShadowOffset: { width: 1, height: 1 }, textShadowRadius: 2 },
});
