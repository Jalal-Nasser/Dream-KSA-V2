// app/createroom.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function CreateRoomScreen() {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomDescription, setRoomDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('#4f46e5');
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const themes = [
    { name: 'بنفسجي', color: '#4f46e5' },
    { name: 'أزرق', color: '#0ea5e9' },
    { name: 'أخضر', color: '#10b981' },
    { name: 'أحمر', color: '#ef4444' },
    { name: 'برتقالي', color: '#f97316' },
    { name: 'وردي', color: '#ec4899' },
  ];

  const createRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert('يرجى إدخال اسم الغرفة');
      return;
    }
    setLoading(true);
    try {
      const roomData = {
        name: roomName.trim(),
        description: roomDescription.trim(),
        theme: selectedTheme,
      };
      
      const res = await fetch('http://192.168.1.9:3001/create-room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      const data = await res.json();
      if (data.id) {
        Alert.alert('تم إنشاء الغرفة!', `معرف الغرفة: ${data.id}`, [
          {
            text: 'الذهاب للغرفة',
            onPress: () => router.push(`/voicechat_customizable?roomId=${data.id}&roomName=${roomName.trim()}`)
          },
          {
            text: 'العودة للرئيسية',
            onPress: () => router.push('/(tabs)')
          }
        ]);
      } else {
        throw new Error(data.error || 'خطأ غير معروف');
      }
    } catch (err: any) {
      Alert.alert('خطأ', err.message);
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
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.formContainer}>
          {/* Room Name */}
          <Text style={styles.label}>اسم الغرفة</Text>
          <TextInput
            style={styles.input}
            placeholder="أدخل اسم الغرفة"
            placeholderTextColor="#9ca3af"
            value={roomName}
            onChangeText={setRoomName}
            editable={!loading}
            multiline={false}
            returnKeyType="done"
            autoCapitalize="none"
            autoCorrect={false}
            textAlign="right"
          />

          {/* Room Description */}
          <Text style={styles.label}>وصف الغرفة (اختياري)</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="أدخل وصف الغرفة"
            placeholderTextColor="#9ca3af"
            value={roomDescription}
            onChangeText={setRoomDescription}
            multiline
            numberOfLines={3}
            editable={!loading}
            autoCapitalize="none"
            autoCorrect={false}
            textAlign="right"
          />

          {/* Theme Selection */}
          <Text style={styles.label}>لون المظهر</Text>
          <View style={styles.themeContainer}>
            {themes.map((theme) => (
              <Pressable
                key={theme.color}
                style={[
                  styles.themeButton,
                  { backgroundColor: theme.color },
                  selectedTheme === theme.color && styles.selectedTheme
                ]}
                onPress={() => setSelectedTheme(theme.color)}
              >
                <Text style={styles.themeText}>{theme.name}</Text>
              </Pressable>
            ))}
          </View>
          
          <Pressable 
            style={[
              styles.createButton, 
              { backgroundColor: selectedTheme },
              loading && styles.createButtonDisabled
            ]} 
            onPress={createRoom} 
            disabled={loading}
          >
            <Plus color="white" size={20} />
            <Text style={styles.createButtonText}>
              {loading ? 'جاري الإنشاء...' : 'إنشاء الغرفة'}
            </Text>
          </Pressable>
        </View>
      </ScrollView>
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
  },
  formContainer: {
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
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
    writingDirection: 'rtl',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
    writingDirection: 'rtl',
  },
  themeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  themeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedTheme: {
    borderWidth: 3,
    borderColor: 'white',
  },
  themeText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
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
