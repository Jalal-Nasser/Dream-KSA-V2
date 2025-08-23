import * as React from 'react';
import { useState, useEffect, useRef, ReactNode } from 'react';
import {
  View,
  Text,
  TextInput,
  TextInputProps,
  Pressable,
  PressableProps,
  ViewStyle,
  StyleSheet,
  Platform,
  Image,
  Animated,
  Easing,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, Link } from 'expo-router';
import {
  Sparkles,
  Heart,
  Star,
  Users,
  Globe,
  Apple,
} from 'lucide-react-native';

console.log('[ENV] URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

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


export default function LoginScreen() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const router = useRouter();

  const handleLogin = () => {
    if (phoneNumber.trim()) {
      console.log('📞 Logging in with phone number:', phoneNumber);
      router.push('/rooms');
    }
  };

  const handleAppleLogin = () => {
    console.log('🍎 Apple Login clicked');
    // TODO: Implement Apple Sign-In
  };

  return (
    <LinearGradient
      colors={['#8b5cf6', '#ec4899', '#3b82f6']}
      locations={[0.1, 0.5, 0.9]}
      style={styles.container}
    >
      <View style={{ flex: 1, justifyContent: 'center' }}>
        {/* Header */}
        <View style={{ alignItems: 'center', marginTop: 80, marginBottom: 12 }}>
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
          <View style={styles.featureIcon}><Users size={28} color="#fff" /></View>
          <View style={styles.featureIcon}><Globe size={28} color="#fff" /></View>
          <View style={styles.featureIcon}><Heart size={28} color="#fff" /></View>
        </View>

        {/* Login Card */}
        <View style={styles.loginCard}>
          <Text style={styles.loginCardTitle}>انضم إلى مجتمع Dream KSA</Text>
          <Text style={styles.loginCardDesc}>اختر طريقة تسجيل الدخول المفضلة</Text>

          {/* Apple Login (iOS only) */}
          {Platform.OS === 'ios' && (
            <Pressable onPress={handleAppleLogin} style={styles.appleButton}>
              <Apple size={22} color="#fff" style={{ marginLeft: 8 }} />
              <Text style={styles.appleButtonText}>تسجيل الدخول بـ Apple</Text>
            </Pressable>
          )}

          {/* Google Login */}
          <Pressable
            onPress={() => router.push('/login')}
            style={styles.googleButton}
          >
            <Image
              source={require('../assets/images/google.png')}
              style={{ width: 22, height: 22, marginLeft: 8 }}
              resizeMode="contain"
            />
            <Text style={styles.googleButtonText}>تسجيل الدخول بـ Google</Text>
          </Pressable>

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
          <Pressable onPress={handleLogin} style={styles.continueButton}>
            <Text style={styles.continueButtonText}>متابعة برقم الهاتف</Text>
          </Pressable>
        </View>

        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          <View style={styles.roomsRow}>
            <View style={styles.roomBadge}>
              <Star size={16} color="#facc15" />
              <Text style={styles.roomBadgeText}>أمسية عربية</Text>
            </View>
            <View style={styles.roomBadge}>
              <Sparkles size={16} color="#38bdf8" />
              <Text style={styles.roomBadgeText}>نقاش ثقافي</Text>
            </View>
          </View>
        </View>
        <Link href="/agency" style={{ color: '#2563eb', fontWeight: '700', marginTop: 12 }}>
          Manage Agencies & VIP
        </Link>
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
    width: 160,
    height: 160,
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
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
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
    marginBottom: 24,
    gap: 24,
  },
  featureIcon: {
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 8,
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    marginHorizontal: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
    marginBottom: 24,
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
    backgroundColor: '#a21caf',
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
    marginTop: 8,
  },
  bottomTitle: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  roomsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  roomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
    elevation: 2,
  },
  roomBadgeText: {
    color: '#222',
    fontSize: 13,
    marginLeft: 4,
    fontWeight: '500',
  },
});
