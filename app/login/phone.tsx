import * as React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSupabase } from '../../lib/supabase';
import { PALETTE } from '../../lib/theme';

const CC_LIST = ['+966', '+971', '+965', '+974', '+968', '+20', '+961', '+962', '+90'];

export default function PhoneLogin() {
  const supabase = getSupabase();
  const router = useRouter();
  const [cc, setCc] = React.useState('+966');
  const [phone, setPhone] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const e164 = React.useMemo(() => `${cc}${(phone || '').replace(/\D/g,'')}`, [cc, phone]);
  const valid = /^\+\d{1,4}$/.test(cc) && /^\d{6,15}$/.test((phone || '').replace(/\D/g,''));

  const sendOtp = async () => {
    setErr(null);
    if (!valid) return setErr('تحقق من الرقم');
    setSending(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: e164 });
    setSending(false);
    if (error) return setErr(error.message);
    router.push({ pathname: '/login/otp', params: { phone: e164 } });
  };

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}><Ionicons name="chevron-back" size={22} /></Pressable>
        <Text style={styles.h}>Phone Log in/Register</Text>
        <Pressable onPress={() => router.push('/login/help')}>
          <Text style={{ fontWeight:'800', opacity:0.6 }}>Can't login?</Text>
        </Pressable>
      </View>

      <Text style={styles.sub}>If not registered, a verification SMS will be sent automatically.</Text>

      <View style={styles.row}>
        <Pressable style={styles.ccBtn}>
          <Text style={{ fontWeight:'900' }}>{cc}</Text>
        </Pressable>
        <TextInput
          placeholder="Mobile number"
          placeholderTextColor="#9CA3AF"
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          style={styles.input}
        />
      </View>

      {/* quick chooser */}
      <View style={styles.ccRow}>
        {CC_LIST.map(code => (
          <Pressable key={code} style={[styles.ccChip, cc===code && { backgroundColor:'#111827' }]} onPress={() => setCc(code)}>
            <Text style={[styles.ccChipTxt, cc===code && { color:'#fff' }]}>{code}</Text>
          </Pressable>
        ))}
      </View>

      {err ? <Text style={styles.err}>{err}</Text> : null}

      <Pressable disabled={!valid || sending} onPress={sendOtp} style={[styles.nextBtn, (!valid || sending) && { opacity:0.5 }]}>
        <Text style={styles.nextTxt}>Next</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  root:{ flex:1, backgroundColor:'#FFF', padding:16, gap:12 },
  header:{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  h:{ fontWeight:'900', fontSize:18 },
  sub:{ opacity:0.6, fontWeight:'700' },
  row:{ flexDirection:'row', gap:8 },
  ccBtn:{ width:86, backgroundColor:'#F3F4F6', borderRadius:12, alignItems:'center', justifyContent:'center', paddingVertical:10 },
  input:{ flex:1, backgroundColor:'#F3F4F6', borderRadius:12, paddingHorizontal:12, paddingVertical:10, fontWeight:'800' },
  ccRow:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
  ccChip:{ paddingVertical:6, paddingHorizontal:10, borderRadius:999, backgroundColor:'#F3F4F6' },
  ccChipTxt:{ fontWeight:'800', color:'#111827' },
  nextBtn:{ marginTop:8, backgroundColor:PALETTE.primary, borderRadius:12, paddingVertical:12, alignItems:'center' },
  nextTxt:{ color:'#fff', fontWeight:'900' },
  err:{ color:'#dc2626', fontWeight:'800' }
});
