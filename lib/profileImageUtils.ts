import * as ImagePicker from 'expo-image-picker';
import { Alert, Platform } from 'react-native';

/**
 * Ask media-library permission (Android 13+ and iOS).
 */
async function ensureMediaPermission(): Promise<boolean> {
  const existing = await ImagePicker.getMediaLibraryPermissionsAsync();
  if (existing.granted) return true;
  const req = await ImagePicker.requestMediaLibraryPermissionsAsync();
  return req.granted;
}

/**
 * Pick a square avatar from gallery using the new API.
 * - Fixes deprecation warning (MediaTypeOptions → MediaType).
 * - Requests permission before opening the picker.
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

  const result = await ImagePicker.launchImageLibraryAsync({
    // ✅ Expo SDK 51+: use the enum (not MediaTypeOptions)
    mediaTypes: ImagePicker.MediaType.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.9,
    base64: false,
    exif: false,
  });
  return result;
}

