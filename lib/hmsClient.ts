import { Platform, PermissionsAndroid } from 'react-native';
import { HMSSDK, HMSConfig, HMSUpdateListenerActions } from '@100mslive/react-native-hms';

let sdk: HMSSDK | null = null;
let listenersBound = false;

async function ensureSdk(): Promise<HMSSDK> {
  if (!sdk) {
    sdk = await HMSSDK.build();
  }
  if (!listenersBound && sdk) {
    // minimal safety: rebuild peers on both peer & track updates
    try {
      // no-op handlers (parent screens attach their own too)
      (sdk as any).addEventListener?.(HMSUpdateListenerActions.ON_PEER_UPDATE, () => {});
      (sdk as any).addEventListener?.(HMSUpdateListenerActions.ON_TRACK_UPDATE, () => {});
    } catch {}
    listenersBound = true;
  }
  return sdk!;
}

export async function hmsJoin(token: string, name: string, role: 'host'|'speaker'|'listener'='listener') {
  const s = await ensureSdk();

  if (Platform.OS === 'android' && role !== 'listener') {
    await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
  }
  const cfg = new HMSConfig({ authToken: token, userName: name });
  await s.join(cfg);

  // Route audio + enable playback + TURN MIC ON regardless of provided role
  try { await (s as any).setSpeakerphoneOn?.(true); } catch {}
  try { await (s as any).setPlaybackForAllAudio?.(true); } catch {}
  try { await (s as any).setLocalAudioEnabled?.(true); } catch {}
  console.log('[hms] post-join: speakerphone on, playback on, mic enabled');
}

export function hmsIsConnected(): boolean {
  // @ts-ignore
  return !!sdk?.room;
}

export async function hmsToggleLocalMute(mute: boolean) {
  const s = await ensureSdk();
  try { await (s as any).setLocalAudioEnabled?.(!mute); } catch (e) { console.log('[hms] toggle mic failed', String(e)); }
}

export async function hmsLeave() {
  if (!sdk) return;
  try { await sdk.leave(); } catch {}
}

export function __hms_has_instance() {
  return !!sdk;
}