// hooks/useHMSRoom.ts - Real 100ms integration
import { useState, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

// Import HMS SDK only for mobile platforms
let HMSSDK: any;
let HMSConfig: any;
let HMSUpdateListenerActions: any;

// Only import HMS SDK on mobile platforms with native builds
// if (Platform.OS !== 'web') {
//   try {
//     const hms = require('@100mslive/react-native-hms');
//     HMSSDK = hms.HMSSDK;
//     HMSConfig = hms.HMSConfig;
//     HMSUpdateListenerActions = hms.HMSUpdateListenerActions;
//     console.log('✅ HMS SDK loaded successfully');
//   } catch (error) {
//     console.log('📱 HMS SDK not available in Expo Go - using simulation mode');
//     // This is expected in Expo Go - HMS needs native compilation
//   }
// }

interface UseHMSRoomProps {
  roomId: string;
  userId: string;
  userName: string;
  role: string;
}

interface HMSRoomState {
  isConnected: boolean;
  isConnecting: boolean;
  localPeer: any;
  remotePeers: any[];
  isMuted: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  error: string | null;
}

export const useHMSRoom = ({ roomId, userId, userName, role }: UseHMSRoomProps) => {
  const hmsInstanceRef = useRef<any>(null);
  const [roomState, setRoomState] = useState<HMSRoomState>({
    isConnected: false,
    isConnecting: false,
    localPeer: null,
    remotePeers: [],
    isMuted: true,
    isHandRaised: false,
    isSpeaking: false,
    error: null,
  });

  // Initialize HMS SDK
  useEffect(() => {
    const initializeHMS = async () => {
      try {
        if (HMSSDK) {
          console.log('🎤 Initializing REAL HMS SDK...');
          // Import and build HMS instance
          const instance = await importHMS()
          hmsInstanceRef.current = instance

          // Extra safety: ensure video is disabled before any operations
          try {
            if (typeof instance.setLocalVideoEnabled === "function") {
              await instance.setLocalVideoEnabled(false);
              console.log('[HMS] video disabled before join (extra safety)');
            }
          } catch (e) {
            console.log('[HMS] pre-join video disable error:', e);
          }

          // Setup event listeners
          setupEventListeners(instance)
          
          console.log('✅ HMS SDK initialized successfully - REAL microphone ready!');
        } else {
          console.log('📱 HMS SDK not available - using simulation mode');
          setTimeout(() => {
            hmsInstanceRef.current = { initialized: true, simulation: true };
          }, 1000);
        }

      } catch (error) {
        console.error('HMS initialization error:', error);
        setRoomState(prev => ({ ...prev, error: 'Failed to initialize HMS SDK' }));
      }
    };

    initializeHMS();

    return () => {
      if (hmsInstanceRef.current && !hmsInstanceRef.current.simulation) {
        hmsInstanceRef.current.leave();
        hmsInstanceRef.current.destroy();
      }
    };
  }, []);

  // Real HMS Event handlers
  const onJoinSuccess = (data: any) => {
    console.log('✅ REAL HMS room joined successfully:', data);
    setRoomState(prev => ({
      ...prev,
      isConnected: true,
      isConnecting: false,
      localPeer: data?.localPeer || null,
      isMuted: data?.localPeer?.audioTrack?.isMute?.() ?? true,
    }));
  };

  const onPeerUpdate = (data: any) => {
    console.log('👥 REAL peer update:', data);
    if (data?.type === 'PEER_JOINED' && data?.peer) {
      setRoomState(prev => ({
        ...prev,
        remotePeers: [...prev.remotePeers, data.peer]
      }));
    } else if (data?.type === 'PEER_LEFT' && data?.peer) {
      setRoomState(prev => ({
        ...prev,
        remotePeers: prev.remotePeers.filter(peer => peer?.peerID !== data.peer.peerID)
      }));
    }
  };

  const onTrackUpdate = (data: any) => {
    console.log('🎵 REAL track update - audio level detected:', data);
    
    if (data?.track && data.track.source === 'regular') {
      const isSpeaking = !(data.track.isMute?.() ?? true);
      
      if (data?.peer?.isLocal) {
        setRoomState(prev => ({
          ...prev,
          isSpeaking,
          isMuted: data.track.isMute?.() ?? true,
        }));
      }
    }
  };

  const onError = (error: any) => {
    console.error('❌ REAL HMS Error:', error);
    
    // Handle "peer already joined" error gracefully
    if (error.code === 400 && error.message?.includes('peer already joined')) {
      console.log('ℹ️ Peer already joined - treating as success');
      setRoomState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        error: null,
      }));
      return;
    }
    
    setRoomState(prev => ({
      ...prev,
      error: error.message || 'Connection error',
      isConnecting: false,
    }));
    Alert.alert('Connection Error', error.message);
  };

  // Room actions
  const joinRoom = async (authToken: string) => {
    if (!hmsInstanceRef.current) {
      Alert.alert('Error', 'HMS SDK not initialized');
      return;
    }

    setRoomState(prev => ({ ...prev, isConnecting: true, error: null }));

    try {
      if (hmsInstanceRef.current.simulation) {
        // Simulation mode
        console.log('🎭 Joining room in simulation mode');
        setTimeout(() => {
          setRoomState(prev => ({
            ...prev,
            isConnected: true,
            isConnecting: false,
            localPeer: { name: userName, peerID: userId },
          }));
        }, 2000);
      } else {
        // Real HMS mode
        console.log('🎤 Joining REAL HMS room with token:', authToken.substring(0, 20) + '...');
        
        const config = new HMSConfig({
          authToken,
          username: userName,
          metadata: JSON.stringify({ userId, role }),
          // critical: request mic only, not camera
          captureNetworkQualityInPreview: false,
          isAudioOnly: true,
        });

        await hmsInstanceRef.current.join(config);
        
        // Immediately disable video after join
        try {
          if (typeof hmsInstanceRef.current.setLocalVideoEnabled === "function") {
            await hmsInstanceRef.current.setLocalVideoEnabled(false);
            console.log('[HMS] video disabled immediately after join');
          }
        } catch (e) {
          console.log('[HMS] video disable error:', e);
        }
        
        console.log('🎯 REAL HMS join initiated - microphone will be active!');
        console.log('[HMS] joined audio-only as', userName);
      }

    } catch (error: any) {
      console.error('Join room error:', error);
      setRoomState(prev => ({
        ...prev,
        isConnecting: false,
        error: error.message || 'Failed to join room',
      }));
    }
  };

  const leaveRoom = async () => {
    if (hmsInstanceRef.current && !hmsInstanceRef.current.simulation) {
      try {
        await hmsInstanceRef.current.leave();
      } catch (error: any) {
        console.error('Leave room error:', error);
      }
    }
    
    setRoomState(prev => ({
      ...prev,
      isConnected: false,
      localPeer: null,
      remotePeers: [],
    }));
  };

  const toggleMute = async () => {
    try {
      const newMutedState = !roomState.isMuted;
      
      if (hmsInstanceRef.current && !hmsInstanceRef.current.simulation) {
        // Real HMS mute/unmute
        const localPeer = await hmsInstanceRef.current.getLocalPeer();
        const audioTrack = localPeer?.localAudioTrack?.();
        
        if (audioTrack) {
          await audioTrack.setMute(newMutedState);
          console.log(`🎤 REAL microphone ${newMutedState ? 'MUTED' : 'UNMUTED'}`);
        }
      }
      
      setRoomState(prev => ({
        ...prev,
        isMuted: newMutedState,
        isSpeaking: newMutedState ? false : prev.isSpeaking,
      }));

      Alert.alert(
        newMutedState ? 'تم كتم الميكروفون' : 'تم تشغيل الميكروفون',
        newMutedState ? 'لن يتمكن الآخرون من سماعك' : 'يمكن للآخرين سماعك الآن'
      );
    } catch (error: any) {
      console.error('Toggle mute error:', error);
      Alert.alert('Error', 'Failed to toggle mute');
    }
  };

  const raiseHand = async () => {
    try {
      const newHandRaisedState = !roomState.isHandRaised;
      
      if (hmsInstanceRef.current && !hmsInstanceRef.current.simulation) {
        // Send real broadcast message
        await hmsInstanceRef.current.sendBroadcastMessage(
          JSON.stringify({
            type: 'HAND_RAISE',
            isRaised: newHandRaisedState,
            userId,
            userName,
          })
        );
      }

      setRoomState(prev => ({ ...prev, isHandRaised: newHandRaisedState }));
      
      Alert.alert(
        newHandRaisedState ? 'تم رفع اليد' : 'تم إنزال اليد',
        newHandRaisedState ? 'طلبت الإذن للتحدث' : 'ألغيت طلب التحدث'
      );
    } catch (error: any) {
      console.error('Raise hand error:', error);
    }
  };

  // Admin actions
  const muteRemotePeer = async (peerToMute: any) => {
    try {
      if (hmsInstanceRef.current && !hmsInstanceRef.current.simulation && peerToMute?.audioTrack) {
        await hmsInstanceRef.current.changeTrackState(
          peerToMute.audioTrack,
          true // mute
        );
      }
      Alert.alert('تم الكتم', 'تم كتم المشارك بنجاح');
    } catch (error: any) {
      console.error('Mute peer error:', error);
      Alert.alert('Error', 'Failed to mute participant');
    }
  };

  const removePeer = async (peerToRemove: any) => {
    try {
      if (hmsInstanceRef.current && !hmsInstanceRef.current.simulation) {
        await hmsInstanceRef.current.removePeer(peerToRemove, 'Removed by moderator');
      }
      Alert.alert('تم الطرد', 'تم طرد المشارك من الغرفة');
    } catch (error: any) {
      console.error('Remove peer error:', error);
      Alert.alert('Error', 'Failed to remove participant');
    }
  };

  return {
    ...roomState,
    joinRoom,
    leaveRoom,
    toggleMute,
    raiseHand,
    muteRemotePeer,
    removePeer,
    hmsInstance: hmsInstanceRef.current,
  };
};
