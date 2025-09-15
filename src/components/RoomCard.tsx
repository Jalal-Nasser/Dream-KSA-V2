import React, { useRef } from 'react';
import { View, Text, Pressable, Animated, StyleSheet, I18nManager } from 'react-native';

const rtl = I18nManager.isRTL;

type Props = {
  title: string;
  country?: string;
  audienceCount?: number;
  isLive?: boolean;
  onPress?: () => void;
  avatarLetter?: string;
};

export default function RoomCard({
  title,
  country = 'السعودية',
  audienceCount = 0,
  isLive = true,
  onPress,
  avatarLetter,
}: Props) {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.timing(scaleValue, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(scaleValue, {
      toValue: 1,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    }
  };

  const letter = avatarLetter || title?.trim()?.[0] ?? 'م';

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        {/* Live chip */}
        {isLive && (
          <View style={styles.liveChip}>
            <Text style={styles.liveText}>مباشر</Text>
          </View>
        )}

        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{letter}</Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>

        {/* Country */}
        <Text style={styles.country} numberOfLines={1}>
          {country}
        </Text>

        {/* Audience count */}
        <View style={styles.audienceContainer}>
          <Text style={styles.audienceText}>👥 {audienceCount}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#F3D6E4',
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
    minHeight: 140,
    shadowColor: '#E7BFD1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  liveChip: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#F0679F',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 1,
  },
  liveText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
  },
  avatarContainer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#EB3B85',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  title: {
    color: '#3A2A33',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
  },
  country: {
    color: '#6E5B66',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  audienceContainer: {
    alignItems: 'center',
  },
  audienceText: {
    color: '#6E5B66',
    fontSize: 12,
    fontWeight: '500',
  },
});