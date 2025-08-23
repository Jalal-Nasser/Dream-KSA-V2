import React from 'react';
import { View, Text } from 'react-native';
import { supabase } from '@/lib/supabase';

export default function UserName({ userId, fallback }: { userId: string; fallback?: string }) {
  const [name, setName] = React.useState<string | null>(fallback || null);
  const [vip, setVip] = React.useState<number>(0);

  React.useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('users')
        .select('name, username, vip_level')
        .eq('id', userId)
        .maybeSingle();
      setName(data?.name || data?.username || fallback || userId);
      setVip(Number(data?.vip_level || 0));
    })();
  }, [userId]);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
      <Text style={{ color: 'white', fontWeight: '600' }}>{name}</Text>
      {vip > 0 && (
        <View style={{ marginLeft: 6, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, backgroundColor: '#f59e0b' }}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: '700' }}>VIP{vip}</Text>
        </View>
      )}
    </View>
  );
}


