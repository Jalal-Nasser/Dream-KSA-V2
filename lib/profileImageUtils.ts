import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Ask for media library permission (Android 13+/iOS).
 */
async function ensureMediaPermission(): Promise<boolean> {
  try {
    const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
    if (existing.granted) return true;
    const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return req.granted === true;
  } catch (e) {
    console.warn('[avatar] permission error', e);
    return false;
  }
}

/**
 * Open gallery to pick a square avatar.
 * Uses the new `ImagePicker.MediaType` API (SDK 51+).
 */
export async function pickAvatar() {
  const allowed = await ensureMediaPermission();
  if (!allowed) {
    Alert.alert(
      'السماح بالصور',
      Platform.select({
        android: 'يجب منح إذن الوصول للصور حتى تختار صورة شخصية.',
        ios: 'رجاءً اسمح للتطبيق بالوصول إلى الصور لاختيار صورة شخصية.',
      }) || 'السماح بالوصول إلى الصور مطلوب.'
    );
    return { canceled: true } as const;
  }
  try {
    const res = await ImagePicker.launchImageLibraryAsync({
      // Use simple string for maximum compatibility
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.9,
      base64: true, // <--- CHANGE: Request base64 data
      exif: false,
      // presentationStyle helps some Android skins show the picker fullscreen
      presentationStyle: 'fullScreen',
    });
    return res;
  } catch (e) {
    console.warn('[avatar] picker error', e);
    Alert.alert('حدث خطأ', 'تعذر فتح معرض الصور. حاول مرة أخرى.');
    return { canceled: true } as const;
  }
}

