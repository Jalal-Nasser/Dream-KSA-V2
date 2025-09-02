import * as ImagePicker from 'expo-image-picker';

/**
 * Pick a square avatar from gallery.
 * Uses the new `ImagePicker.MediaType` (fixes deprecation warning).
 */
export async function pickAvatar() {
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

