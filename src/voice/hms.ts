import { HMSSDK, HMSConfig, HMSUpdateListenerActions } from '@100mslive/react-native-hms';
import { useSpeaking } from '@/store/speakers';
import { Platform, PermissionsAndroid } from 'react-native';

let sdk: HMSSDK | null = null;

export async function hmsJoin(roomId: string, username: string, token: string) {
  // Guard: token must exist
  if (!token) {
    console.error('[HMS] join aborted: missing auth token');
    return;
  }

  // Guard: mic permission on Android
  if (Platform.OS === 'android') {
    try {
      await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO);
    } catch {}
  }

  // Reuse SDK if already built; if already joined, skip
  if (!sdk) {
    sdk = await HMSSDK.build();
    
    // Extra safety: ensure video is disabled before any operations
    try {
      if (typeof (sdk as any).setLocalVideoEnabled === "function") {
        await (sdk as any).setLocalVideoEnabled(false);
        console.log('[HMS] video disabled before join (extra safety)');
      }
    } catch (e) {
      console.log('[HMS] pre-join video disable error:', e);
    }
  } else if (sdk.localPeer) {
    console.log('[HMS] already joined; skipping duplicate join');
    return;
  }

  // Listeners
  sdk.addEventListener(HMSUpdateListenerActions.ON_SPEAKER_UPDATE, (e: any) => {
    // e.speakers is an array of peers currently speaking
    const ids = Array.isArray(e?.speakers) ? e.speakers.map((p: any) => p.peer?.peerID || p.peer?.peerId || p?.id).filter(Boolean) : [];
    useSpeaking.getState().setSpeaking(ids);
  });
  sdk.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, (e) => {
    // TODO: reflect peers list if you want
  });
  sdk.addEventListener(HMSUpdateListenerActions.ON_ERROR, (evt: any) => {
    if (evt?.code === 3001) {
      // Camera not granted; we're audio-only, so ignore
      console.log('[HMS] Camera disabled by design (audio-only).');
      return;
    }
    try {
      console.log('[HMS] ON_ERROR:', JSON.stringify(evt));
    } catch {
      console.log('[HMS] ON_ERROR (raw):', evt);
    }
  });
  sdk.addEventListener(HMSUpdateListenerActions.ON_JOIN, async () => {
    console.log('[HMS] ON_JOIN');
    try {
      const devices = (await (sdk as any)?.getAudioDevices?.()) || (await (sdk as any)?.getAudioDevicesList?.());
      const speaker = Array.isArray(devices)
        ? devices.find((d: any) => {
            const t = (d?.type || d?.name || '').toUpperCase();
            return t.includes('SPEAKER');
          })
        : null;
      if (speaker && (sdk as any)?.switchAudioOutput) {
        await (sdk as any).switchAudioOutput(speaker);
        console.log('[HMS] Audio routed to speaker');
      } else {
        console.log('[HMS] No speaker device available; skipping switch');
      }
    } catch (e: any) {
      console.log('[HMS] audio route error', e?.code, e?.message);
    }
  });

  // Build config and log before join
  const safeUserName = username || 'Guest';
  const cfg = new HMSConfig({ 
    authToken: token, 
    username: safeUserName, 
    metadata: JSON.stringify({ userName: safeUserName }),
    // critical: request mic only, not camera
    captureNetworkQualityInPreview: false,
    isAudioOnly: true,
  });
  console.log('[HMS] join cfg:', {
    userName: (cfg as any).username || safeUserName,
    tokenLength: token?.length || 0,
    roomId,
    isAudioOnly: (cfg as any).isAudioOnly,
  });

  try {
    await (sdk as any).join(cfg, { isAudioOnly: true });
    
    // Immediately disable video after join
    try {
      if (typeof (sdk as any).setLocalVideoEnabled === "function") {
        await (sdk as any).setLocalVideoEnabled(false);
        console.log('[HMS] video disabled immediately after join');
      }
    } catch (e) {
      console.log('[HMS] video disable error:', e);
    }
    
    console.log('[HMS] joined audio-only as', username);
  } catch (err: any) {
    try {
      console.log('[HMS] join error:', err?.code, err?.message, JSON.stringify(err));
    } catch {
      console.log('[HMS] join error (raw):', err?.code, err?.message, err);
    }
    throw err;
  }
}

// Convenience wrapper matching app usage in prompts
export async function joinAsRole(authToken: string, displayName: string, userId: string) {
  // Delegate to hmsJoin with a placeholder roomId (not required by SDK when token encodes room)
  return hmsJoin('n/a', displayName, authToken);
}

export async function hmsLeave() {
  try { await sdk?.leave(); } catch {}
  sdk = null;
}

export async function leaveRoom() {
  return hmsLeave();
}

export async function hmsMuteMic(mute: boolean) {
  try { await sdk?.setLocalMute(mute); } catch {}
}
