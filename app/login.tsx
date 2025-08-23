import React, { useState, ReactNode, useEffect } from 'react';
import { useRouter } from 'expo-router';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  TextInput,
  Image,
  Animated,
  Easing,
  TextInputProps,
  PressableProps,
  ViewStyle,
  Platform,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Users,
  Globe,
  Heart,
  Star,
  Sparkles,
  Apple,
} from 'lucide-react-native';
import * as WebBrowser from 'expo-web-browser';
import { getRedirectUri, useSupabaseAuthListener } from '@/auth/redirect';
import { supabase } from '@/lib/supabase';
import DevTokenButton from '@/components/DevTokenButton';

async function onLoginWithGoogle() {
  const redirectTo = getRedirectUri();
  console.log('[AUTH] start google with redirect', redirectTo);
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: false },
  });
  if (error) {
    console.error('[AUTH] google error', error);
  } else {
    console.log('[AUTH] url opened', data?.url);
    if (data?.url && Platform.OS !== 'web') {
      await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    }
  }
}

type CustomInputProps = TextInputProps & {
  placeholder?: string;
  style?: ViewStyle;
};

const CustomInput: React.FC<CustomInputProps> = ({ placeholder, style, ...props }) => (
  <View style={[styles.inputContainer, style]}>
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor="#6b7280"
      {...props}
    />
  </View>
);

type CustomButtonProps = PressableProps & {
  children: ReactNode;
  style?: ViewStyle;
};

const CustomButton: React.FC<CustomButtonProps> = ({ children, style, ...props }) => (
  <Pressable style={[styles.buttonBase, style]} {...props}>
    {children}
  </Pressable>
);

type AnimatedViewProps = {
  delay?: number;
  children: ReactNode;
};

const AnimatedView: React.FC<AnimatedViewProps> = ({ delay = 0, children }) => {
  const floatAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          delay: delay,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 3000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [delay, floatAnim]);

  const translateY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -20],
  });

  return <Animated.View style={{ transform: [{ translateY }] }}>{children}</Animated.View>;
};

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setHasSession(!!session);
    };
    checkSession();
  }, []);

  useSupabaseAuthListener();

  const handlePhoneLogin = async () => {
    if (!phoneNumber.trim() || phoneNumber.length !== 9) {
      Alert.alert('خطأ', 'يرجى إدخال رقم هاتف صحيح مكون من 9 أرقام');
      return;
    }

    try {
      setLoading(true);
      const e164 = '+966' + phoneNumber.trim();
      
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164,
        options: { channel: 'sms' },
      });
      
      if (error) {
        Alert.alert('خطأ في إرسال الرمز', error.message);
        return;
      }
      
      router.push({ 
        pathname: '/verify', 
        params: { phone: e164, via: 'sms' } 
      });
    } catch (error: any) {
      Alert.alert('خطأ في إرسال الرمز', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleLogin = () => {
    Alert.alert('تسجيل الدخول بـ Apple', 'سيتم إضافة هذه الميزة قريباً');
  };

  return (
    <LinearGradient
      colors={['#3B82F6', '#EC4899', '#8B5CF6']}
      locations={[0.1, 0.5, 0.9]}
      style={styles.container}
    >
      <DevTokenButton />
      
      {/* Temporary OAuth Debug Info */}
      {__DEV__ && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>Debug Info:</Text>
          <Text style={styles.debugText}>Scheme: dream-ksa</Text>
          <Text style={styles.debugText}>Path: auth/callback</Text>
          
          {/* Reset Google Button */}
          <Pressable
            onPress={async () => {
              await supabase.auth.signOut();
              await WebBrowser.openBrowserAsync('https://accounts.google.com/Logout');
            }}
            style={styles.resetGoogleButton}
          >
            <Text style={styles.resetGoogleButtonText}>Reset Google</Text>
          </Pressable>
        </View>
      )}
      
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginTop: 60, marginBottom: 8 }}>
          <View style={styles.logoWrapper}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
          <Text style={styles.desc}>تواصل مع الأصدقاء حول المملكة والعالم</Text>
        </View>

        {/* Feature Icons */}
        <View style={styles.featuresRow}>
          <AnimatedView delay={0}>
            <View style={styles.featureIcon}><Users size={24} color="#fff" /></View>
          </AnimatedView>
          <AnimatedView delay={0.5}>
            <View style={styles.featureIcon}><Globe size={24} color="#fff" /></View>
          </AnimatedView>
          <AnimatedView delay={1}>
            <View style={styles.featureIcon}><Heart size={24} color="#fff" /></View>
          </AnimatedView>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.loginCardTitle}>انضم إلى مجتمع Dream KSA</Text>
          <Text style={styles.loginCardDesc}>اختر طريقة تسجيل الدخول المفضلة</Text>

          {/* Apple Login (iOS only) */}
          {Platform.OS === 'ios' && (
            <CustomButton onPress={handleAppleLogin} style={styles.appleButton}>
              <Apple size={22} color="#fff" style={{ marginLeft: 8 }} />
              <Text style={styles.appleButtonText}>تسجيل الدخول بـ Apple</Text>
            </CustomButton>
          )}

          {/* Google Login */}
          <CustomButton
            onPress={onLoginWithGoogle}
            style={styles.googleButton}
          >
            <Image
              source={require('../assets/images/google.png')}
              style={{ width: 22, height: 22, marginLeft: 8 }}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>تسجيل الدخول بـ Google</Text>
          </CustomButton>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>أو باستخدام رقم الهاتف</Text>
            <View style={styles.divider} />
          </View>

          {/* Phone Input */}
          <View style={styles.phoneInputRow}>
            <View style={styles.flagBox}>
              <Text style={{ fontSize: 20 }}>🇸🇦</Text>
              <Text style={{ fontSize: 16, marginLeft: 4 }}>+966</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              placeholder="5xxxxxxxx"
              placeholderTextColor="#9ca3af"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              maxLength={9}
            />
          </View>

          {/* Continue Button */}
          <CustomButton onPress={handlePhoneLogin} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>
              {loading ? 'جاري الإرسال...' : 'متابعة برقم الهاتف'}
            </Text>
          </CustomButton>

          {/* Agency Link (shown when session exists) */}
          {hasSession && (
            <View style={styles.agencyLinkContainer}>
              <CustomButton 
                onPress={() => router.push('/agency')} 
                style={styles.agencyLinkButton}
              >
                <Text style={styles.agencyLinkText}>وكالتي</Text>
              </CustomButton>
            </View>
          )}

          {/* Join Voice Room Link (shown when session exists) */}
          {hasSession && (
            <View style={styles.joinLinkContainer}>
              <CustomButton 
                onPress={() => router.push('/rooms')} 
                style={styles.joinLinkButton}
              >
                <Text style={styles.joinLinkText}>Join a Voice Room</Text>
              </CustomButton>
            </View>
          )}
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.roomsRow}>
            <View style={styles.roomBadge}>
              <Star size={14} color="#facc15" />
              <Text style={styles.roomBadgeText}>أماسي عربية</Text>
            </View>
            <View style={styles.roomBadge}>
              <Sparkles size={14} color="#38bdf8" />
              <Text style={styles.roomBadgeText}>نقاش ثقافي</Text>
            </View>
          </View>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  logoWrapper: {
    backgroundColor: '#fff',
    padding: 2,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    elevation: 6,
    marginBottom: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 140,
    height: 140,
  },
  container: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  inputContainer: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    paddingLeft: 12,
    justifyContent: 'center',
    marginBottom: 8,
  },
  input: {
    height: '100%',
    textAlign: 'right',
    direction: 'ltr',
    fontSize: 16,
    color: '#222',
  },
  buttonBase: {
    width: '100%',
    height: 48,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 2,
    textAlign: 'center',
    fontWeight: '600',
  },
  desc: {
    fontSize: 14,
    color: '#e0e7ff',
    marginBottom: 24,
    textAlign: 'center',
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 16,
  },
  featureIcon: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 14,
    padding: 12,
    marginHorizontal: 6,
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    marginHorizontal: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 16,
  },
  loginCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    textAlign: 'center',
  },
  loginCardDesc: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
    textAlign: 'center',
  },
  appleButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  appleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  googleButton: {
    backgroundColor: '#fff',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
    paddingHorizontal: 12,
  },
  googleButtonText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 8,
    color: '#64748b',
    fontSize: 13,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
  },
  flagBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#222',
    textAlign: 'right',
    direction: 'ltr',
  },
  continueButton: {
    backgroundColor: '#4A00E0',
    borderRadius: 12,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSection: {
    alignItems: 'center',
    marginTop: 4,
  },
  roomsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginHorizontal: 2,
    elevation: 2,
  },
  roomBadgeText: {
    color: '#222',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
  agencyLinkContainer: {
    marginTop: 12,
  },
  agencyLinkButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  agencyLinkText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  joinLinkContainer: {
    marginTop: 12,
  },
  joinLinkButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  joinLinkText: {
    color: '#222',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  debugContainer: {
    position: 'absolute',
    top: 100,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 12,
    borderRadius: 8,
    zIndex: 1000,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  resetGoogleButton: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  resetGoogleButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
});
