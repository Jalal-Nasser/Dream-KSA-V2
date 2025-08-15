import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function AgencyEntry() {
  const r = useRouter();
  const [loading, setLoading] = useState(true);
  const [owns, setOwns] = useState(false);
  const [isHost, setIsHost] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: agencies } = await supabase.from('agencies').select('id').eq('owner_id', user.id);
      setOwns(!!agencies?.length);

      const { data: hosts } = await supabase.from('hosts').select('agency_id').eq('user_id', user.id);
      setIsHost(!!hosts?.length);

      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!loading) {
      if (owns) r.replace('/agency/owner');
      else if (isHost) r.replace('/agency/host');
    }
  }, [loading, owns, isHost]);

  if (loading) return <View style={S.c}><ActivityIndicator /></View>;
  return (
    <View style={S.c}>
      <Text style={S.t}>لا تملك وكالة ولا عضوية مضيف حتى الآن.</Text>
    </View>
  );
}

const S = StyleSheet.create({
  c:{ flex:1, alignItems:'center', justifyContent:'center', padding:24, direction:'rtl' },
  t:{ textAlign:'center', fontSize:16 }
});
