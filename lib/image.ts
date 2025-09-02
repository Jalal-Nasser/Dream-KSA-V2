import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Best-effort resize/compress. If the native module isn't present in the current build,
 * we gracefully fall back to the original URI.
 */
export async function prepareAvatarUri(uri: string): Promise<string> {
  try {
    // Try a light resize; adjust as needed
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 640 } }],
      { compress: 0.85, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri || uri;
  } catch (e: any) {
    console.log('[image] manipulator unavailable, using original URI:', e?.message || e);
    return uri;
  }
}
