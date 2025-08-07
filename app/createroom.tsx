// app/createroom.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateRoomScreen() {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const createRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('Please enter a room name');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: roomName.trim() }),
      });
      const data = await res.json();
      if (data.id) {
        Alert.alert('Room created!', `Room ID: ${data.id}`, [
          {
            text: 'Go to Room',
            onPress: () => router.push(`/voicechat?roomId=${data.id}&roomName=${roomName.trim()}`)
          },
          {
            text: 'Back to Home',
            onPress: () => router.push('/(tabs)')
          }
        ]);
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (err: any) {
      Alert.alert('Error', err.message);
    }
    setLoading(false);
  };

  return (
    <LinearGradient
      colors={['#1F2937', '#111827', '#0A0E15']}
      style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <ArrowLeft color="white" size={24} />
        </Pressable>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>إنشاء غرفة جديدة</Text>
        </View>
        <View style={styles.headerButton} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.label}>اسم الغرفة</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل اسم الغرفة"
            placeholderTextColor="#9ca3af"
            value={roomName}
            onChangeText={setRoomName}
            editable={!loading}
          />
          
          <Pressable 
            style={[styles.createButton, loading && styles.createButtonDisabled]} 
            onPress={createRoom} 
            disabled={loading}
          >
            <Plus color="white" size={20} />
            <Text style={styles.createButtonText}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء الغرفة'}
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
    width: 40,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  formContainer: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
  },
  label: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'right',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#6b7280', 
    borderRadius: 12, 
    padding: 16, 
    marginBottom: 24,
    backgroundColor: '#1f2937',
    color: 'white',
    fontSize: 16,
    textAlign: 'right',
  },
  createButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#6b7280',
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
