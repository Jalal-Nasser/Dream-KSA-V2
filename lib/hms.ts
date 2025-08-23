import { HMSSDK, HMSConfig, HMSUpdateListenerActions } from '@100mslive/react-native-hms';
import { getHmsToken } from './getHmsToken';
import { ENV } from '@/env';

type HMSRole = string;

let sdk: HMSSDK | null = null;

export async function joinAsRole(authToken: string, displayName: string, userId: string) {
  if (!authToken) {
    console.error('[HMS] No auth token, abort join');
    throw new Error('Missing HMS token');
  }

  if (sdk && (await sdk.getLocalPeer())) {
    console.log('[HMS] Already joined, skipping join call.');
    return;
  }

  if (sdk) { 
    try { 
      await sdk.leave(); 
    } catch {} 
    sdk = null; 
  }
  
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

  // Attach listeners
  sdk.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, (e: any) => {
    console.log('[HMS] ON_PEER_UPDATE', e);
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
      // video off for voice-only
      if (typeof (sdk as any).setLocalVideoEnabled === "function") {
        await (sdk as any).setLocalVideoEnabled(false);
        console.log('[HMS] video disabled');
      }
      // audio on (publish mic)
      if (typeof (sdk as any).setLocalAudioEnabled === "function") {
        await (sdk as any).setLocalAudioEnabled(true);
        console.log('[HMS] mic enabled');
      }

      // Verify local track state
      try {
        const lp = (await (sdk as any)?.getLocalPeer?.()) || (await (sdk as any)?.getLocalPeer?.());
        const audioTrack = lp?.localAudioTrack?.() || lp?.audioTrack;
        const isMuted = typeof audioTrack?.isMute === 'function' ? audioTrack.isMute() : (audioTrack?.isMute ?? undefined);
        const devices = (await (sdk as any)?.getAudioDevices?.()) || (await (sdk as any)?.getAudioDevicesList?.());
        console.log('[MIC] verify:', {
          localPeer: !!lp,
          hasAudioTrack: !!audioTrack,
          isMuted,
          device: Array.isArray(devices) ? devices.map((d: any) => d?.type || d?.name) : devices,
        });
      } catch (e) {
        console.log('[MIC] verify error', e);
      }

      // Audio device routing (existing code)
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
  const safeUserName = displayName || 'Guest';
  const cfg = new HMSConfig({ 
    authToken: authToken, 
    username: safeUserName, 
    metadata: JSON.stringify({ userName: safeUserName }),
    // critical: request mic only, not camera
    captureNetworkQualityInPreview: false,
    isAudioOnly: true,
  });
  
  console.log('[HMS] join cfg:', {
    userName: (cfg as any).username || safeUserName,
    tokenLength: authToken?.length || 0,
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
    
    console.log('[HMS] joined audio-only as', displayName);
  } catch (err: any) {
    console.log('[HMS] join error:', err?.code, err?.message, JSON.stringify(err));
    throw err;
  }
}

export async function leaveRoom() {
  try { 
    await sdk?.leave(); 
  } catch {}
  sdk = null;
}

export async function hmsLeave() {
  return leaveRoom();
}

export async function joinHms(params: { roomId: string; userName: string; role: HMSRole; userId?: string }) {
  const { roomId, userName, role, userId } = params;
  const token = await getHmsToken({ roomId, role, userId: userId || 'guest' });
  await joinAsRole(token, userName, userId || 'guest');
}

export async function switchToSpeaker() {
  try {
    // @ts-ignore
    const ok = await (sdk as any)?.setLocalAudioEnabled?.(true);
    console.log('[HMS] switchToSpeaker mic on', ok);
  } catch (e) {
    console.log('[HMS] switchToSpeaker error', e);
  }
}

export async function switchToListener() {
  try {
    // @ts-ignore
    const ok = await (sdk as any)?.setLocalAudioEnabled?.(false);
    console.log('[HMS] switchToListener mic off', ok);
  } catch (e) {
    console.log('[HMS] switchToListener error', e);
  }
}

// Convenience exports per prompt
export const joinAs = async ({ userName, token }: { userName: string; token: string }) => {
  console.log('[HMS] joinAs audio-only');
  await joinAsRole(token, userName, 'guest');
};

export const publishAudio = async () => {
  try {
    // @ts-ignore
    const ok = await (sdk as any)?.setLocalAudioEnabled?.(true);
    console.log('[HMS] publishAudio -> enabled', ok);
  } catch (e) {
    console.log('[HMS] publishAudio error', e);
  }
};

export const unpublishAudio = async () => {
  try {
    // @ts-ignore
    const ok = await (sdk as any)?.setLocalAudioEnabled?.(false);
    console.log('[HMS] unpublishAudio -> disabled', ok);
  } catch (e) {
    console.log('[HMS] unpublishAudio error', e);
  }
};

export { getHmsToken };
