import * as React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Alert, View, Text, FlatList, ScrollView, Pressable, Image, ImageBackground, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
  const [branding, setBranding] = useState<{
    title?: string;
    agency_name?: string;
    theme_color?: string;
    banner_url?: string;
    listener_count?: number;
    speaker_count?: number;
  } | null>(null);
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
  
  // Fetch branding data by hms_room_id
  useEffect(() => {
    if (!hmsRoomId) return;
    
    const fetchBrandingData = async () => {
      try {
        const { data, error } = await supabase
          .from('rooms_public_view')
          .select('title, agency_name, theme_color, banner_url, listener_count, speaker_count')
          .eq('hms_room_id', hmsRoomId)
          .limit(1)
          .single();
        
        if (!mounted.current) return;
        
        if (error) {
          console.log('[VC] fetch branding error:', error);
          return;
        }
        
        if (data) {
          setBranding(data);
          console.log('[VC] branding loaded:', data);
        }
      } catch (err) {
        console.error('Failed to fetch branding data:', err);
      }
    };
    
    fetchBrandingData();
  }, [hmsRoomId]);

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
    peer: any; // HMSPeer type
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
  const handleMakeListener = useCallback(async (peer: any) => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await adminControls.makeListener(peer);
      Alert.alert('Success', 'User role changed to listener');
    } catch (error: any) {
      console.error('Make listener failed:', error);
      Alert.alert('Error', error.message || 'Failed to change user role');
    }
  }, [adminControls]);
  
  const handleKick = useCallback(async (peer: any) => {
    try {
      // QA: Actions don't crash if peer leaves between tap → call (gracefully ignore)
      await adminControls.kick(peer);
      Alert.alert('Success', 'User removed from room');
    } catch (error: any) {
      console.error('Kick failed:', error);
      Alert.alert('Error', error.message || 'Failed to remove user');
    }
  }, [adminControls]);
  
  const handleMute = useCallback(async (peer: any) => {
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
  
  // Compute live counts - prefer HMS peer data when available, fallback to DB
  const liveCounts = useMemo(() => {
    const hmsPeers = hmsGate.peers || [];
    const hmsListeners = hmsPeers.filter(peer => peer.role?.name !== 'speaker').length;
    const hmsSpeakers = hmsPeers.filter(peer => peer.role?.name === 'speaker').length;
    
    // Use HMS counts if available and > 0, otherwise fallback to DB or participant counts
    const listenerCount = hmsPeers.length > 0 ? hmsListeners : (branding?.listener_count || listenersList.length);
    const speakerCount = hmsPeers.length > 0 ? hmsSpeakers : (branding?.speaker_count || speakersList.length);
    
    return { listenerCount, speakerCount };
  }, [hmsGate.peers, branding?.listener_count, branding?.speaker_count, listenersList.length, speakersList.length]);

  // Branded header component
  const renderBrandedHeader = useCallback(() => {
    if (!branding) {
      // Loading skeleton
      return (
        <View style={styles.headerSkeleton}>
          <View style={styles.skeletonTitle} />
          <View style={styles.skeletonAgency} />
          <View style={styles.skeletonStats} />
        </View>
      );
    }

    const backgroundColor = branding.theme_color || '#262626';
    const title = branding.title || 'Voice Chat';
    const agencyName = branding.agency_name;

    if (branding.banner_url) {
      // Banner image with gradient overlay
      return (
        <View style={styles.brandedHeader}>
          <ImageBackground
            source={{ uri: branding.banner_url }}
            style={styles.headerBackground}
            resizeMode="cover"
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.gradientOverlay}
            />
            <View style={styles.headerContent}>
              <Text style={styles.roomTitle}>{title}</Text>
              {agencyName && (
                <Text style={styles.agencyName}>{agencyName}</Text>
              )}
              <View style={styles.statsRow}>
                <Text style={styles.statsText}>
                  👂 {liveCounts.listenerCount} · 🎙 {liveCounts.speakerCount}
                </Text>
              </View>
            </View>
          </ImageBackground>
        </View>
      );
    } else {
      // Theme color fallback
      return (
        <View style={styles.brandedHeader}>
          <View style={[styles.colorFallback, { backgroundColor }]}>
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.4)']}
              style={styles.gradientOverlay}
            />
            <View style={styles.headerContent}>
              <Text style={styles.roomTitle}>{title}</Text>
              {agencyName && (
                <Text style={styles.agencyName}>{agencyName}</Text>
              )}
              <View style={styles.statsRow}>
                <Text style={styles.statsText}>
                  👂 {liveCounts.listenerCount} · 🎙 {liveCounts.speakerCount}
                </Text>
              </View>
            </View>
          </View>
        </View>
      );
    }
  }, [branding, liveCounts]);

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
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      {/* Branded Header */}
      {renderBrandedHeader()}
      
      {/* Secondary Header with User Info and Roster */}
      <View style={{ 
        paddingHorizontal: 16, 
        paddingTop: 12, 
        paddingBottom: 12,
        backgroundColor: '#0E131A',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
            {displayName} • {isAdmin ? 'Admin' : 'User'}
          </Text>
        </View>
        
        {/* Roster Button */}
        {hmsGate.hms && (
          <Pressable
            onPress={openRoster}
            style={{
              backgroundColor: '#2563EB',
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Users size={16} color="white" />
            <Text style={{ color: 'white', fontWeight: '600', marginLeft: 8 }}>
              Roster
            </Text>
          </Pressable>
        )}
      </View>

      {/* Debug: Show current audio levels */}
      {Object.keys(levels).length > 0 && (
        <View style={{ padding: 8, backgroundColor: 'rgba(255,255,255,0.05)', marginHorizontal: 16, marginTop: 8, borderRadius: 8 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>Audio Levels:</Text>
          {Object.entries(levels).map(([userId, level]) => (
            <Text key={userId} style={{ color: '#9CA3AF', fontSize: 11 }}>
              {userId}: {(Number(level) * 100).toFixed(1)}%
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

// Styles for the branded header
const styles = StyleSheet.create({
  brandedHeader: {
    height: 180,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  headerBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  colorFallback: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-end',
  },
  gradientOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: '70%',
  },
  headerContent: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    zIndex: 2,
  },
  roomTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
    textShadowColor: 'rgba(0,0,0,0.8)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  agencyName: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statsText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.85)',
    fontFamily: 'monospace',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  headerSkeleton: {
    height: 180,
    backgroundColor: '#262626',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  skeletonTitle: {
    height: 24,
    backgroundColor: '#404040',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  skeletonAgency: {
    height: 16,
    backgroundColor: '#404040',
    borderRadius: 4,
    marginBottom: 12,
    width: '50%',
  },
  skeletonStats: {
    height: 14,
    backgroundColor: '#404040',
    borderRadius: 4,
    width: '40%',
  },
});


