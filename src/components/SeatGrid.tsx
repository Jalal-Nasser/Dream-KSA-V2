import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, I18nManager } from 'react-native';
import SeatAvatar from './SeatAvatar';

export type SeatUser = {
  id: string;
  name?: string;
  role?: 'host' | 'speaker' | 'listener';
  micEnabled?: boolean;
  avatarUrl?: string;
};

export type SeatGridProps = {
  peers: SeatUser[];
  columns?: number;
  onPressSeat?: (peerId: string) => void;
  rtl?: boolean;
};

export default function SeatGrid({ 
  peers = [], 
  columns = 4, 
  onPressSeat,
  rtl = I18nManager.isRTL 
}: SeatGridProps) {
  const handlePressSeat = (peerId: string) => {
    if (onPressSeat) {
      onPressSeat(peerId);
    } else {
      console.log('[SeatGrid] pressed seat:', peerId);
    }
  };

  const renderSeat = ({ item }: { item: SeatUser }) => {
    const displayName = (item.name || item.id).slice(0, 6);
    const micStatus = item.micEnabled ? 'mic' : 'muted';
    
    return (
      <Pressable
        style={styles.seat}
        onPress={() => handlePressSeat(item.id)}
        accessibilityLabel={`Seat for ${item.name || item.id}`}
        accessibilityRole="button"
      >
        <SeatAvatar
          size={48}
          name={item.name}
          avatarUrl={item.avatarUrl}
          badge={micStatus}
          rtl={rtl}
        />
        
        <Text style={[styles.name, { textAlign: rtl ? 'right' : 'left' }]} numberOfLines={1}>
          {displayName}
        </Text>
        
        {item.role && item.role !== 'listener' && (
          <View style={[styles.roleChip, { alignSelf: rtl ? 'flex-end' : 'flex-start' }]}>
            <Text style={styles.roleText}>
              {item.role === 'host' ? '👑' : '🎙️'}
            </Text>
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { flexDirection: rtl ? 'row-reverse' : 'row' }]}>
      <FlatList
        data={peers}
        renderItem={renderSeat}
        keyExtractor={(item) => item.id}
        numColumns={columns}
        scrollEnabled={false}
        contentContainerStyle={styles.grid}
        columnWrapperStyle={columns > 1 ? styles.row : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
  },
  grid: {
    alignItems: 'center',
  },
  row: {
    justifyContent: 'space-around',
  },
  seat: {
    alignItems: 'center',
    padding: 8,
    margin: 4,
    minWidth: 60,
  },
  name: {
    fontSize: 12,
    color: '#333',
    marginTop: 4,
    fontWeight: '600',
  },
  roleChip: {
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 2,
  },
  roleText: {
    fontSize: 10,
    color: '#666',
  },
});
