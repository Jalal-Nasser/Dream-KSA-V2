import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

export type SeatAvatarProps = {
  size?: number;
  name?: string;
  avatarUrl?: string;
  badge?: 'mic' | 'muted' | null;
  rtl?: boolean;
};

export default function SeatAvatar({ 
  size = 48, 
  name = '', 
  avatarUrl, 
  badge = null,
  rtl = true 
}: SeatAvatarProps) {
  const initials = (name || '').trim().slice(0, 2).toUpperCase() || '??';
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {avatarUrl ? (
        <Image 
          source={{ uri: avatarUrl }} 
          style={[styles.avatar, { width: size, height: size, borderRadius: size / 2 }]} 
        />
      ) : (
        <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
          <Text style={[styles.initials, { fontSize: size * 0.4 }]}>{initials}</Text>
        </View>
      )}
      
      {badge && (
        <View style={[styles.badge, { right: rtl ? -2 : undefined, left: rtl ? undefined : -2 }]}>
          <Text style={styles.badgeText}>
            {badge === 'mic' ? '🎙️' : '🔇'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#EA4C89',
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    color: '#fff',
    fontWeight: 'bold',
  },
  badge: {
    position: 'absolute',
    bottom: -2,
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  badgeText: {
    fontSize: 10,
  },
});
