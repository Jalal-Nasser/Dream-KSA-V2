import * as React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
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
    <KeyboardAvoidingView style={{ flex:1, backgroundColor:'#FFF' }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <Pressable hitSlop={10} onPress={() => router.back()}><Ionicons name="chevron-back" size={22} /></Pressable>
        <Text style={styles.h}>Phone Log in/Register</Text>
        <Pressable onPress={() => router.push('/login/help')}><Text style={styles.subLink}>Can't login?</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        <Text style={styles.sub}>If not registered, a verification SMS will be sent automatically.</Text>

        <View style={styles.row}>
          <View style={styles.ccBtn}><Text style={{ fontWeight:'900' }}>{cc}</Text></View>
          <TextInput
            placeholder="Mobile number"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={styles.input}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ccRow}>
          {CC_LIST.map(code => (
            <Pressable key={code} style={[styles.ccChip, cc===code && styles.ccChipActive]} onPress={() => setCc(code)}>
              <Text style={[styles.ccChipTxt, cc===code && styles.ccChipTxtActive]}>{code}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {err ? <Text style={styles.err}>{err}</Text> : <View style={{ height:4 }} />}

        <Pressable disabled={!valid || sending} onPress={sendOtp} style={[styles.nextBtn, (!valid || sending) && { opacity:0.5 }]}>
          <Text style={styles.nextTxt}>Next</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header:{ height:56, paddingHorizontal:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  h:{ fontWeight:'900', fontSize:18 },
  subLink:{ fontWeight:'800', opacity:0.7 },
  body:{ padding:16, gap:14 },
  sub:{ opacity:0.65, fontWeight:'700' },
  row:{ flexDirection:'row', gap:10 },
  ccBtn:{ width:86, backgroundColor:'#F3F4F6', borderRadius:12, alignItems:'center', justifyContent:'center', paddingVertical:12 },
  input:{ flex:1, backgroundColor:'#F3F4F6', borderRadius:12, paddingHorizontal:12, paddingVertical:12, fontWeight:'800' },
  ccRow:{ gap:8, paddingVertical:6 },
  ccChip:{ paddingVertical:8, paddingHorizontal:12, borderRadius:999, backgroundColor:'#F3F4F6' },
  ccChipActive:{ backgroundColor:'#111827' },
  ccChipTxt:{ fontWeight:'900', color:'#111827' },
  ccChipTxtActive:{ color:'#fff' },

  nextBtn:{ marginTop:6, backgroundColor:PALETTE.primary, borderRadius:14, paddingVertical:14, alignItems:'center', shadowColor:'#000', shadowOpacity:0.12, shadowRadius:8, elevation:2 },
  nextTxt:{ color:'#fff', fontWeight:'900', fontSize:16 },
  err:{ color:'#dc2626', fontWeight:'800' }
});
