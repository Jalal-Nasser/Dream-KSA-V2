import React from 'react';
import { View, Text } from 'react-native';
import VipBadge from './VipBadge';

interface SpeakerTileProps {
  user: {
    user_id: string;
    display_name?: string;
    mic_status: string;
  };
  speaking: boolean;
  vipName?: string | null;
}

export default function SpeakerTile({ user, speaking, vipName }: SpeakerTileProps) {
  const displayName = user.display_name || user.user_id;
  const initials = displayName.charAt(0).toUpperCase();
  
  return (
    <View style={{ 
      width: 120, 
      height: 140, 
      marginHorizontal: 8, 
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Avatar with speaking ring */}
      <View style={{ position: 'relative', marginBottom: 8 }}>
        {/* Speaking ring with animation */}
        {speaking && (
          <View style={{
            position: 'absolute',
            top: -4,
            left: -4,
            right: -4,
            bottom: -4,
            borderRadius: 44,
            borderWidth: 3,
            borderColor: '#22c55e',
            shadowColor: '#22c55e',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 8,
            elevation: 8,
          }} />
        )}
        
        {/* Avatar with gradient-like effect */}
        <View style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: speaking ? '#10b981' : '#374151',
          alignItems: 'center',
          justifyContent: 'center',
          borderWidth: speaking ? 2 : 0,
          borderColor: speaking ? '#22c55e' : 'transparent',
          shadowColor: speaking ? '#22c55e' : 'transparent',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: speaking ? 0.3 : 0,
          shadowRadius: 4,
          elevation: speaking ? 4 : 0,
        }}>
          <Text style={{ 
            color: 'white', 
            fontWeight: '800', 
            fontSize: 24 
          }}>
            {initials}
          </Text>
        </View>
        
        {/* Speaking indicator dot */}
        {speaking && (
          <View style={{
            position: 'absolute',
            bottom: -2,
            right: -2,
            width: 20,
            height: 20,
            borderRadius: 10,
            backgroundColor: '#22c55e',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: '#0E131A',
            shadowColor: '#22c55e',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.8,
            shadowRadius: 4,
            elevation: 4,
          }}>
            <View style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: 'white',
            }} />
          </View>
        )}
      </View>
      
      {/* Display name */}
      <Text style={{ 
        color: 'white', 
        fontWeight: '700', 
        fontSize: 14, 
        textAlign: 'center',
        marginBottom: 2,
        paddingHorizontal: 4,
      }} numberOfLines={1}>
        {displayName}
      </Text>
      
      {/* VIP badge */}
      {vipName && (
        <VipBadge name={vipName} color={null} />
      )}
      
      {/* Speaking status with level */}
      {speaking && (
        <View style={{
          marginTop: 4,
          paddingHorizontal: 8,
          paddingVertical: 2,
          borderRadius: 12,
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 1,
          borderColor: 'rgba(34, 197, 94, 0.3)',
        }}>
          <Text style={{ 
            color: '#22c55e', 
            fontSize: 11, 
            fontWeight: '600',
          }}>
            Speaking
          </Text>
        </View>
      )}
    </View>
  );
}
