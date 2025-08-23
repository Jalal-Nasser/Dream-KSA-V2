import { useCallback } from 'react';
import { HMSSDK } from '@100mslive/react-native-hms';

interface AdminControls {
  makeListener: (peerId: string) => Promise<void>;
  mute: (peerId: string) => Promise<void>;
  kick: (peerId: string) => Promise<void>;
}

/**
 * Hook providing admin control functions for 100ms SDK
 * @param hms - HMSSDK instance
 * @returns Object with admin control functions
 */
export function useAdminControls(hms: HMSSDK): AdminControls {
  
  // Make a peer a listener (change role to "listener")
  const makeListener = useCallback(async (peerId: string): Promise<void> => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await hms.changeRoleOfPeerWithReason(peerId, "listener", "admin mute");
    } catch (error) {
      console.error('Failed to make peer listener:', error);
      throw new Error('Failed to change peer role to listener');
    }
  }, [hms]);

  // Mute/unmute a peer's audio track
  const mute = useCallback(async (peerId: string): Promise<void> => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await hms.changeTrackStateForPeer(peerId, "audio", false);
    } catch (error) {
      console.error('Failed to mute peer:', error);
      throw new Error('Failed to mute peer audio');
    }
  }, [hms]);

  // Kick a peer from the room
  const kick = useCallback(async (peerId: string): Promise<void> => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await hms.removePeer(peerId, "kicked by admin");
    } catch (error) {
      console.error('Failed to kick peer:', error);
      throw new Error('Failed to remove peer from room');
    }
  }, [hms]);

  return {
    makeListener,
    mute,
    kick,
  };
}
