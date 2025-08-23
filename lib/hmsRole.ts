import { getHmsToken } from './getHmsToken';
import { HMSSDK } from '@100mslive/react-native-hms';
import { HMS_ROLES } from '@/env';

let sdkRef: HMSSDK | null = null as any;

export function setHmsSdkInstance(sdk: HMSSDK | null) {
  sdkRef = sdk;
}

async function getOrBuildSdk(): Promise<HMSSDK> {
  if (sdkRef) return sdkRef;
  sdkRef = await HMSSDK.build();
  return sdkRef;
}

export async function upgradeToSpeaker(params: { roomId: string; userId: string; displayName: string }) {
  const { roomId, userId, displayName } = params;
  const token = await getHmsToken({ roomId, role: HMS_ROLES.speaker, userId });
  const sdk = await getOrBuildSdk();
  try {
    // Prefer role change if available
    // @ts-ignore
    if (typeof (sdk as any).changeRole === 'function') {
      // Some SDKs require role name only
      await (sdk as any).changeRole(HMS_ROLES.speaker);
      return;
    }
  } catch {}
  try {
    // Fallback: rejoin with speaker token
    await (sdk as any)?.leave?.();
  } catch {}
  await (sdk as any).join({ authToken: token, userName: displayName, isAudioOnly: true } as any);
}

export async function downgradeToListener(params: { roomId: string; userId: string; displayName: string }) {
  const { roomId, userId, displayName } = params;
  const token = await getHmsToken({ roomId, role: HMS_ROLES.listener, userId });
  const sdk = await getOrBuildSdk();
  try {
    // @ts-ignore
    if (typeof (sdk as any).changeRole === 'function') {
      await (sdk as any).changeRole(HMS_ROLES.listener);
      return;
    }
  } catch {}
  try { await (sdk as any)?.leave?.(); } catch {}
  await (sdk as any).join({ authToken: token, userName: displayName, isAudioOnly: true } as any);
}


