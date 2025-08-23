import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';

type Props = {
  micStatus: 'none'|'requested'|'granted';
  isModerator: boolean;
  onRaise: () => void;
  onMuteToggle: () => void;
  onOpenAdmin: () => void;
};

export default function BottomBar({ micStatus, isModerator, onRaise, onMuteToggle, onOpenAdmin }: Props) {
  return (
    <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: 12, backgroundColor: 'rgba(0,0,0,0.6)' }}>
      {!isModerator ? (
        <TouchableOpacity
          disabled={micStatus === 'requested'}
          onPress={micStatus === 'granted' ? onMuteToggle : onRaise}
          style={{ padding: 14, borderRadius: 999, backgroundColor: micStatus === 'none' ? '#3b82f6' : micStatus === 'requested' ? '#6b7280' : '#ef4444' }}
        >
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>
            {micStatus === 'none' ? 'Raise Hand' : micStatus === 'requested' ? 'Requested…' : 'Mute/Unmute'}
          </Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={onOpenAdmin} style={{ padding: 14, borderRadius: 999, backgroundColor: '#22c55e' }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Admin</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}


