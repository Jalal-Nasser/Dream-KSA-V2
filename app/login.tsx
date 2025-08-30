import React, { useEffect, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  Animated,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen(): JSX.Element {
  // Background animation: gentle Ken Burns (zoom + drift)
  const bgScale = useRef(new Animated.Value(1)).current;
  const bgTranslate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgScale, { toValue: 1.06, duration: 12000, useNativeDriver: true }),
        Animated.timing(bgScale, { toValue: 1.0, duration: 12000, useNativeDriver: true }),
      ])
    ).start();
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgTranslate, { toValue: -14, duration: 9000, useNativeDriver: true }),
        Animated.timing(bgTranslate, { toValue: 0, duration: 9000, useNativeDriver: true }),
      ])
    ).start();
  }, [bgScale, bgTranslate]);

  return (
    <View style={styles.bg}>
      {/* Animated background image */}
      <Animated.Image
        source={require('../assets/images/login-bg.png')}
        resizeMode="cover"
        style={[
          styles.bgImage,
          {
            transform: [{ scale: bgScale }, { translateY: bgTranslate }],
            opacity: 0.98,
          },
        ]}
      />
      <StatusBar barStyle="light-content" />
      <View style={styles.topCircle} />

      <SafeAreaView style={styles.safe}>
        {/* top-right */}
        <TouchableOpacity style={styles.topRight} activeOpacity={0.7}>
          <Text style={styles.topRightText}>Can't login?</Text>
        </TouchableOpacity>

        {/* logo only (NO 'Dreams' title) */}
        <View style={styles.logoWrap}>
          <View style={styles.logoBackground}>
            <Image
              source={require('../assets/images/logo.png')}
              resizeMode="contain"
              style={styles.logo}
            />
          </View>
          <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
        </View>

        {/* actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.9}>
            {/* Revert to using the Google icon image */}
            <Image
              source={require('../assets/icons/google.png')}
              resizeMode="contain"
              style={styles.googleIcon}
            />
            <Text style={styles.googleText}>متابعة بـ Google</Text>
          </TouchableOpacity>

          {/* Facebook button (brand-style, below Google) */}
          <View style={{ height: 12 }} />
          <TouchableOpacity style={styles.facebookBtn} activeOpacity={0.9}>
            <Image
              source={require('../assets/icons/facebook.png')}
              resizeMode="contain"
              style={styles.facebookIcon}
            />
            <Text style={styles.facebookText}>متابعة بـ Facebook</Text>
          </TouchableOpacity>

          <View style={{ height: 18 }} />

          <TouchableOpacity style={styles.phoneBtn} activeOpacity={0.9}>
            {/* Vector phone icon (no white background) */}
            <Ionicons name="call" size={32} color="#12B76A" />
          </TouchableOpacity>
        </View>

        {/* consent */}
        <Text style={styles.legal}>
          بالاستمرار، أنت توافق على الشروط وسياسة الخصوصية
        </Text>
      </SafeAreaView>
    </View>
  );
}

const { height, width } = require('react-native').Dimensions.get('window');

const styles = StyleSheet.create({
  bg: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  bgImage: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    width: '100%',
    height: '100%',
  },

  safe: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  topRight: {
    position: 'absolute',
    right: 14,
    top: Platform.OS === 'android' ? 14 : 36,
    zIndex: 20,
  },
  topRightText: { color: '#fff', fontSize: 13 },

  topCircle: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    top: -width * 0.7,
    alignSelf: 'center',
    borderRadius: (width * 1.5) / 2,
    backgroundColor: 'rgba(226, 27, 115, 0.18)', // soft pink halo
  },

  logoWrap: { marginTop: Platform.OS === 'android' ? 56 : 84, alignItems: 'center' },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 32, // Changed from 70 to create a rounded square
    backgroundColor: 'white', // Changed to a solid, opaque white
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 }, // Made shadow softer
    shadowOpacity: 0.1, // Made shadow softer
    shadowRadius: 12, // Made shadow softer
    elevation: 8,
  },
  // Make the logo bigger; assumes transparent PNG in ../assets/images/logo.png
  logo: { width: 125, height: 125 },
  subtitle: { marginTop: 10, color: 'rgba(255,255,255,0.9)', fontSize: 13 },

  actions: {
    position: 'absolute',
    bottom: Math.max(56, height * 0.16),
    width: '86%',
    alignItems: 'center',
  },

  googleBtn: {
    width: '78%',
    maxWidth: 440,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  // Restore style for the Google image icon
  googleIcon: { width: 24, height: 24, marginRight: 12 },
  googleText: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '600', color: '#0b2433' },

  // Facebook button — brand blue, white text/icons
  facebookBtn: {
    width: '78%',
    maxWidth: 440,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: '#1877F2',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  // Use image for Facebook icon
  facebookIcon: { width: 24, height: 24, marginRight: 12 },
  facebookText: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#fff' },

  phoneBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },
  // Restore style for the phone image icon
  phoneIcon: { width: 36, height: 36 },

  legal: {
    position: 'absolute',
    bottom: 18,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
  },
});
