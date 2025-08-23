import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, RefreshControl } from 'react-native';
import { useLocalSearchParams, Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { listRoomsWithHostVip, getRoomLiveCounts, type Room } from '@/src/db/rooms';
import { Screen, Card } from '@/src/ui/primitives';
import VipBadge from '@/src/components/VipBadge';

type RoomWithCounts = Room & { speakers: number; listeners: number; score: number };

export default function AgencyExplore() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id!;
  const [agency, setAgency] = useState<any>(null);
  const [rows, setRows] = useState<RoomWithCounts[]>([]);
  const [vipByOwner, setVipByOwner] = useState<Record<string, any>>({});
  const [agencies, setAgencies] = useState<Record<string, any>>({});
  const [refreshing, setRefreshing] = useState(false);

  const primary = agency?.theme_color || '#6C5CE7';

  async function load() {
    const { rooms, vipByOwner, agencies } = await listRoomsWithHostVip({ agencyId, limit: 50 });
    const counts = await Promise.all(rooms.map((r) => getRoomLiveCounts(r.id)));
    const merged: RoomWithCounts[] = rooms.map((r, i) => {
      const { speakers, listeners } = counts[i];
      const score = speakers * 3 + listeners;
      return { ...r, speakers, listeners, score };
    });
    merged.sort((a, b) => {
      if ((b as any).featured !== (a as any).featured) return ((b as any).featured ? 1 : 0) - ((a as any).featured ? 1 : 0);
      return b.score - a.score;
    });
    setRows(merged);
    setVipByOwner(vipByOwner);
    setAgencies(agencies);
  }

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('agencies').select('*').eq('id', agencyId).maybeSingle();
      setAgency(data);
      await load();
    })();
  }, [agencyId]);

  useEffect(() => {
    const channel = supabase
      .channel(`agency_rooms_live_${agencyId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'room_participants' }, () => load())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, (payload) => {
        console.log("[ROOMS_UPDATE]", payload.eventType, payload.new?.id);
        load();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [agencyId]);

  return (
    <Screen>
      <Text style={{ color: 'white', fontSize: 20, fontWeight: '800' }}>{agency?.name || 'Agency'} — Explore</Text>
      {agency?.welcome_text ? <Text style={{ color: '#9BA7B4', marginTop: 4 }}>{agency.welcome_text}</Text> : null}

      <FlatList
        style={{ marginTop: 12 }}
        data={rows}
        keyExtractor={(i) => i.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false); }} />}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item, index }) => (
          <Card>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                                 <Text style={{ color: 'white', fontWeight: '800', fontSize: 16 }}>
                  {index < 3 ? ['🥇', '🥈', '🥉'][index] + ' ' : ''}
                  {item.name}
                  {(item as any).featured ? <Text style={{ color: '#f59e0b' }}> ★</Text> : null}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  {(item as any).featured && (
                    <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: "#22c55e" }}>
                      <Text style={{ color: "white", fontSize: 10, fontWeight: "600" }}>⭐</Text>
                    </View>
                  )}
                  {vipByOwner[item.owner_id]?.vip_name && (
                    <VipBadge
                      name={vipByOwner[item.owner_id]?.vip_name}
                      color={vipByOwner[item.owner_id]?.badge_color}
                    />
                  )}
                </View>
              </View>
              <Text style={{ color: '#9BA7B4' }}>Score {item.score}</Text>
            </View>
            <View style={{ height: 6 }} />
            <Text style={{ color: '#9BA7B4' }}>Live: {item.speakers} speaking • {item.listeners} listening</Text>
            {item.agency_id && agencies[item.agency_id]?.featured_banner && (
              <View style={{ marginTop: 6 }}>
                <Text style={{ color: '#9BA7B4', fontStyle: 'italic', fontSize: 12 }}>
                  {agencies[item.agency_id].featured_banner}
                </Text>
              </View>
            )}
            <View style={{ height: 10 }} />
            <Link href={{ pathname: '/voicechat', params: { appRoomId: item.id, hmsRoomId: item.id } }} asChild>
              <Pressable>
                <Text style={{ color: primary, fontWeight: '700' }}>Join →</Text>
              </Pressable>
            </Link>
          </Card>
        )}
      />
    </Screen>
  );
}



