import React from 'react';
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ImageBackground,
  TouchableOpacity,
  StatusBar,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons, AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';

export default function LoginScreen(): JSX.Element {
  return (
    <ImageBackground
      source={require('../assets/images/login-bg.png')}
      style={styles.bg}
      imageStyle={{ opacity: 0.98 }}
      resizeMode="cover"
    >
      <StatusBar barStyle="light-content" />
      <View style={styles.topCircle} />

      <SafeAreaView style={styles.safe}>
        {/* top-right */}
        <TouchableOpacity style={styles.topRight} activeOpacity={0.7}>
          <Text style={styles.topRightText}>Can't login?</Text>
        </TouchableOpacity>

        {/* logo only (NO 'Dreams' title) */}
        <View style={styles.logoWrap}>
          <Image
            source={require('../assets/images/logo.png')}
            resizeMode="contain"
            style={styles.logo}
          />
          <Text style={styles.subtitle}>غرف الدردشة الصوتية</Text>
        </View>

        {/* actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.googleBtn} activeOpacity={0.9}>
            {/* Google icon without white background */}
            <AntDesign name="google" size={22} color="#EA4335" style={styles.googleIconFix} />
            <Text style={styles.googleText}>متابعة بـ Google</Text>
          </TouchableOpacity>

          {/* Facebook button (brand-style, below Google) */}
          <View style={{ height: 12 }} />
          <TouchableOpacity style={styles.facebookBtn} activeOpacity={0.9}>
            <MaterialCommunityIcons name="facebook" size={22} color="#fff" style={styles.facebookIcon} />
            <Text style={styles.facebookText}>متابعة بـ Facebook</Text>
          </TouchableOpacity>

          <View style={{ height: 18 }} />

          <TouchableOpacity style={styles.phoneBtn} activeOpacity={0.9}>
            {/* Vector phone icon (no white background) */}
            <Ionicons name="call" size={26} color="#12B76A" />
          </TouchableOpacity>
        </View>

        {/* consent */}
        <Text style={styles.legal}>
          بالاستمرار، أنت توافق على الشروط وسياسة الخصوصية
        </Text>
      </SafeAreaView>
    </ImageBackground>
  );
}

const { height, width } = require('react-native').Dimensions.get('window');

const styles = StyleSheet.create({
  bg: { flex: 1, alignItems: 'center', justifyContent: 'center' },

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
  // Make the logo bigger; assumes transparent PNG in ../assets/images/logo.png
  logo: { width: 140, height: 140 },
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
  // Using vector icons; keep spacing similar to previous image
  googleIconFix: { marginRight: 12 },
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
  facebookIcon: { marginRight: 12 },
  facebookText: { flex: 1, textAlign: 'center', fontSize: 15, fontWeight: '700', color: '#fff' },

  phoneBtn: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 6,
  },

  legal: {
    position: 'absolute',
    bottom: 18,
    textAlign: 'center',
    color: 'rgba(255,255,255,0.92)',
    fontSize: 11,
  },
});
