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
    const { data, error } = await supabase.auth.verifyOtp({ phone: String(phone||''), token: code.trim(), type: 'sms' });
    setVerifying(false);
    if (error) return setErr(error.message);
    if (data?.user) router.replace('/(tabs)/rooms');
  };

  return (
    <View style={s.root}>
      <Text style={s.h}>Enter verification code</Text>
      <Text style={s.sub}>{phone}</Text>
      <TextInput
        style={s.code}
        value={code}
        onChangeText={setCode}
        placeholder="●●●●●●"
        placeholderTextColor="#9CA3AF"
        keyboardType="number-pad"
        maxLength={6}
        textAlign="center"
      />
      {err ? <Text style={s.err}>{err}</Text> : <View style={{ height:8 }} />}
      <Pressable disabled={verifying} onPress={verify} style={s.btn}>
        <Text style={s.btnTxt}>{verifying ? '...' : 'Confirm'}</Text>
      </Pressable>
    </View>
  );
}
const s = StyleSheet.create({
  root:{ flex:1, backgroundColor:'#FFF', alignItems:'center', justifyContent:'center', padding:16, gap:12 },
  h:{ fontWeight:'900', fontSize:18 },
  sub:{ opacity:0.7, fontWeight:'700' },
  code:{ backgroundColor:'#F3F4F6', borderRadius:12, paddingHorizontal:12, paddingVertical:12, width:'60%', fontWeight:'900', letterSpacing:4 },
  btn:{ backgroundColor:PALETTE.primary, borderRadius:12, paddingVertical:12, paddingHorizontal:20 },
  btnTxt:{ color:'#fff', fontWeight:'900' },
  err:{ color:'#dc2626', fontWeight:'800' }
});
