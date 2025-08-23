import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, FlatList, Pressable, TextInput, Alert } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { getAgency, getRoster, upsertMember, updateMemberRole, removeMember, type AgencyRole } from '@/src/db/agency';
import { supabase } from '@/lib/supabase';
import { listVipLevels, assignVip } from '@/src/db/vip';
import { Link } from 'expo-router';
import * as Linking from 'expo-linking';
import { createInvite } from '@/src/db/invites';

export default function AgencyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const agencyId = id!;
  const [agency, setAgency] = useState<any>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [meId, setMeId] = useState<string>('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [vipLevels, setVipLevels] = useState<any[]>([]);

  const isOwner = useMemo(() => agency?.owner_id === meId, [agency, meId]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMeId(data.user?.id || ''));
    (async () => {
      const [{ data: a }, { data: r }, { data: levels }] = await Promise.all([
        getAgency(agencyId),
        getRoster(agencyId),
        listVipLevels(),
      ]);
      setAgency(a);
      setRoster(r || []);
      setVipLevels(levels || []);
    })();
  }, [agencyId]);

  async function reloadRoster() {
    const { data } = await getRoster(agencyId);
    setRoster(data || []);
  }

  async function onInvite() {
    if (!inviteUserId.trim()) return;
    const { error } = await upsertMember(agencyId, inviteUserId.trim(), 'member');
    if (error) return Alert.alert('Invite failed', error.message);
    setInviteUserId('');
    reloadRoster();
  }

  async function setRole(user_id: string, role: AgencyRole) {
    const { error } = await updateMemberRole(agencyId, user_id, role);
    if (error) return Alert.alert('Update failed', error.message);
    reloadRoster();
  }

  async function kick(user_id: string) {
    const { error } = await removeMember(agencyId, user_id);
    if (error) return Alert.alert('Remove failed', error.message);
    reloadRoster();
  }

  async function setVip(user_id: string, vip_level_id: string | null) {
    const { data: me } = await supabase.auth.getUser();
    const { error } = await assignVip(user_id, vip_level_id, me.user?.id);
    if (error) return Alert.alert('VIP failed', error.message);
    Alert.alert('VIP updated');
  }

  return (
    <View style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '800' }}>{agency?.name || 'Agency'}</Text>
      <Text style={{ color: '#64748b' }}>Owner: {agency?.owner_id}</Text>
      <Link href={`/agency/${agencyId}/explore`} style={{ color: '#6C5CE7', marginTop: 6 }}>
        Explore this agency →
      </Link>
      <Link href={`/agency/${agencyId}/dashboard`} style={{ color: '#6C5CE7', marginTop: 6 }}>Dashboard →</Link>
      <Link href={`/agency/${agencyId}/customize`} style={{ color: '#6C5CE7', marginTop: 6 }}>Customize →</Link>
      {isOwner && (
        <Link href={`/agency/${agencyId}/settings`} style={{ color: '#6C5CE7', marginTop: 6 }}>
          Settings →
        </Link>
      )}
      <Link href={`/agency/${agencyId}/roles`} style={{ color: '#6C5CE7', marginTop: 6 }}>Roles →</Link>
      <Link href={`/agency/${agencyId}/vip`} style={{ color: '#6C5CE7', marginTop: 6 }}>VIP Manager →</Link>

      <Text style={{ marginTop: 8, fontWeight: '700' }}>Invite member by user_id</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <TextInput
          value={inviteUserId}
          onChangeText={setInviteUserId}
          placeholder='auth.users.id'
          style={{ flex: 1, borderWidth: 1, borderColor: '#e5e7eb', padding: 10, borderRadius: 12 }}
        />
        <Pressable onPress={onInvite} style={{ paddingHorizontal: 14, justifyContent: 'center', backgroundColor: '#0ea5e9', borderRadius: 12 }}>
          <Text style={{ color: 'white', fontWeight: '700' }}>Invite</Text>
        </Pressable>
      </View>

      <Text style={{ marginTop: 8, fontWeight: '700' }}>Roster</Text>
      <FlatList
        data={roster}
        keyExtractor={(i) => i.user_id}
        ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        renderItem={({ item }) => {
          const you = item.user_id === meId;
          return (
            <View style={{ padding: 12, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 12, gap: 8 }}>
              <Text style={{ fontWeight: '700' }}>
                {item.user_id} {you ? '(you)' : ''}
              </Text>
              <Text style={{ color: '#64748b' }}>Role: {item.role}</Text>
              <Text style={{ color: '#64748b' }}>VIP: {item.vip_name || 'None'}</Text>
              
              {isOwner && !you && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Pressable
                    onPress={() => setRole(item.user_id, item.role === 'owner' ? 'member' : 'owner')}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f59e0b', borderRadius: 8 }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600' }}>
                      {item.role === 'owner' ? 'Demote' : 'Promote'}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => kick(item.user_id)}
                    style={{ paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#ef4444', borderRadius: 8 }}
                  >
                    <Text style={{ color: 'white', fontWeight: '600' }}>Remove</Text>
                  </Pressable>
                </View>
              )}
              
              {isOwner && (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Text style={{ color: '#64748b' }}>Set VIP:</Text>
                  <Pressable
                    onPress={() => setVip(item.user_id, null)}
                    style={{ paddingHorizontal: 8, paddingVertical: 4, backgroundColor: '#6b7280', borderRadius: 6 }}
                  >
                    <Text style={{ color: 'white', fontSize: 12 }}>None</Text>
                  </Pressable>
                  {vipLevels.map((level) => (
                    <Pressable
                      key={level.id}
                      onPress={() => setVip(item.user_id, level.id)}
                      style={{ 
                        paddingHorizontal: 8, 
                        paddingVertical: 4, 
                        backgroundColor: item.vip_level_id === level.id ? '#22c55e' : '#6b7280', 
                        borderRadius: 6 
                      }}
                    >
                      <Text style={{ color: 'white', fontSize: 12 }}>{level.name}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
          );
        }}
      />

      {/* DEV-only QA Buttons */}
      {__DEV__ ? (
        <View style={{ marginTop: 12, gap: 8 }}>
          <Pressable
            onPress={() => Linking.openURL(`exp+dream-ksa://dev/qa-featured?agencyId=${agencyId}`)}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#334155' }}
          >
            <Text style={{ color: '#E6EDF3', fontWeight: '800' }}>🔧 QA: Featured Rooms</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL(`exp+dream-ksa://dev/qa-agency-rls?agencyId=${agencyId}`)}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#334155' }}
          >
            <Text style={{ color: '#E6EDF3', fontWeight: '800' }}>🔧 QA: Agency RLS</Text>
          </Pressable>
          <Pressable
            onPress={async () => {
              try {
                const code = await createInvite(agencyId, "member");
                const url = Linking.createURL("invite", { queryParams: { code } });
                Linking.openURL(url);
              } catch (e: any) {
                Alert.alert("Failed", e?.message || "Not allowed");
              }
            }}
            style={{ alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#475569' }}
          >
            <Text style={{ color: '#E6EDF3', fontWeight: '800' }}>🔧 Test Invite (DEV)</Text>
          </Pressable>
        </View>
      ) : null}
    </View>
  );
}
