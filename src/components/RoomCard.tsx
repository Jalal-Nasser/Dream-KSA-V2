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
        style={[styles.card, { flexDirection: rtl ? 'row-reverse' : 'row' }]}
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
        <View style={[styles.roomInfo, { alignItems: rtl ? 'flex-end' : 'flex-start' }]}>
          <Text style={[styles.roomTitle, { textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
            {room.title}
          </Text>
          
          <View style={[styles.hostInfo, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <MaterialCommunityIcons name="home" size={12} color="#6E5B66" />
            <Text style={styles.hostName}>{room.host_name}</Text>
            <Text style={styles.hostCountry}>{room.host_country}</Text>
          </View>
          
          <View style={[styles.participantInfo, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
            <MaterialCommunityIcons name="account-group" size={16} color="#6E5B66" />
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
    backgroundColor: '#FFF4F8',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3D6E4',
    shadowColor: '#E7BFD1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 120,
  },
  avatarContainer: {
    position: 'relative',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EA4C89',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    borderRadius: 12,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700',
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 5,
  },
  roomInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  roomTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#3A2A33',
    marginBottom: 8,
  },
  hostInfo: {
    alignItems: 'center',
    marginBottom: 8,
    gap: 4,
  },
  hostName: {
    fontSize: 14,
    color: '#6E5B66',
    fontWeight: '600',
  },
  hostCountry: {
    fontSize: 14,
    color: '#6E5B66',
  },
  participantInfo: {
    alignItems: 'center',
    gap: 4,
  },
  participantCount: {
    fontSize: 16,
    color: '#6E5B66',
    fontWeight: '600',
  },
  joinButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA4C89',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
});
