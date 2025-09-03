import React from 'react';
import { View, Text, StyleSheet, Pressable, I18nManager } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

interface LuxuryVipBannerProps {
  onPress?: () => void;
  title?: string;
  subtitle?: string;
  buttonText?: string;
}

export default function LuxuryVipBanner({
  onPress,
  title = "VIP",
  subtitle = "استمتع بامتيازات حصرية",
  buttonText = "تفاصيل"
}: LuxuryVipBannerProps) {
  return (
    <Pressable onPress={onPress} style={styles.container} activeOpacity={0.9}>
      {/* Main banner with gradient background */}
      <LinearGradient
        colors={['#1a1a1a', '#2d1b1b', '#1a1a1a']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.banner}
      >
        {/* Golden border effect */}
        <View style={styles.goldenBorder}>
          {/* Left section - Shield with VIP */}
          <View style={styles.shieldSection}>
            {/* Crown */}
            <View style={styles.crownContainer}>
              <MaterialCommunityIcons name="crown" size={24} color="#D4AF37" />
            </View>
            
            {/* Shield background */}
            <View style={styles.shield}>
              {/* Decorative dots above VIP */}
              <View style={styles.decorativeDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
              
              {/* VIP Text */}
              <Text style={styles.vipText}>{title}</Text>
              
              {/* Decorative dots below VIP */}
              <View style={styles.decorativeDots}>
                <View style={styles.dot} />
                <View style={styles.dot} />
                <View style={styles.dot} />
              </View>
            </View>
          </View>
          
          {/* Right section - Banner with text */}
          <View style={styles.bannerSection}>
            <LinearGradient
              colors={['#8B0000', '#A52A2A', '#8B0000']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerBackground}
            >
              {/* Decorative pattern overlay */}
              <View style={styles.patternOverlay} />
              
              {/* Text content */}
              <View style={styles.textContent}>
                <Text style={styles.subtitle}>{subtitle}</Text>
              </View>
              
              {/* Details button */}
              <View style={styles.buttonContainer}>
                <LinearGradient
                  colors={['#D4AF37', '#B8860B', '#D4AF37']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.button}
                >
                  <Text style={styles.buttonText}>{buttonText}</Text>
                </LinearGradient>
              </View>
            </LinearGradient>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 12,
    marginVertical: 8,
  },
  banner: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  goldenBorder: {
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 14,
    overflow: 'hidden',
  },
  shieldSection: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    position: 'relative',
  },
  crownContainer: {
    position: 'absolute',
    top: -8,
    zIndex: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 4,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 4,
  },
  shield: {
    backgroundColor: '#000000',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D4AF37',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  decorativeDots: {
    flexDirection: 'row',
    gap: 4,
    marginVertical: 2,
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#D4AF37',
  },
  vipText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#D4AF37',
    textShadowColor: '#B8860B',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
    letterSpacing: 1,
  },
  bannerSection: {
    flex: 1,
    height: 80,
  },
  bannerBackground: {
    flex: 1,
    flexDirection: I18nManager.isRTL ? 'row-reverse' : 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    position: 'relative',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    opacity: 0.3,
  },
  textContent: {
    flex: 1,
    alignItems: I18nManager.isRTL ? 'flex-end' : 'flex-start',
  },
  subtitle: {
    color: '#F5F5DC',
    fontSize: 14,
    fontWeight: '600',
    textAlign: I18nManager.isRTL ? 'right' : 'left',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  buttonContainer: {
    marginLeft: I18nManager.isRTL ? 0 : 12,
    marginRight: I18nManager.isRTL ? 12 : 0,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#B8860B',
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: '#1a1a1a',
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  },
});
