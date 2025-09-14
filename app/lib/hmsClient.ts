import { Platform, PermissionsAndroid } from 'react-native';
import { HMSSDK, HMSConfig } from '@100mslive/react-native-hms';

let sdk: HMSSDK | null = null;

async function ensureSdk(): Promise<HMSSDK> {
  if (!sdk) {
    sdk = await HMSSDK.build();
  }
  return sdk;
}

export async function hmsJoin(token: string, name: string, role: 'host'|'speaker'|'listener'='listener') {
  const s = await ensureSdk();

  // Android mic permission if going to publish
  if (Platform.OS === 'android' && role !== 'listener') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  }

  const cfg = new HMSConfig({ authToken: token, userName: name });
  await s.join(cfg);

  try { await (s as any).setSpeakerphoneOn?.(true); } catch {}
  try { await (s as any).setPlaybackForAllAudio?.(true); } catch {}
}

export function hmsIsConnected(): boolean {
  // @ts-ignore
  return !!sdk?.room;
}

export async function hmsToggleLocalMute(mute: boolean) {
  const s = await ensureSdk();
  try {
    // false => publish; true => mute
    await (s as any).setLocalAudioEnabled?.(!mute);
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
