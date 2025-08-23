import React, { useEffect, useState } from 'react';
import { Screen, Title, Subtle, Card, Button } from '@/src/ui/atoms';
import { View, Text, FlatList, Pressable } from 'react-native';
import { Link, router } from 'expo-router';
import * as Linking from 'expo-linking';
import { listFeaturedWithHostVip } from '@/src/db/rooms';
import { pickAnyAgencyId } from '@/src/dev/agencyPick';
import { supabase } from '@/lib/supabase';
import VipBadge from '@/src/components/VipBadge';

export default function Home() {
  const [featured, setFeatured] = useState<any[]>([]);
  const [vipByOwner, setVipByOwner] = useState<Record<string, any>>({});
  const [qaAgencyId, setQaAgencyId] = useState<string | null>(null);

  async function loadFeatured() {
    try {
      const { rooms, vipByOwner } = await listFeaturedWithHostVip(10);
      setFeatured(rooms);
      setVipByOwner(vipByOwner);
    } catch (e) {
      console.error('Failed to load featured rooms:', e);
    }
  }

  useEffect(() => {
    loadFeatured();
  }, []);

  // Load QA agency ID for DEV builds
  useEffect(() => {
    if (!__DEV__) return;
    (async () => setQaAgencyId(await pickAnyAgencyId()))();
  }, []);

  // Realtime subscription for featured updates
  useEffect(() => {
    const channel = supabase
      .channel('home_featured')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'rooms' }, async (payload) => {
        console.log("[HOME_FEATURED_UPDATE]", payload.eventType, payload.new?.id);
        await loadFeatured();
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <Screen>
      <Title>Welcome</Title>
      <Subtle>Discover rooms and agencies.</Subtle>
      
      {/* Featured Rooms Carousel */}
      {featured.length > 0 ? (
        <>
          <View style={{ height: 16 }} />
          <Text style={{ color: 'white', fontWeight: '800', fontSize: 18 }}>Featured</Text>
          <View style={{ height: 8 }} />
          <FlatList
            horizontal
            data={featured}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 16 }}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => router.push({ 
                  pathname: '/voicechat', 
                  params: { appRoomId: item.id, hmsRoomId: item.id }
                })}
                style={{ 
                  width: 220, 
                  height: 120, 
                  borderRadius: 16, 
                  backgroundColor: 'rgba(255,255,255,0.06)', 
                  padding: 12,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.1)'
                }}
              >
                <Text style={{ color: 'white', fontWeight: '800' }} numberOfLines={1}>
                  {item.name}{item.featured ? ' ★' : ''}
                </Text>
                {vipByOwner[item.owner_id]?.vip_name && (
                  <VipBadge
                    name={vipByOwner[item.owner_id]?.vip_name}
                    color={vipByOwner[item.owner_id]?.badge_color}
                  />
                )}
                <Text style={{ color: '#9BA7B4', fontSize: 12, marginTop: 8 }}>
                  Tap to join →
                </Text>
              </Pressable>
            )}
          />
        </>
      ) : (
        <View style={{ height: 16 }} />
      )}

      <View style={{ height: 16 }} />
      <Card>
        <Text style={{ color: 'white', fontWeight: '700' }}>Quick actions</Text>
        <View style={{ height: 8 }} />
        <Link href="/rooms"><Text style={{ color: '#6C5CE7' }}>Browse Rooms →</Text></Link>
      </Card>

                    {/* DEV-only QA Buttons */}
              {__DEV__ && qaAgencyId ? (
                <View style={{ marginTop: 16, gap: 8 }}>
                  <Pressable
                    onPress={() => Linking.openURL(`exp+dream-ksa://dev/qa-featured?agencyId=${qaAgencyId}`)}
                    style={{ 
                      alignSelf: "flex-start", 
                      paddingHorizontal: 12, 
                      paddingVertical: 8, 
                      borderRadius: 10, 
                      backgroundColor: "#334155",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)"
                    }}
                  >
                    <Text style={{ color: "#E6EDF3", fontWeight: "800" }}>🔧 QA Featured</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => Linking.openURL(`exp+dream-ksa://dev/qa-agency-rls?agencyId=${qaAgencyId}`)}
                    style={{ 
                      alignSelf: "flex-start", 
                      paddingHorizontal: 12, 
                      paddingVertical: 8, 
                      borderRadius: 10, 
                      backgroundColor: "#475569",
                      borderWidth: 1,
                      borderColor: "rgba(255,255,255,0.1)"
                    }}
                  >
                    <Text style={{ color: "#E6EDF3", fontWeight: "800" }}>🔒 QA Agency RLS</Text>
                  </Pressable>
                </View>
              ) : null}
    </Screen>
  );
}
