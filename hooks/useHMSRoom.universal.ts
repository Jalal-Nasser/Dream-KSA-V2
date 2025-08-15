// hooks/useHMSRoom.universal.ts - Platform-aware HMS hook
import { Platform } from 'react-native';

// Platform detection
const isWeb = Platform.OS === 'web';

// Dynamic import based on platform
export const useHMSRoom = isWeb 
  ? require('./useHMSRoom.web').useHMSRoom
  : require('./useHMSRoom').useHMSRoom;

// Export types
export interface UseHMSRoomProps {
  roomId: string;
  userId: string;
  userName: string;
  role: string;
}

export interface HMSRoomState {
  isConnected: boolean;
  isConnecting: boolean;
  localPeer: any;
  remotePeers: any[];
  isMuted: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export interface HMSRoomActions {
  joinRoom: (authToken: string) => Promise<void>;
  leaveRoom: () => Promise<void>;
  toggleMute: () => Promise<void>;
  raiseHand: () => Promise<void>;
  muteRemotePeer: (peer: any) => Promise<void>;
  removePeer: (peer: any) => Promise<void>;
  hmsInstance: any;
}

export default useHMSRoom;
