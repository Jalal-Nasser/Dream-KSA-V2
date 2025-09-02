import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { getSupabase } from './supabase';

// Pick an image, upload to 'avatars' bucket, update profiles.avatar_url, return public URL.
export async function pickAndUploadAvatar(userId: string) {
  if (!userId) throw new Error('Missing user id');

  // Ask permission
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) throw new Error('Permission to access photos is required.');

  // Launch library (SDK 51)
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaType.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });
  console.log('[pickAvatar] raw result →', result);

  const canceled = (result as any).canceled ?? (result as any).cancelled ?? false;
  if (canceled) return { cancelled: true as const };

  // Normalize asset
  let asset: any = null;
  if (Array.isArray((result as any).assets) && (result as any).assets.length) {
    asset = (result as any).assets[0];
  } else if ((result as any).uri) {
    asset = { uri: (result as any).uri, mimeType: (result as any).type ?? 'image/jpeg' };
  } else {
    throw new Error('No image selected');
  }

  const uri: string = asset.uri;
  if (!uri) throw new Error('Selected image URI missing');

  // Check file size if available
  if (asset.fileSize && asset.fileSize > 5 * 1024 * 1024) { // 5 MB
    throw new Error('Please pick an image ≤ 5 MB');
  }

  // Infer extension
  const ext = (uri.split('.').pop() || 'jpg').split('?')[0];
  const path = `avatars/${userId}-${Date.now()}.${ext}`;

  // Convert to Blob
  const resp = await fetch(uri);
  const blob = await resp.blob();

  // Get Supabase client
  const supabase = getSupabase();

  // Upload with upsert
  const { error: uploadErr } = await supabase
    .storage
    .from('avatars')
    .upload(path, blob, {
      cacheControl: '3600',
      upsert: true,
      contentType: asset.mimeType ?? `image/${ext}`,
    });
  if (uploadErr) {
    console.error('[upload] supabase error', uploadErr);
    throw uploadErr;
  }

  // Get public URL
  const { data: pub, error: pubErr } = supabase.storage.from('avatars').getPublicUrl(path);
  if (pubErr) throw pubErr;
  const publicUrl = pub?.publicUrl;
  if (!publicUrl) throw new Error('Public URL not returned');

  // Update profile row
  const { error: profErr } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl })
    .eq('id', userId);
  if (profErr) throw profErr;

  return { success: true as const, publicUrl, path };
}

export function alertUploadError(err: any) {
  const msg = err?.message ?? String(err);
  Alert.alert('Image pick/upload failed', msg);
}
