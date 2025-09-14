import { Platform, PermissionsAndroid } from 'react-native';
import {
  HMSSDK,
  HMSConfig,
} from '@100mslive/react-native-hms';

let sdk: HMSSDK | null = null;

async function ensureSdk(): Promise<HMSSDK> {
  if (!sdk) {
    sdk = await HMSSDK.build();
  }
  return sdk;
}

export async function hmsJoin(token: string, name: string, role: 'host'|'speaker'|'listener' = 'listener') {
  const s = await ensureSdk();

  // Android mic permission if you're going to publish audio
  if (Platform.OS === 'android' && role !== 'listener') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  }

  const cfg = new HMSConfig({ authToken: token, userName: name });
  await s.join(cfg);

  // Post-join audio setup for both platforms
  try {
    // Route audio to loudspeaker by default
    // @ts-ignore - method exists in HMS SDK (AudioManager)
    await s.setSpeakerphoneOn?.(true);
  } catch {}

  try {
    // Start playback for remote audio tracks
    // @ts-ignore - method exists in SDK versions; ignore if absent
    await s.setPlaybackForAllAudio?.(true);
  } catch {}
}

export function hmsIsConnected(): boolean {
  // naive check: if we have an sdk and room, assume connected
  // @ts-ignore
  return !!sdk?.room;
}

export async function hmsToggleLocalMute(mute: boolean) {
  const s = await ensureSdk();
  try {
    // @ts-ignore - method exists in SDK; ignore types if any
    await s.setLocalAudioEnabled?.(!mute);
  } catch (e) {
    console.log('[hms] toggle local mic failed', String((e as any)?.message || e));
  }
}

export async function hmsLeave() {
  if (!sdk) return;
  try { await sdk.leave(); } catch {}
}

export function __hms_has_instance() {
  return !!sdk;
}
