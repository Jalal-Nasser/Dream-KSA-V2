import { useEffect, useRef, useState } from 'react';
import { getHmsToken } from './getHmsToken';
import { HMS_ROLES } from '@/env';
import type { MicStatus } from '@/src/db/types';
import { HMSSDK, HMSConfig, HMSTrackSettings, HMSUpdateListenerActions, HMSPeer } from '@100mslive/react-native-hms';
import { setLevels, updateLevel } from './useHmsLevels';

type GateParams = {
  hmsRoomId: string;
  userId: string;
  displayName: string;
  micStatus: MicStatus;
};

export function useHMSGate({ hmsRoomId, userId, displayName, micStatus }: GateParams) {
  const hmsRef = useRef<HMSSDK | null>(null);
  const [role, setRole] = useState<string>('');
  const [peers, setPeers] = useState<HMSPeer[]>([]);

  useEffect(() => {
    (async () => {
      if (!hmsRef.current) {
        hmsRef.current = await HMSSDK.build();
        hmsRef.current?.addEventListener(HMSUpdateListenerActions.ON_ERROR, (e: any) =>
          console.log('[HMS] error', e)
        );
      }
    })();
    return () => {};
  }, []);

  useEffect(() => {
    const desired = micStatus === 'granted' ? HMS_ROLES.speaker : HMS_ROLES.listener;
    setRole(desired);
  }, [micStatus]);

  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;
    
    async function joinWithRole() {
      if (!hmsRef.current || !role || cancelled) return;
      try { await hmsRef.current.leave(); } catch {}

      const token = await getHmsToken({
        room_id: hmsRoomId,
        role,
        user_id: userId,
        display_name: displayName,
      });

      const track = new HMSTrackSettings();
      track.video = { isMuted: true } as any;
      track.audio = { isMuted: false } as any;

      const config = new HMSConfig({ 
        authToken: token, 
        userName: displayName, 
        metadata: JSON.stringify({ userId }),
        customerUserId: userId // Set unique user ID for level mapping
      } as any);
      
      try {
        await hmsRef.current.join(config, track);
        if (cancelled) return;
        console.log('[HMS] joined as', role);
        
        // Register audio level listeners after successful join
        const listener = (speakers: any[]) => {
          if (cancelled) return;
          console.log('[HMS] Audio levels update:', speakers?.length || 0, 'speakers');
          const map: Record<string, number> = {};
          for (const sp of speakers || []) {
            const userId =
              sp?.peer?.customerUserId || sp?.peer?.userID || sp?.peer?.peerID;
            if (!userId) continue;
            const level = typeof sp.level === 'number' ? sp.level : 0;
            map[userId] = level;
            if (level > 0.1) {
              console.log('[HMS] User speaking:', userId, 'level:', level);
            }
          }
          setLevels(map);
        };

        // Attach listener for speaker updates
        hmsRef.current?.addEventListener(HMSUpdateListenerActions.ON_SPEAKER_UPDATE, listener);
        
        // Attach listener for peer updates
        const peerListener = (data: any) => {
          if (cancelled) return;
          console.log('[HMS] Peer update:', data);
          
          // Update peers list based on the event
          if (data?.type === 'PEER_JOINED' && data?.peer) {
            setPeers(prev => [...prev, data.peer]);
          } else if (data?.type === 'PEER_LEFT' && data?.peer) {
            setPeers(prev => prev.filter(p => p.peerID !== data.peer.peerID));
          } else if (data?.type === 'PEER_UPDATE' && data?.peer) {
            setPeers(prev => prev.map(p => p.peerID === data.peer.peerID ? data.peer : p));
          }
        };
        
        hmsRef.current?.addEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, peerListener);
        
        // Store cleanup function
        cleanup = () => {
          hmsRef.current?.removeEventListener(HMSUpdateListenerActions.ON_SPEAKER_UPDATE, listener);
          hmsRef.current?.removeEventListener(HMSUpdateListenerActions.ON_PEER_UPDATE, peerListener);
        };
      } catch (e) {
        if (!cancelled) console.log('[HMS] join failed', e);
      }
    }

    joinWithRole();
    
    return () => { 
      cancelled = true;
      cleanup?.();
    };
  }, [role, hmsRoomId, userId, displayName]);

  return {
    leave: async () => {
      try { await hmsRef.current?.leave(); } catch {}
    },
    hms: hmsRef.current,
    peers,
  };
}
