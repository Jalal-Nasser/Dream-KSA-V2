import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import VipBadge from './VipBadge';

interface ListenerTileProps {
  user: {
    user_id: string;
    display_name?: string;
    mic_status: string;
  };
  vipName?: string | null;
}

const { width: screenWidth } = Dimensions.get('window');
const tileSize = (screenWidth - 48) / 4; // 4 columns with margins

export default function ListenerTile({ user, vipName }: ListenerTileProps) {
  const displayName = user.display_name || user.user_id;
  const initials = displayName.charAt(0).toUpperCase();
  
  return (
    <View style={{ 
      width: tileSize,
      height: tileSize,
      margin: 4,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.03)',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#1a2330',
    }}>
      {/* Avatar */}
      <View style={{
        width: Math.min(tileSize * 0.5, 40),
        height: Math.min(tileSize * 0.5, 40),
        borderRadius: Math.min(tileSize * 0.25, 20),
        backgroundColor: '#374151',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 6,
      }}>
        <Text style={{ 
          color: 'white', 
          fontWeight: '700', 
          fontSize: Math.min(tileSize * 0.2, 16)
        }}>
          {initials}
        </Text>
      </View>
      
      {/* Display name */}
      <Text style={{ 
        color: 'white', 
        fontWeight: '600', 
        fontSize: Math.min(tileSize * 0.15, 11), 
        textAlign: 'center',
        marginBottom: 2,
        paddingHorizontal: 4,
      }} numberOfLines={2}>
        {displayName}
      </Text>
      
      {/* VIP badge */}
      {vipName && (
        <VipBadge name={vipName} color={null} />
      )}
    </View>
  );
}
