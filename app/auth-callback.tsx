import * as React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSupabase } from '../lib/supabase';

export default function AuthCallback() {
  const { code, error_description } = useLocalSearchParams<{ code?: string; error_description?: string }>();
  const supabase = getSupabase();
  const router = useRouter();

  React.useEffect(() => {
    (async () => {
      if (typeof code === 'string' && code.length > 0) {
        const { error } = await supabase.auth.exchangeCodeForSession({ code });
        if (!error) router.replace('/(tabs)/rooms');
      }
    })();
  }, [code]);

  return (
    <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}>
      <ActivityIndicator />
      {error_description ? <Text style={{ marginTop:8 }}>{String(error_description)}</Text> : null}
    </View>
  );
}
