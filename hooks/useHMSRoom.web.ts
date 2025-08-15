// hooks/useHMSRoom.web.ts - Web-compatible version
import { useState, useEffect, useRef } from 'react';

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

  const [webAlert, setWebAlert] = useState<string | null>(null);

  // Web alert simulation
  const showAlert = (title: string, message?: string) => {
    setWebAlert(`${title}${message ? ': ' + message : ''}`);
    setTimeout(() => setWebAlert(null), 3000);
  };

  // Room actions - Web simulation
  const joinRoom = async (authToken: string) => {
    console.log('🌐 Web Mode: Simulating HMS room join');
    setRoomState(prev => ({ ...prev, isConnecting: true, error: null }));

    // Simulate connection delay
    setTimeout(() => {
      setRoomState(prev => ({
        ...prev,
        isConnected: true,
        isConnecting: false,
        localPeer: { 
          name: userName, 
          peerID: userId,
          isLocal: true
        },
        // Add some mock remote peers for demonstration
        remotePeers: [
          { name: 'أحمد محمد', peerID: 'peer1', isLocal: false },
          { name: 'فاطمة علي', peerID: 'peer2', isLocal: false }
        ]
      }));
      console.log('✅ Web Mode: Simulated room join successful');
    }, 2000);
  };

  const leaveRoom = async () => {
    console.log('🌐 Web Mode: Leaving room');
    setRoomState(prev => ({
      ...prev,
      isConnected: false,
      localPeer: null,
      remotePeers: [],
    }));
  };

  const toggleMute = async () => {
    const newMutedState = !roomState.isMuted;
    
    setRoomState(prev => ({
      ...prev,
      isMuted: newMutedState,
      isSpeaking: newMutedState ? false : prev.isSpeaking,
    }));

    console.log(`🌐 Web Mode: Microphone ${newMutedState ? 'MUTED' : 'UNMUTED'}`);
    showAlert(
      newMutedState ? 'تم كتم الميكروفون' : 'تم تشغيل الميكروفون',
      newMutedState ? 'لن يتمكن الآخرون من سماعك' : 'يمكن للآخرين سماعك الآن'
    );
  };

  const raiseHand = async () => {
    const newHandRaisedState = !roomState.isHandRaised;
    
    setRoomState(prev => ({ ...prev, isHandRaised: newHandRaisedState }));
    
    console.log(`🌐 Web Mode: Hand ${newHandRaisedState ? 'RAISED' : 'LOWERED'}`);
    showAlert(
      newHandRaisedState ? 'تم رفع اليد' : 'تم إنزال اليد',
      newHandRaisedState ? 'طلبت الإذن للتحدث' : 'ألغيت طلب التحدث'
    );
  };

  // Admin actions
  const muteRemotePeer = async (peerToMute: any) => {
    console.log('🌐 Web Mode: Muting peer', peerToMute.name);
    showAlert('تم الكتم', 'تم كتم المشارك بنجاح');
  };

  const removePeer = async (peerToRemove: any) => {
    console.log('🌐 Web Mode: Removing peer', peerToRemove.name);
    
    // Remove from state
    setRoomState(prev => ({
      ...prev,
      remotePeers: prev.remotePeers.filter(peer => peer.peerID !== peerToRemove.peerID)
    }));
    
    showAlert('تم الطرد', 'تم طرد المشارك من الغرفة');
  };

  // Simulate speaking animation
  useEffect(() => {
    if (!roomState.isMuted && roomState.isConnected) {
      const interval = setInterval(() => {
        setRoomState(prev => ({
          ...prev,
          isSpeaking: Math.random() > 0.7 // Random speaking animation
        }));
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [roomState.isMuted, roomState.isConnected]);

  return {
    ...roomState,
    joinRoom,
    leaveRoom,
    toggleMute,
    raiseHand,
    muteRemotePeer,
    removePeer,
    hmsInstance: { web: true, simulation: true },
    webAlert, // Additional web-specific alert system
  };
};
