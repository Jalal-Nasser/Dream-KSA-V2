import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';
import { router } from 'expo-router';

type Agency = { id: string; name: string; description: string | null };

export default function AgenciesScreen() {
  const [items, setItems] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      const user = auth?.user;
      if (!user) {
        setItems([]);
        setLoading(false);
        return;
      }

      const owned = await supabase
        .from('agencies')
        .select('id, name, description')
        .eq('owner_id', user.id);

      const memberAgencies = await supabase
        .from('agency_members')
        .select('agency:agency_id ( id, name, description )')
        .eq('user_id', user.id);

      const list: Agency[] = [
        ...(owned.data ?? []),
        ...((memberAgencies.data ?? []).map((r: any) => r.agency) as Agency[]),
      ]
        .filter(Boolean)
        .reduce((acc: Agency[], a) => (acc.find(x => x.id === a.id) ? acc : acc.concat(a)), []);

      setItems(list);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={{ padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: '600', marginBottom: 12 }}>My Agencies</Text>
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: '#ddd' }} />}
        renderItem={({ item }) => (
          <Pressable
            style={{ paddingVertical: 12 }}
            onPress={() => router.push({ pathname: '/agency-manage', params: { id: item.id } })}
          >
            <Text style={{ fontWeight: '600' }}>{item.name}</Text>
            {item.description ? <Text>{item.description}</Text> : null}
            <Text style={{ color: '#555', marginTop: 6 }}>Tap to manage members & invites →</Text>
          </Pressable>
        )}
        ListEmptyComponent={<Text>No agencies yet.</Text>}
      />
    </View>
  );
}