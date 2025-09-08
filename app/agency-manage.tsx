import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Pressable, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { supabase } from '../lib/supabase';

type MemberRow = { id: string; user_id: string; role?: string | null };
type InviteRow = { id: string; invited_email?: string | null; status?: string | null; created_at?: string | null };

export default function AgencyManageScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const agencyId = useMemo(() => (typeof id === 'string' ? id : ''), [id]);

  const [me, setMe] = useState<{ id: string; email?: string | null } | null>(null);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  const [members, setMembers] = useState<MemberRow[]>([]);
  const [invites, setInvites] = useState<InviteRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<'members' | 'invites'>('members');
  const [inviteEmail, setInviteEmail] = useState('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const u = data?.user ?? null;
      setMe(u ? { id: u.id, email: u.email } : null);
    })();
  }, []);

  useEffect(() => {
    if (!agencyId) return;
    (async () => {
      setLoading(true);
      try {
        // determine ownership
        const { data: ag } = await supabase
          .from('agencies')
          .select('owner_id')
          .eq('id', agencyId)
          .maybeSingle();
        setIsOwner(!!ag && me?.id ? ag.owner_id === me.id : false);

        // members (RLS: owner sees all, member sees themselves)
        const mem = await supabase
          .from('agency_members')
          .select('id, user_id, role')
          .eq('agency_id', agencyId);
        setMembers(mem.data ?? []);

        // invites (RLS: owner sees all; invited user sees theirs)
        const inv = await supabase
          .from('agency_invites')
          .select('id, invited_email, status, created_at')
          .eq('agency_id', agencyId)
          .order('created_at', { ascending: false });
        setInvites(inv.data ?? []);
      } finally {
        setLoading(false);
      }
    })();
  }, [agencyId, me?.id]);

  if (!agencyId) {
    return (
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 18, fontWeight: '600' }}>No agency selected</Text>
        <Text>Open an agency from the /agencies screen.</Text>
      </View>
    );
  }

  async function refresh() {
    const mem = await supabase
      .from('agency_members')
      .select('id, user_id, role')
      .eq('agency_id', agencyId);
    setMembers(mem.data ?? []);

    const inv = await supabase
      .from('agency_invites')
      .select('id, invited_email, status, created_at')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    setInvites(inv.data ?? []);
  }

  // --- Members actions ---
  async function onRemoveMember(row: MemberRow) {
    try {
      const { error } = await supabase
        .from('agency_members')
        .delete()
        .eq('agency_id', agencyId)
        .eq('user_id', row.user_id);
      if (error) throw error;
      await refresh();
    } catch (e: any) {
      Alert.alert('Remove failed', e.message ?? String(e));
    }
  }

  async function onLeaveAgency() {
    if (!me) return;
    try {
      const { error } = await supabase
        .from('agency_members')
        .delete()
        .eq('agency_id', agencyId)
        .eq('user_id', me.id);
      if (error) throw error;
      await refresh();
    } catch (e: any) {
      Alert.alert('Leave failed', e.message ?? String(e));
    }
  }

  // --- Invites actions ---
  async function onCreateInvite() {
    if (!inviteEmail.trim()) {
      Alert.alert('Email required');
      return;
    }
    try {
      const { error } = await supabase
        .from('agency_invites')
        .insert([{ agency_id: agencyId, invited_email: inviteEmail.trim().toLowerCase() }]);
      if (error) throw error;
      setInviteEmail('');
      await refresh();
    } catch (e: any) {
      Alert.alert('Invite failed', e.message ?? String(e));
    }
  }

  async function onAcceptInvite(inv: InviteRow) {
    try {
      // Prefer RPC if it exists (does status update + membership insert server-side)
      const rpc = await supabase.rpc('accept_agency_invite', { invite_id: inv.id });
      if (rpc.error && rpc.error.code === 'PGRST202') {
        // No RPC → fall back to status update only (assumes trigger or later approval)
        const { error } = await supabase
          .from('agency_invites')
          .update({ status: 'accepted' })
          .eq('id', inv.id);
        if (error) throw error;
      } else if (rpc.error) {
        throw rpc.error;
      }
      await refresh();
    } catch (e: any) {
      Alert.alert('Accept failed', e.message ?? String(e));
    }
  }

  async function onRejectInvite(inv: InviteRow) {
    try {
      const { error } = await supabase
        .from('agency_invites')
        .update({ status: 'rejected' })
        .eq('id', inv.id);
      if (error) throw error;
      await refresh();
    } catch (e: any) {
      Alert.alert('Reject failed', e.message ?? String(e));
    }
  }

  async function onRevokeInvite(inv: InviteRow) {
    try {
      const { error } = await supabase
        .from('agency_invites')
        .delete()
        .eq('id', inv.id);
      if (error) throw error;
      await refresh();
    } catch (e: any) {
      Alert.alert('Revoke failed', e.message ?? String(e));
    }
  }

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 20, fontWeight: '700' }}>Manage Agency</Text>

      {/* Tabs */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Pressable onPress={() => setTab('members')} style={{ padding: 8, backgroundColor: tab === 'members' ? '#eee' : '#fafafa', borderRadius: 8 }}>
          <Text>Members</Text>
        </Pressable>
        <Pressable onPress={() => setTab('invites')} style={{ padding: 8, backgroundColor: tab === 'invites' ? '#eee' : '#fafafa', borderRadius: 8 }}>
          <Text>Invites</Text>
        </Pressable>
      </View>

      {tab === 'members' ? (
        <View style={{ gap: 12 }}>
          <FlatList
            data={members}
            keyExtractor={(x) => x.id}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ddd' }} />}
            renderItem={({ item }) => {
              const canRemove = isOwner || item.user_id === me?.id;
              return (
                <View style={{ paddingVertical: 10 }}>
                  <Text style={{ fontWeight: '600' }}>{item.user_id}</Text>
                  <Text>role: {item.role ?? 'member'}</Text>
                  {canRemove ? (
                    <View style={{ marginTop: 6 }}>
                      <Button title={item.user_id === me?.id ? 'Leave' : 'Remove'} onPress={() => onRemoveMember(item)} />
                    </View>
                  ) : null}
                </View>
              );
            }}
            ListEmptyComponent={<Text>No visible members.</Text>}
          />
          {me && !isOwner ? (
            <Button title="Leave agency" onPress={onLeaveAgency} />
          ) : null}
        </View>
      ) : (
        <View style={{ gap: 12 }}>
          {isOwner ? (
            <View style={{ gap: 8 }}>
              <Text style={{ fontWeight: '600' }}>Invite by email</Text>
              <TextInput
                placeholder="user@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={inviteEmail}
                onChangeText={setInviteEmail}
                style={{ borderWidth: 1, padding: 10, borderRadius: 8 }}
              />
              <Button title="Send Invite" onPress={onCreateInvite} />
            </View>
          ) : null}

          <FlatList
            data={invites}
            keyExtractor={(x) => x.id}
            ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ddd' }} />}
            renderItem={({ item }) => {
              const mine = me?.email && item.invited_email?.toLowerCase() === me.email.toLowerCase();
              return (
                <View style={{ paddingVertical: 10 }}>
                  <Text style={{ fontWeight: '600' }}>{item.invited_email ?? '(unknown)'}</Text>
                  <Text>status: {item.status ?? 'pending'}</Text>
                  <Text>created: {item.created_at ? new Date(item.created_at).toLocaleString() : ''}</Text>

                  <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                    {mine && item.status !== 'accepted' && item.status !== 'rejected' ? (
                      <>
                        <Button title="Accept" onPress={() => onAcceptInvite(item)} />
                        <Button title="Reject" onPress={() => onRejectInvite(item)} />
                      </>
                    ) : null}
                    {isOwner ? <Button title="Revoke" onPress={() => onRevokeInvite(item)} /> : null}
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={<Text>No invites.</Text>}
          />
        </View>
      )}
    </View>
  );
}
