import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { MicStatus } from '@/src/db/types';

export function RaiseHandButton({
  status,
  onRaise,
  onCancel,
}: {
  status: MicStatus;
  onRaise: () => void;
  onCancel: () => void;
}) {
  const isRequested = status === 'requested';
  const isGranted = status === 'granted';
  return (
    <View style={{ marginTop: 12 }}>
      {isGranted ? (
        <View style={{ padding: 12, backgroundColor: '#16a34a', borderRadius: 12 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>You’re on mic 🎙️</Text>
        </View>
      ) : isRequested ? (
        <Pressable onPress={onCancel} style={{ padding: 12, backgroundColor: '#f59e0b', borderRadius: 12 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Cancel request ✋</Text>
        </Pressable>
      ) : (
        <Pressable onPress={onRaise} style={{ padding: 12, backgroundColor: '#6366f1', borderRadius: 12 }}>
          <Text style={{ color: 'white', textAlign: 'center', fontWeight: '600' }}>Raise hand ✋</Text>
        </Pressable>
      )}
    </View>
  );
}





