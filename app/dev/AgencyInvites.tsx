import { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, Alert, FlatList } from 'react-native';
import { supabase } from '../../lib/supabase';

type Invite = {
  id: string;
  agency_id: string;
  invited_email: string | null;
  status: 'pending'|'accepted'|'rejected'|'revoked';
  created_at: string;
};

export default function AgencyInvitesScreen() {
  const [agencyId, setAgencyId] = useState('');
  const [email, setEmail] = useState('');
  const [me, setMe] = useState<string | null>(null);
  const [pending, setPending] = useState<Invite[]>([]);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setMe(data.user?.id ?? null));
  }, []);

  async function refresh() {
    const { data, error } = await supabase
      .from('agency_invites')
      .select('id, agency_id, invited_email, status, created_at')
      .eq('status', 'pending');
    if (error) Alert.alert('Error', error.message);
    else setPending((data as Invite[]) ?? []);
  }

  useEffect(() => {
    refresh();
  }, [me]);

  async function sendInvite() {
    if (!agencyId || !email) return Alert.alert('Missing', 'Agency ID and email required.');
    const { data, error } = await supabase.rpc('invite_agency_member', { p_agency_id: agencyId, p_email: email });
    if (error) Alert.alert('Invite error', error.message);
    else {
      Alert.alert('Invite sent', String(data));
      setEmail('');
      refresh();
    }
  }

  async function accept(inviteId: string) {
    const { error } = await supabase.rpc('accept_agency_invite', { p_invite_id: inviteId });
    if (error) Alert.alert('Accept error', error.message);
    else refresh();
  }

  async function reject(inviteId: string) {
    const { error } = await supabase.rpc('reject_agency_invite', { p_invite_id: inviteId });
    if (error) Alert.alert('Reject error', error.message);
    else refresh();
  }

  return (
    <View style={{ padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>Agency Invites (dev)</Text>
      <Text>User: {me ?? '—'}</Text>

      <Text>Agency ID</Text>
      <TextInput value={agencyId} onChangeText={setAgencyId} placeholder="uuid…" style={{ borderWidth: 1, padding: 8 }} />

      <Text>Invite by Email</Text>
      <TextInput value={email} onChangeText={setEmail} placeholder="user@example.com" autoCapitalize="none" style={{ borderWidth: 1, padding: 8 }} />
      <Button title="Send Invite" onPress={sendInvite} />

      <View style={{ height: 16 }} />
      <Text style={{ fontSize: 16, fontWeight: '600' }}>My pending invites</Text>
      <Button title="Refresh" onPress={refresh} />

      <FlatList
        data={pending}
        keyExtractor={(i) => i.id}
        renderItem={({ item }) => (
          <View style={{ borderWidth: 1, padding: 12, marginVertical: 6 }}>
            <Text>Invite: {item.id}</Text>
            <Text>Agency: {item.agency_id}</Text>
            <Text>Email: {item.invited_email}</Text>
            <Text>Status: {item.status}</Text>
            <View style={{ height: 8 }} />
            <Button title="Accept" onPress={() => accept(item.id)} />
            <View style={{ height: 4 }} />
            <Button title="Reject" onPress={() => reject(item.id)} />
          </View>
        )}
      />
    </View>
  );
}


