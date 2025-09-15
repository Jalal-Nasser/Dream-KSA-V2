import { Platform, PermissionsAndroid } from 'react-native';
import { Audio } from 'expo-av';
import { HMSSDK, HMSConfig, HMSUpdateListenerActions } from '@100mslive/react-native-hms';

let sdk: HMSSDK | null = null;
let listenersBound = false;

async function ensureSdk(): Promise<HMSSDK> {
  if (!sdk) {
    sdk = await HMSSDK.build();
  }
  if (!listenersBound && sdk) {
    // Debug logs to observe peer/track updates
    try {
      (sdk as any).addEventListener?.(HMSUpdateListenerActions.ON_PEER_UPDATE, (e: any) => {
        console.log('[hms] PEER', e?.type, e?.peer?.name, e?.peer?.role?.name);
      });
      (sdk as any).addEventListener?.(HMSUpdateListenerActions.ON_TRACK_UPDATE, (e: any) => {
        const k = e?.track?.type || e?.track?.source;
        console.log('[hms] TRACK', e?.type, k, 'mute=', e?.track?.isMute, 'peer=', e?.peer?.role?.name);
      });
    } catch {}
    listenersBound = true;
  }
  return sdk!;
}

async function ensureMicPermission() {
  try {
    if (Platform.OS === 'ios') {
      const cur = await Audio.getPermissionsAsync();
      if (!cur.granted) {
        const req = await Audio.requestPermissionsAsync();
        console.log('[hms] mic permission (iOS) result', req);
      } else {
        console.log('[hms] mic permission (iOS) already granted');
      }
    } else if (Platform.OS === 'android') {
      const has = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
      if (!has) {
        const res = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
        console.log('[hms] mic permission (Android) result', res);
      } else {
        console.log('[hms] mic permission (Android) already granted');
      }
    }
  } catch (e) {
    console.log('[hms] mic permission check failed', e);
  }
}

export async function hmsJoin(token: string, name: string, role: 'host'|'speaker'|'listener'='listener') {
  const s = await ensureSdk();

  // iOS audio session so we can record + play in silent mode
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      interruptionModeIOS: 1,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    });
  } catch (e) {
    console.log('[hms] setAudioMode failed', e);
  }

  await ensureMicPermission();

  const cfg = new HMSConfig({ authToken: token, userName: name });
  await s.join(cfg);

  // Always enable speaker + playback + mic after join
  try { await (s as any).setSpeakerphoneOn?.(true); } catch (e) { console.log('[hms] setSpeakerphoneOn failed', e); }
  try { await (s as any).setPlaybackForAllAudio?.(true); } catch (e) { console.log('[hms] setPlaybackForAllAudio failed', e); }
  try { await (s as any).setLocalAudioEnabled?.(true); } catch (e) { console.log('[hms] enable local audio failed', e); }
  console.log('[hms] post-join: speakerphone on, playback on, mic enable attempted');
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

// --- router no-op default export so Expo Router doesn't treat this file as a screen ---
export default function __noop_hmsClient() { return null as any; }

