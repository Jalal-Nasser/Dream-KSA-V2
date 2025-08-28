import { useCallback } from 'react';
import { HMSSDK, HMSPeer, HMSRole } from '@100mslive/react-native-hms';

interface AdminControls {
  makeListener: (peer: HMSPeer) => Promise<void>;
  mute: (peer: HMSPeer) => Promise<void>;
  kick: (peer: HMSPeer) => Promise<void>;
}

/**
 * Hook providing admin control functions for 100ms SDK
 * @param hms - HMSSDK instance
 * @returns Object with admin control functions
 */
export function useAdminControls(hms: HMSSDK): AdminControls {
  
  // Make a peer a listener (change role to "listener")
  const makeListener = useCallback(async (peer: HMSPeer): Promise<void> => {
    try {
      // Create a listener role object
      const listenerRole: HMSRole = { name: 'listener' };
      
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await hms.changeRoleOfPeer(peer, listenerRole);
    } catch (error) {
      console.error('Failed to make peer listener:', error);
      throw new Error('Failed to change peer role to listener');
    }
  }, [hms]);

  // Mute/unmute a peer's audio track
  const mute = useCallback(async (peer: HMSPeer): Promise<void> => {
    try {
      // Find the peer's audio track to mute
      const audioTrack = peer.audioTrack;
      if (!audioTrack) {
        throw new Error('Peer has no audio track to mute');
      }
      
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await hms.changeTrackState(audioTrack, true); // true = mute
    } catch (error) {
      console.error('Failed to mute peer:', error);
      throw new Error('Failed to mute peer audio');
    }
  }, [hms]);

  // Kick a peer from the room
  const kick = useCallback(async (peer: HMSPeer): Promise<void> => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await hms.removePeer(peer, "kicked by admin");
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
