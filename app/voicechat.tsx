import * as React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Alert, View, Text, FlatList, ScrollView, Pressable, Image } from 'react-native';
import { ENV, HMS_ROLES, logEnvOnce } from '@/env';
import { supabase } from '@/lib/supabase';
import { RaiseHandButton } from '@/src/components/RaiseHandButton';
import { AdminMicPanel } from '@/src/components/AdminMicPanel';
import SpeakerTile from '@/src/components/SpeakerTile';
import ListenerTile from '@/src/components/ListenerTile';
import { listenRoom, raiseHand, cancelHand, grantMic, revokeMic } from '@/db/mic';
import { useVipMap } from '@/db/vip';
import { useMicQueue } from '@/src/logic/useMicQueue';
import type { MicStatus, RoomParticipant } from '@/db/types';
import { useHMSGate } from '@/voice/useHMSGate';
import { useHmsLevels } from '@/voice/useHmsLevels';
import { useAdminControls } from '@/src/hooks/useAdminControls';
import RosterSheet from '@/src/components/RosterSheet';

import { Users } from 'lucide-react-native';
import { HMSPeer } from '@100mslive/react-native-hms';

// Log environment once at module load
logEnvOnce();

type HMSRole = string;

export default function VoiceChat() {
  // 1) Params (no conditionals)
  useEffect(() => { }, []);
  const params = useLocalSearchParams() as any;

  // Debug: log roles on mount
  useEffect(() => {
    console.log('[VC] using roles', HMS_ROLES);
  }, []);

  // 2) Fixed hook order: refs first, then states
  const mounted = useRef(true);
  const [appRoomId, setAppRoomId] = useState<string | null>(params.appRoomId ?? null);
  const [hmsRoomId, setHmsRoomId] = useState<string | null>(params.hmsRoomId ?? null);
  const [meId, setMeId] = useState<string>('');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [roomData, setRoomData] = useState<any>(null);
  const { participants, pendingSorted, speakers, vipMap } = useMicQueue(appRoomId || '');
  
  // Real 100ms audio levels
  const levels = useHmsLevels();
  

  
  // Debug: log levels when they change
  useEffect(() => {
    if (Object.keys(levels).length > 0) {
      console.log('[VC] Audio levels received:', levels);
    }
  }, [levels]);

  // 3) Derivations via useMemo (never undefined username)
  const displayName = useMemo(() => {
    const fromParams = params.displayName as string | undefined;
    const fromEmail =
      (globalThis.__authUser?.email && globalThis.__authUser.email.split('@')[0]) || undefined;
    return fromParams || fromEmail || 'Guest';
  }, [params.displayName]);

  console.log('[VC] using displayName', displayName);
  console.log('[VC] params', { appRoomId, hmsRoomId });

  // 4) Keep refs in sync with lifecycle
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  // 5) Resolve missing IDs (effects are declared UNCONDITIONALLY, branch inside)
  useEffect(() => {
    (async () => {
      // Resolve HMS from app UUID
      if (appRoomId && !hmsRoomId) {
        const { data, error } = await supabase
          .from('rooms')
          .select('hms_room_id')
          .eq('id', appRoomId)
          .maybeSingle();
        if (!mounted.current) return;
        if (error) { console.log('[VC] resolve hmsRoomId err', error); return; }
        if (data?.hms_room_id) setHmsRoomId(data.hms_room_id);
      }
      // Resolve app UUID from HMS
      if (hmsRoomId && !appRoomId) {
        const { data, error } = await supabase
          .from('rooms')
          .select('id')
          .eq('hms_room_id', hmsRoomId)
          .maybeSingle();
        if (!mounted.current) return;
        if (error) { console.log('[VC] resolve appRoomId err', error); return; }
        if (data?.id) setAppRoomId(data.id);
      }
    })();
  }, [appRoomId, hmsRoomId]);

  // Session: get my user id
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const uid = data.user?.id || '';
      setMeId(uid);
    });
  }, []);
  
  // Fetch room data for branding
  useEffect(() => {
    if (!appRoomId) return;
    
    const fetchRoomData = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms_public_view')
          .select('*')
          .eq('id', appRoomId)
          .single();
        
        if (!error && data) {
          setRoomData(data);
        }
      } catch (err) {
        console.error('Failed to fetch room data:', err);
      }
    };
    
    fetchRoomData();
  }, [appRoomId]);

  // Admin check: rooms.owner_id === me OR agency membership (owner/manager)
  useEffect(() => {
    if (!appRoomId || !meId) return;
    
    const checkAdminStatus = async () => {
      try {
        // Check if user is room owner
        const { data: roomData } = await supabase
          .from('rooms')
          .select('owner_id, agency_id')
          .eq('id', appRoomId)
          .maybeSingle();
        
        if (roomData?.owner_id === meId) {
          setIsAdmin(true);
          return;
        }
        
        // Check if user is agency owner/manager
        if (roomData?.agency_id) {
          const { data: memberData } = await supabase
            .from('agency_members')
            .select('role')
            .eq('agency_id', roomData.agency_id)
            .eq('user_id', meId)
            .maybeSingle();
          
          if (memberData?.role === 'owner' || memberData?.role === 'manager') {
            setIsAdmin(true);
            return;
          }
        }
        
        setIsAdmin(false);
      } catch (error) {
        console.error('Admin check failed:', error);
        setIsAdmin(false);
      }
    };
    
    checkAdminStatus();
  }, [appRoomId, meId]);

  // 6) Realtime: room_participants + mic_requests
  useEffect(() => {
    if (!appRoomId) return;
    const unsub = listenRoom(appRoomId, {
      onParticipants: () => {},
      onRequests: () => {},
    });
    return () => unsub?.();
  }, [appRoomId]);

  // 8) Render (no early return before hooks are declared)
  const myMicStatus: MicStatus = participants.find((p) => p.user_id === meId)?.mic_status || 'none';

  // 100ms role gate (audio-only)
  const hmsGate = useHMSGate({
    hmsRoomId: hmsRoomId!,
    userId: meId,
    displayName: displayName,
    micStatus: myMicStatus,
  });
  
  // Admin controls hook - QA: Admin sees actions and they work across devices
  const adminControls = useAdminControls(hmsGate.hms);
  
  // Roster state
  const [rosterVisible, setRosterVisible] = useState(false);
  const [rosterItems, setRosterItems] = useState<Array<{
    peer: HMSPeer;
    name: string;
    role: 'listener' | 'speaker' | 'moderator';
    vip?: { name: string; color: string };
  }>>([]);
  
  // Update roster when participants change
  useEffect(() => {
    if (hmsGate.hms && hmsGate.peers) {
      const items = hmsGate.peers.map(peer => ({
        peer,
        name: peer.name || peer.userID || 'Unknown',
        role: peer.role?.name === 'speaker' ? 'speaker' : 'listener' as 'listener' | 'speaker' | 'moderator',
        vip: vipMap[peer.userID] ? {
          name: vipMap[peer.userID].name,
          color: vipMap[peer.userID].badge_color || '#FFD700'
        } : undefined
      }));
      setRosterItems(items);
    }
  }, [hmsGate.hms, hmsGate.peers, vipMap]);
  
  // Roster handlers with proper error handling and user feedback
  const handleMakeListener = useCallback(async (peer: HMSPeer) => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await adminControls.makeListener(peer);
      Alert.alert('Success', 'User role changed to listener');
    } catch (error: any) {
      console.error('Make listener failed:', error);
      Alert.alert('Error', error.message || 'Failed to change user role');
    }
  }, [adminControls]);
  
  const handleKick = useCallback(async (peer: HMSPeer) => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await adminControls.kick(peer);
      Alert.alert('Success', 'User removed from room');
    } catch (error: any) {
      console.error('Kick failed:', error);
      Alert.alert('Error', error.message || 'Failed to remove user');
    }
  }, [adminControls]);
  
  const handleMute = useCallback(async (peer: HMSPeer) => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await adminControls.mute(peer);
      Alert.alert('Success', 'User audio muted');
    } catch (error: any) {
      console.error('Mute failed:', error);
      Alert.alert('Error', error.message || 'Failed to mute user');
    }
  }, [adminControls]);
  
  const openRoster = useCallback(() => {
    setRosterVisible(true);
  }, []);
  
  const closeRoster = useCallback(() => {
    setRosterVisible(false);
  }, []);

  // Split participants into speakers and listeners
  const speakersList = participants.filter(p => p.mic_status === 'granted');
  const listenersList = participants.filter(p => p.mic_status !== 'granted');

  const ready = !!appRoomId && !!hmsRoomId;
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0E131A' }}>
        <Text style={{ color: 'white' }}>Preparing room…</Text>
        <Text style={{ color: '#9CA3AF', marginTop: 6 }}>appRoomId: {String(appRoomId)} | hmsRoomId: {String(hmsRoomId)}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#0E131A' }}>
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 16, 
        paddingTop: 16, 
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#1a2330',
      }}>
        {/* Agency Banner */}
        {roomData?.agency_icon_url && (
          <View className="h-32 w-full mb-4 rounded-lg overflow-hidden">
            <Image
              source={{ uri: roomData.agency_icon_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
            {/* Gradient overlay for text readability */}
            <View className="absolute inset-0 bg-black/40" />
            
            {/* Room title over banner */}
            <View className="absolute bottom-3 left-3 right-3">
              <Text className="text-white font-bold text-xl drop-shadow-lg mb-1">
                {roomData?.name || 'Voice Chat'}
              </Text>
              <Text className="text-white text-sm drop-shadow-lg opacity-90">
                {roomData?.agency_name}
              </Text>
            </View>
          </View>
        )}
        
        {/* Header Content */}
        <View className="flex-row items-center justify-between">
          <View className="flex-1">
            <Text style={{ color: 'white', fontSize: 18, fontWeight: '800', textAlign: 'left' }}>
              {displayName} • {isAdmin ? 'Admin' : 'User'}
            </Text>
            <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'left', marginTop: 4 }}>
              {speakersList.length} speaking • {listenersList.length} listening
            </Text>
          </View>
          
          {/* Roster Button */}
          {hmsGate.hms && (
            <Pressable
              onPress={openRoster}
              className="bg-blue-600 px-4 py-2 rounded-lg flex-row items-center"
            >
              <Users size={16} color="white" />
              <Text className="text-white font-semibold ml-2">Roster</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Debug: Show current audio levels */}
      {Object.keys(levels).length > 0 && (
        <View style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16, marginTop: 8, borderRadius: 8 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Audio Levels:</Text>
          {Object.entries(levels).map(([userId, level]) => (
            <Text key={userId} style={{ color: '#9CA3AF', fontSize: 11 }}>
              {userId}: {(level * 100).toFixed(1)}%
            </Text>
          ))}
        </View>
      )}

      {/* Speakers Grid - Horizontal */}
      <View style={{ marginTop: 16 }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 16, marginBottom: 12 }}>
          Speakers ({speakersList.length})
        </Text>
        {speakersList.length > 0 ? (
          <FlatList
            horizontal
            data={speakersList}
            keyExtractor={(item) => item.user_id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8 }}
            renderItem={({ item }) => (
              <SpeakerTile
                user={item}
                speaking={(levels[item.user_id] ?? 0) > 0.1}
                vipName={vipMap[item.user_id]?.name}
              />
            )}
          />
        ) : (
          <View style={{ 
            paddingHorizontal: 16, 
            paddingVertical: 24, 
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.03)',
            marginHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#1a2330',
          }}>
            <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
              No speakers yet. Raise your hand to request the mic!
            </Text>
          </View>
        )}
      </View>

      {/* Listeners Grid - Vertical */}
      <View style={{ flex: 1, marginTop: 16 }}>
        <Text style={{ color: 'white', fontSize: 16, fontWeight: '700', marginLeft: 16, marginBottom: 12 }}>
          Listeners ({listenersList.length})
        </Text>
        {listenersList.length > 0 ? (
          <FlatList
            data={listenersList}
            keyExtractor={(item) => item.user_id}
            numColumns={4}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 8, paddingBottom: 120 }}
            renderItem={({ item }) => (
              <ListenerTile
                user={item}
                vipName={vipMap[item.user_id]?.name}
              />
            )}
          />
        ) : (
          <View style={{ 
            paddingHorizontal: 16, 
            paddingVertical: 24, 
            alignItems: 'center',
            backgroundColor: 'rgba(255,255,255,0.03)',
            marginHorizontal: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: '#1a2330',
          }}>
            <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
              No listeners yet. Be the first to join!
            </Text>
          </View>
        )}
      </View>

      {/* Bottom Bar */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.98)',
        borderTopWidth: 1,
        borderTopColor: '#1a2330',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 32, // Safe area
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
      }}>
        {isAdmin ? (
          <AdminMicPanel
            isAdmin={isAdmin}
            speakers={speakers}
            pendingSorted={pendingSorted as any}
            onApprove={async (user_id) => {
              try {
                if (speakers.length >= 2) {
                  Alert.alert('Limit reached', 'Max 2 users on mic');
                  return;
                }
                await grantMic(meId, user_id, appRoomId!);
              } catch (e: any) {
                Alert.alert('Approve failed', e?.message || 'Unknown error');
              }
            }}
            onRevoke={async (user_id) => {
              try {
                await revokeMic(meId, user_id, appRoomId!);
              } catch (e: any) {
                Alert.alert('Revoke failed', e?.message || 'Unknown error');
              }
            }}
            maxSpeakers={2}
          />
        ) : (
          <RaiseHandButton
            status={myMicStatus}
            onRaise={() => appRoomId && meId && raiseHand(meId, appRoomId)}
            onCancel={() => appRoomId && meId && cancelHand(meId, appRoomId)}
          />
        )}
      </View>
      
      {/* Roster Sheet */}
      {hmsGate.hms && (
        <RosterSheet
          items={rosterItems}
          visible={rosterVisible}
          onClose={closeRoster}
          canAdmin={isAdmin}
          onMute={handleMute}
          onKick={handleKick}
          onMakeListener={handleMakeListener}
        />
      )}
    </View>
  );
}


