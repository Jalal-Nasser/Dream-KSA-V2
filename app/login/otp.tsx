import * as React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { getSupabase } from '../../lib/supabase';
import { PALETTE } from '../../lib/theme';

export default function OTP() {
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const supabase = getSupabase();
  const router = useRouter();
  const [code, setCode] = React.useState('');
  const [err, setErr] = React.useState<string | null>(null);
  const [verifying, setVerifying] = React.useState(false);

  const verify = async () => {
    setErr(null);
    if (!/^\d{4,8}$/.test(code.trim())) return setErr('رمز التحقق غير صحيح');
    setVerifying(true);
    const { data, error } = await supabase.auth.verifyOtp({ phone: String(phone), token: code.trim(), type: 'sms' });
    setVerifying(false);
    if (error) return setErr(error.message);
    if (data?.user) router.replace('/(tabs)/rooms');
  };

  return (
    <View style={styles.root}>
      <Text style={styles.h}>Enter verification code</Text>
      <Text style={styles.sub}>{phone}</Text>
      <TextInput
        style={styles.code}
        value={code}
        onChangeText={setCode}
        placeholder="●●●●●●"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
      />
      {err ? <Text style={styles.err}>{err}</Text> : null}
      <Pressable disabled={verifying} onPress={verify} style={styles.btn}>
        <Text style={styles.btnTxt}>{verifying ? '...' : 'Confirm'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:'#FFF', padding:16, gap:12, alignItems:'center', justifyContent:'center' },
  h:{ fontWeight:'900', fontSize:18 },
  sub:{ opacity:0.7, fontWeight:'700' },
  code:{ backgroundColor:'#F3F4F6', borderRadius:12, paddingHorizontal:12, paddingVertical:10, width:'60%', fontWeight:'900', letterSpacing:4 },
  btn:{ backgroundColor:PALETTE.primary, borderRadius:12, paddingVertical:10, paddingHorizontal:18 },
  btnTxt:{ color:'#fff', fontWeight:'900' },
  err:{ color:'#dc2626', fontWeight:'800' }
});
