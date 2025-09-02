import * as ImagePicker from 'expo-image-picker';
import { decode } from 'base64-arraybuffer';
import { Alert } from 'react-native';
import { getSupabase } from './supabase'; // uses your lazy client

// Cross-SDK images constant (SDK 49–51+)
const MEDIA_IMAGES: any =
  // SDK 51+
  (ImagePicker as any).MediaType?.Images ??
  // Older
  (ImagePicker as any).MediaTypeOptions?.Images ??
  // Fallback literal API
  'images';

type Ok = { success: true; path: string; publicUrl: string };
type Cancelled = { cancelled: true };
export type PickUploadResult = Ok | Cancelled;

export async function pickAndUploadAvatar(userId: string | undefined | null): Promise<PickUploadResult> {
  try {
    if (!userId) throw new Error('Missing user id');

    // Permissions
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) throw new Error('Permission to access photos is required');

    // Pick image (return base64 for RN-safe upload)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: MEDIA_IMAGES,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
      base64: true,
    });
    console.log('[pickAvatar] raw result →', result);

    const canceled = (result as any).canceled ?? (result as any).cancelled ?? false;
    if (canceled) return { cancelled: true };

    const asset: any =
      Array.isArray((result as any).assets) && (result as any).assets.length
        ? (result as any).assets[0]
        : result;

    const base64: string | undefined = asset.base64;
    if (!base64) throw new Error('No base64 data from picker');

    // 2 MB limit (client-side)
    const approxBytes = Math.ceil(base64.length * 3 / 4);
    if (approxBytes > 2 * 1024 * 1024) throw new Error('Image too large (max 2MB)');

    const mime = (asset.mimeType || asset.type || 'image/jpeg') as string;
    const ext = mime.includes('png') ? 'png' : 'jpg';
    const objectPath = `profiles/${userId}/avatar.${ext}`; // inside bucket "avatars"

    const supabase = getSupabase();
    const bytes = decode(base64); // ArrayBuffer

    // Upload (upsert)
    const { error: uploadErr } = await supabase
      .storage
      .from('avatars')
      .upload(objectPath, bytes, {
        contentType: mime,
        cacheControl: '3600',
        upsert: true,
      });
    if (uploadErr) {
      console.warn('[upload] supabase error', uploadErr);
      throw uploadErr;
    }

    // Public URL (bucket should be public for MVP)
    const { data: pub } = supabase.storage.from('avatars').getPublicUrl(objectPath);
    const publicUrl = pub?.publicUrl;
    if (!publicUrl) throw new Error('Public URL not returned');

    // Persist to profiles.avatar_url
    const { error: profErr } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId);
    if (profErr) throw profErr;

    return { success: true, path: objectPath, publicUrl };
  } catch (err: any) {
    console.warn('[pickAvatar] error', err);
    Alert.alert('Avatar upload failed', err?.message || String(err));
    throw err;
  }
}

export function alertUploadError(err: any) {
  const msg = err?.message ?? String(err);
  Alert.alert('Image pick/upload failed', msg);
}