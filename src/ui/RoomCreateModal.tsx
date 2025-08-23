import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, FlatList, Image, Alert, Switch } from 'react-native';
import { listMyAgencies, getAgencyById, type AgencyLite } from '@/src/db/agencyPicker';
import { createRoom } from '@/src/db/rooms';
import { useCanFeatureRoom } from '@/src/hooks/useCanFeatureRoom';
import { supabase } from '@/lib/supabase';

export function RoomCreateModal({
  visible,
  onClose,
  onCreated,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated: (roomId: string) => void;
}) {
  const [agencies, setAgencies] = useState<AgencyLite[]>([]);
  const [selected, setSelected] = useState<AgencyLite | null>(null);
  const [roomName, setRoomName] = useState('');
  const [topic, setTopic] = useState('');
  const [startAsFeatured, setStartAsFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [myId, setMyId] = useState<string | null>(null);

  useEffect(() => {
    if (!visible) return;
    (async () => {
      const rows = await listMyAgencies();
      setAgencies(rows);
      if (rows.length > 0 && !selected) setSelected(rows[0]);
      
      // Get current user ID for permission check
      const { data: { user } } = await supabase.auth.getUser();
      setMyId(user?.id || null);
    })();
  }, [visible]);

  async function selectAgency(id: string) {
    const a = await getAgencyById(id);
    setSelected(a);
  }

  async function submit() {
    if (!roomName.trim()) return Alert.alert('Room name required');
    setBusy(true);
    try {
      const room = await createRoom({
        name: roomName.trim(),
        topic: topic.trim() || undefined,
        agency_id: selected?.id ?? null,
        mic_policy: selected?.default_mic_policy ?? undefined,
        featured: startAsFeatured,
      });
      onClose();
      onCreated(room.id);
      setRoomName('');
      setTopic('');
      setStartAsFeatured(false);
    } catch (e: any) {
      Alert.alert('Create failed', e?.message || 'Unknown error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: '#0B0F14', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
          <Text style={{ color: 'white', fontSize: 18, fontWeight: '800' }}>Create Room</Text>

          <Text style={{ color: '#9BA7B4', marginTop: 10 }}>Agency</Text>
          <FlatList
            data={agencies}
            horizontal
            keyExtractor={(i) => i.id}
            contentContainerStyle={{ gap: 10, paddingVertical: 8 }}
            renderItem={({ item }) => {
              const picked = selected?.id === item.id;
              return (
                <Pressable
                  onPress={() => selectAgency(item.id)}
                  style={{
                    padding: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: picked ? item.theme_color || '#6C5CE7' : '#1f2937',
                    backgroundColor: picked ? 'rgba(108,92,231,0.15)' : 'transparent',
                    minWidth: 120,
                    alignItems: 'center',
                  }}
                >
                  {item.icon_url ? (
                    <Image source={{ uri: item.icon_url }} style={{ width: 36, height: 36, borderRadius: 8, marginBottom: 6 }} />
                  ) : (
                    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#1f2937', marginBottom: 6 }} />
                  )}
                  <Text style={{ color: 'white', fontWeight: '700' }} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={{ color: '#9BA7B4', fontSize: 12 }}>
                    {item.default_mic_policy === 'free' ? 'Free mic' : 'Queue'}
                  </Text>
                </Pressable>
              );
            }}
          />

          <Text style={{ color: '#9BA7B4', marginTop: 8 }}>Room name</Text>
          <TextInput
            value={roomName}
            onChangeText={setRoomName}
            placeholder="e.g., VIP Lounge"
            placeholderTextColor="#6b7280"
            style={{ color: 'white', borderWidth: 1, borderColor: '#1f2937', borderRadius: 12, padding: 10, marginTop: 6 }}
          />
          <Text style={{ color: '#9BA7B4', marginTop: 8 }}>Topic (optional)</Text>
          <TextInput
            value={topic}
            onChangeText={setTopic}
            placeholder="What’s happening?"
            placeholderTextColor="#6b7280"
            style={{ color: 'white', borderWidth: 1, borderColor: '#1f2937', borderRadius: 12, padding: 10, marginTop: 6 }}
          />

          {/* Featured toggle - only show if user can feature */}
          {selected && myId && (() => {
            const canFeatureNew = useCanFeatureRoom({ id: "new", owner_id: myId, agency_id: selected.id });
            return canFeatureNew ? (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
                <Text style={{ color: '#9BA7B4' }}>Start as Featured</Text>
                <Switch
                  value={startAsFeatured}
                  onValueChange={setStartAsFeatured}
                  trackColor={{ false: '#1f2937', true: selected?.theme_color || '#6C5CE7' }}
                  thumbColor={startAsFeatured ? 'white' : '#9CA3AF'}
                />
              </View>
            ) : null;
          })()}

          <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
            <Pressable onPress={onClose} disabled={busy} style={{ flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#1f2937' }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} disabled={busy} style={{ flex: 1, padding: 12, borderRadius: 12, backgroundColor: selected?.theme_color || '#6C5CE7' }}>
              <Text style={{ color: 'white', textAlign: 'center', fontWeight: '700' }}>{busy ? 'Creating…' : 'Create'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}




