import React from 'react';
import { View, Text, Pressable, Image, StyleSheet, I18nManager, Animated } from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

export type RoomCardProps = {
  room: {
    id: string;
    title: string;
    host_name?: string;
    host_country?: string;
    participant_count?: number;
    status?: 'live' | 'soon';
    host_avatar?: string | null;
  };
  onPress: (roomId: string) => void;
  joining?: boolean;
  rtl?: boolean;
};

export default function RoomCard({ room, onPress, joining = false, rtl = I18nManager.isRTL }: RoomCardProps) {
  const scaleValue = React.useRef(new Animated.Value(1)).current;

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
    if (!joining) {
      onPress(room.id);
    }
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
      <Pressable
        style={styles.card}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={joining}
      >
        {/* Host Avatar */}
        <View style={styles.avatarContainer}>
          {room.host_avatar ? (
            <Image source={{ uri: room.host_avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{room.host_name?.[0] || 'م'}</Text>
            </View>
          )}
          
          {/* Status Badge */}
          <View style={[
            styles.statusBadge,
            { backgroundColor: room.status === 'live' ? '#FF4444' : '#F0679F' }
          ]}>
            <Text style={styles.statusText}>
              {room.status === 'live' ? 'مباشر' : 'قريباً'}
            </Text>
          </View>
          
          {/* Yellow Indicator */}
          <View style={styles.yellowIndicator} />
        </View>

        {/* Room Info */}
        <View style={styles.roomInfo}>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {room.title}
          </Text>
          
          <View style={styles.hostInfo}>
            <MaterialCommunityIcons name="home" size={12} color="#666" />
            <Text style={styles.hostName}>{room.host_name}</Text>
            <Text style={styles.hostCountry}>{room.host_country}</Text>
          </View>
          
          <View style={styles.participantInfo}>
            <MaterialCommunityIcons name="account-group" size={16} color="#666" />
            <Text style={styles.participantCount}>{room.participant_count || 0}</Text>
          </View>
        </View>

        {/* Join Button (only for "soon" rooms) */}
        {room.status === 'soon' && (
          <Pressable 
            style={styles.joinButton}
            onPress={handlePress}
            disabled={joining}
          >
            <Text style={styles.joinButtonText}>+</Text>
          </Pressable>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 140,
  },
  avatarContainer: {
    position: 'relative',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EA4C89',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FF4444',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    zIndex: 5,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  yellowIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFD700',
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 5,
  },
  roomInfo: {
    padding: 16,
    alignItems: 'center',
  },
  roomTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  hostInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  hostName: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  hostCountry: {
    fontSize: 12,
    color: '#666',
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  participantCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  joinButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EA4C89',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
});
