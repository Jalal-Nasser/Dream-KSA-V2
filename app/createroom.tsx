// app/createroom.tsx
import React, { useState } from 'react';
import { View, TextInput, Text, Alert, StyleSheet, Pressable, ScrollView, Image, I18nManager, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { API_BASE_URL } from '../config/api';
import { Brand, BrandGradient } from '../lib/theme';

export default function CreateRoomScreen() {
  const [roomName, setRoomName] = useState('');
  const [loading, setLoading] = useState(false);
  const [roomDescription, setRoomDescription] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('#8b5cf6');
  const [bannerUrl, setBannerUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [typingDirection, setTypingDirection] = useState<'rtl' | 'ltr'>(I18nManager.isRTL ? 'rtl' : 'rtl');

  const pickImage = async (setter: (uri: string) => void) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('صلاحيات مرفوضة', 'يرجى السماح بالوصول للصور لاختيار بانر/شعار');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setter(result.assets[0].uri);
    }
  };
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
        bannerImage: bannerUrl.trim() || null,
        backgroundImage: logoUrl.trim() || null,
      };
      
      const res = await fetch(`${API_BASE_URL}/api/create-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      const data = await res.json();
      if (data.id) {
        Alert.alert('تم إنشاء الغرفة!', `معرف الغرفة: ${data.id}`, [
          {
            text: 'الذهاب للغرفة',
            onPress: () => router.push(`/voicechat?roomId=${data.id}&roomName=${roomName.trim()}`)
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
      colors={BrandGradient.colors}
      locations={BrandGradient.locations}
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
            autoCorrect={true}
            textAlign="right"
          />

          {/* Banner URL (optional) */}
          <Text style={styles.label}>البانر (اختياري)</Text>
          <View style={{ gap: 8 }}>
            <TextInput
              style={styles.input}
              placeholder="رابط صورة البانر (اختياري)"
              placeholderTextColor="#9ca3af"
              value={bannerUrl}
              onChangeText={setBannerUrl}
              editable={!loading}
              autoCapitalize="none"
              keyboardType="url"
              textAlign="right"
            />
            <Pressable style={[styles.uploadBtn, { borderColor: selectedTheme, backgroundColor: '#fff' }]} onPress={() => pickImage(setBannerUrl)}>
              <Text style={[styles.uploadBtnText, { color: selectedTheme }]}>رفع صورة من الهاتف</Text>
            </Pressable>
          </View>
          {!!bannerUrl && (
            <Image source={{ uri: bannerUrl }} style={styles.previewBanner} />
          )}

          {/* Logo/Background URL (optional) */}
          <Text style={styles.label}>الشعار/الخلفية (اختياري)</Text>
          <View style={{ gap: 8 }}>
            <TextInput
              style={styles.input}
              placeholder="رابط صورة الشعار (اختياري)"
              placeholderTextColor="#9ca3af"
              value={logoUrl}
              onChangeText={setLogoUrl}
              editable={!loading}
              autoCapitalize="none"
              keyboardType="url"
              textAlign="right"
            />
            <Pressable style={[styles.uploadBtn, { borderColor: selectedTheme, backgroundColor: '#fff' }]} onPress={() => pickImage(setLogoUrl)}>
              <Text style={[styles.uploadBtnText, { color: selectedTheme }]}>رفع صورة من الهاتف</Text>
            </Pressable>
          </View>
          {!!logoUrl && (
            <Image source={{ uri: logoUrl }} style={styles.previewLogo} />
          )}

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
    backgroundColor: 'rgba(255,255,255,0.10)',
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
    borderColor: '#e5e7eb', 
    borderRadius: 12, 
    padding: 14, 
    marginBottom: 16,
    backgroundColor: '#ffffff',
    color: '#111827',
    fontSize: 16,
    textAlign: 'right',
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
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
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  createButton: {
    backgroundColor: '#8b5cf6',
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
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  previewBanner: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 16,
  },
  previewLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignSelf: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  uploadBtn: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    elevation: 2,
  },
  uploadBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
