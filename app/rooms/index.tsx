import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function Rooms() {
  const router = useRouter();
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [roomName, setRoomName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [hmsIdOptional, setHmsIdOptional] = useState('');

  async function refresh() {
    setLoading(true);
    setErr(null);
    try {
      const { data, error } = await supabase
        .from('rooms')
        .select('id,name,hms_room_id')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setRooms(data || []);
    } catch (e: any) { setErr(e.message); }
    setLoading(false);
  }

  useEffect(() => { refresh(); }, []);

  async function onLogout() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  async function onCreate() {
    try {
      setErr(null);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.replace('/login');
      if (!roomName.trim()) { setErr('Enter a room name'); return; }
      const payload: any = { name: roomName.trim(), admin_id: user.id, owner_id: user.id };
      if (/^[a-f0-9]{24}$/i.test(hmsIdOptional.trim())) payload.hms_room_id = hmsIdOptional.trim();

      const { data, error } = await supabase
        .from('rooms')
        .insert(payload)
        .select('*')
        .single();
      if (error) throw error;
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const profile = null as any; // TODO: load profile if available
      const display = profile?.display_name || authUser?.email?.split('@')[0] || (displayName || 'Guest');
      console.log('[NAV->VC] push params', { appRoomId: data.id, hmsRoomId: data.hms_room_id, displayName: display });
      router.push({
        pathname: '/voicechat',
        params: {
          appRoomId: data.id,
          hmsRoomId: data.hms_room_id,
          displayName: display,
        }
      });
    } catch (e: any) { setErr(e.message); }
  }

  function navJoin() {
    setErr(null);
    if (!displayName.trim()) { setErr('Enter a display name'); return; }
    const id = joinId.trim();
    if (!id) { setErr('Enter a Room ID'); return; }
    if (/^[a-f0-9]{24}$/i.test(id)) {
      (async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const profile = null as any; // TODO: fetch profile
        const dn = profile?.display_name || authUser?.email?.split('@')[0] || displayName.trim();
        console.log('[NAV->VC] push params', { appRoomId: undefined, hmsRoomId: id, displayName: dn });
        router.push({ pathname: '/voicechat', params: { hmsRoomId: id, displayName: dn } });
      })();
      return;
    }
    if (/^[0-9a-fA-F-]{36}$/.test(id)) {
      (async () => {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        const profile = null as any; // TODO: fetch profile
        const dn = profile?.display_name || authUser?.email?.split('@')[0] || displayName.trim();
        console.log('[NAV->VC] push params', { appRoomId: id, hmsRoomId: undefined, displayName: dn });
        router.push({ pathname: '/voicechat', params: { appRoomId: id, displayName: dn } });
      })();
      return;
    }
    setErr('Invalid Room ID. Use 24-char HMS ID or UUID.');
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 16, backgroundColor: '#f6f7fb' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontWeight: '700' }}>Explore Rooms</Text>
        <Pressable onPress={onLogout} style={{ backgroundColor: '#ef4444', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 }}>
          <Text style={{ color: '#fff', fontWeight: '600' }}>Logout</Text>
        </Pressable>
      </View>

      {err && <Text style={{ color: '#ef4444' }}>[rooms] {err}</Text>}

      <Pressable onPress={refresh} style={{ alignSelf: 'flex-start', borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 }}>
        <Text>Refresh</Text>
      </Pressable>

      <View style={{ gap: 8, padding: 12, backgroundColor: '#fff', borderRadius: 12 }}>
        <Text style={{ fontWeight: '700' }}>Create a Room</Text>
        <TextInput value={roomName} onChangeText={setRoomName} placeholder="Room name" style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 }} />
        <TextInput
          value={hmsIdOptional}
          onChangeText={setHmsIdOptional}
          placeholder="HMS Room ID (24-char, optional)"
          autoCapitalize="none"
          style={{ backgroundColor:'#f3f4f6', padding:12, borderRadius:8 }}
        />
        <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Your display name (optional)" style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 }} />
        <Pressable onPress={onCreate} style={{ backgroundColor: '#6366f1', padding: 12, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Create</Text>
        </Pressable>
      </View>

      <View style={{ gap: 8, padding: 12, backgroundColor: '#fff', borderRadius: 12 }}>
        <Text style={{ fontWeight: '700' }}>Join a Room</Text>
        <TextInput value={joinId} onChangeText={setJoinId} placeholder="Paste 24-char HMS ID or Room UUID" autoCapitalize="none" style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 }} />
        <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Your display name" style={{ backgroundColor: '#f3f4f6', padding: 12, borderRadius: 8 }} />
        <Pressable onPress={navJoin} style={{ backgroundColor: '#3b82f6', padding: 12, borderRadius: 8, alignItems: 'center' }}>
          <Text style={{ color: '#fff', fontWeight: '700' }}>Join</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, marginTop: 4 }}>
        {loading ? <ActivityIndicator /> :
          rooms.length === 0 ? (
            <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 24 }}>Voice chat rooms will appear here.</Text>
          ) : rooms.map((r) => (
            <Pressable key={r.id} onPress={async () => {
              const { data: { user: authUser } } = await supabase.auth.getUser();
              const profile = null as any; // TODO: load profile if available
              const display = profile?.display_name || authUser?.email?.split('@')[0] || 'Guest';
              
              // Guard: ensure we have required fields
              if (!r?.id) {
                console.log('[NAV->VC] missing appRoomId for room row', r);
                return;
              }
              
              console.log('[NAV->VC] push params', { appRoomId: r.id, hmsRoomId: r.hms_room_id, displayName: display });
              router.push({
                pathname: '/voicechat',
                params: {
                  appRoomId: r.id,
                  hmsRoomId: r.hms_room_id,
                  displayName: display,
                }
              });
            }} style={{ padding: 12, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8 }}>
              <Text style={{ fontWeight: '600' }}>{r.name || 'Room'}</Text>
              <Text style={{ color: '#6b7280', fontSize: 12 }}>{r.id}</Text>
            </Pressable>
          ))
        }
      </View>
    </View>
  );
}
