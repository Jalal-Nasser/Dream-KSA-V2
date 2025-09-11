// lib/hmsClient.ts
import { HMSSDK } from "@100mslive/react-native-hms";
import { Platform, PermissionsAndroid } from "react-native";

let _hms: HMSSDK | null = null;

async function ensurePermissions() {
  if (Platform.OS !== "android") return;
  try {
    const mic = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
    );
    if (mic !== PermissionsAndroid.RESULTS.GRANTED) {
      console.warn("[hms] mic permission denied");
    }
  } catch {}
}

/** Build a single HMSSDK instance and reuse it. */
export async function getHMS() {
  if (_hms) return _hms;
  _hms = await HMSSDK.build();
  return _hms;
}

/** Join room with a 100ms auth token + display name. */
export async function hmsJoin(authToken: string, name: string) {
  await ensurePermissions();
  const hms = await getHMS();
  await hms.join({ authToken, userName: name });
  return hms;
}

/** Leave the current room (safe to call multiple times). */
export async function hmsLeave() {
  try {
    const hms = await getHMS();
    await hms.leave();
  } catch {}
}

/** Mute/unmute local audio. */
export async function hmsSetLocalAudioEnabled(enabled: boolean) {
  const hms = await getHMS();
  // This toggles the local mic track
  await hms.setPlaybackForAllAudio(false); // don’t mute remote audio by mistake
  // RN SDK doesn’t have a single toggle method; we use changeTrackState for local audio track
  const localPeer = await hms.getLocalPeer();
  const audio = localPeer?.audioTrack; // may be null until publish
  if (audio?.trackId) {
    await hms.changeTrackState(audio, !enabled ? true : false); // true=mute, false=unmute
  }
}

/** Quick probe for connection (optional, used by UI). */
export async function hmsIsConnected(): Promise<boolean> {
  try {
    const hms = await getHMS();
    const room = await hms.getRoom();
    // connected states vary; simplest: having a room id/peer list means connected
    const peers = await hms.getRemotePeers();
    return !!room && (peers?.length >= 0);
  } catch {
    return false;
  }
}
