import * as React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Modal, FlatList, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { getSupabase } from '../../lib/supabase';
import { PALETTE } from '../../lib/theme';

// Minimal picker list (emoji flags like Binmo)
const COUNTRIES = [
  { flag:'🇸🇦', name:'Saudi Arabia', code:'+966' },
  { flag:'🇦🇪', name:'UAE', code:'+971' },
  { flag:'🇰🇼', name:'Kuwait', code:'+965' },
  { flag:'🇶🇦', name:'Qatar', code:'+974' },
  { flag:'🇴🇲', name:'Oman', code:'+968' },
  { flag:'🇱🇧', name:'Lebanon', code:'+961' },
  { flag:'🇯🇴', name:'Jordan', code:'+962' },
  { flag:'🇪🇬', name:'Egypt', code:'+20' },
  { flag:'🇹🇷', name:'Türkiye', code:'+90' },
];

export default function PhoneLogin() {
  const supabase = getSupabase();
  const router = useRouter();
  const [pickerOpen, setPickerOpen] = React.useState(false);
  const [cc, setCc] = React.useState(COUNTRIES[0]);
  const [phone, setPhone] = React.useState('');
  const [sending, setSending] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);

  const e164 = React.useMemo(() => `${cc.code}${(phone || '').replace(/\D/g, '')}`, [cc, phone]);
  const valid = /^\+\d{1,4}$/.test(cc.code) && /^\d{6,15}$/.test((phone || '').replace(/\D/g,''));

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
      <View style={s.header}>
        <Pressable hitSlop={10} onPress={() => router.back()}><Ionicons name="chevron-back" size={22} /></Pressable>
        <Text style={s.h}>تسجيل الدخول/التسجيل بالهاتف</Text>
        <Pressable onPress={() => router.push('/login/help')}><Text style={s.subLink}>لا استطيع الدخول؟</Text></Pressable>
      </View>

      <View style={s.body}>
        <Text style={s.sub}>إذا لم تكن مسجلاً، سيتم إرسال رسالة تحقق تلقائياً.</Text>

        <View style={s.row}>
          <Pressable style={s.ccBtn} onPress={()=>setPickerOpen(true)}>
            <Text style={{ fontSize:16 }}>{cc.flag}</Text>
            <Text style={{ fontWeight:'900' }}>{cc.code}</Text>
            <Ionicons name="chevron-down" size={16} />
          </Pressable>
          <TextInput
            placeholder="رقم الهاتف المحمول"
            placeholderTextColor="#9CA3AF"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            style={s.input}
          />
        </View>

        {err ? <Text style={s.err}>{err}</Text> : <View style={{ height:8 }} />}

        <Pressable disabled={!valid || sending} onPress={sendOtp} style={[s.nextBtn, (!valid || sending) && { opacity:0.5 }]}>
          <Text style={s.nextTxt}>التالي</Text>
        </Pressable>
      </View>

      {/* Country picker modal */}
      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={()=>setPickerOpen(false)}>
        <View style={s.backdrop}>
          <View style={s.picker}>
            <View style={{ flexDirection:'row', alignItems:'center', justifyContent:'space-between' }}>
              <Text style={{ fontWeight:'900', fontSize:16 }}>Select Country</Text>
              <Pressable onPress={()=>setPickerOpen(false)}><Ionicons name="close" size={22} /></Pressable>
            </View>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(it)=>it.code}
              ItemSeparatorComponent={()=><View style={{ height:8 }} />}
              renderItem={({ item }) => (
                <Pressable style={s.item} onPress={()=>{ setCc(item); setPickerOpen(false); }}>
                  <Text style={{ fontSize:18 }}>{item.flag}</Text>
                  <View style={{ flex:1 }}>
                    <Text style={{ fontWeight:'800' }}>{item.name}</Text>
                    <Text style={{ opacity:0.6, fontWeight:'700' }}>{item.code}</Text>
                  </View>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  header:{ height:56, paddingHorizontal:16, flexDirection:'row', alignItems:'center', justifyContent:'space-between' },
  h:{ fontWeight:'900', fontSize:18, textAlign: 'right' },
  subLink:{ fontWeight:'800', opacity:0.7, textAlign: 'right' },
  body:{ padding:16, gap:14 },
  sub:{ opacity:0.65, fontWeight:'700', textAlign: 'right' },
  row:{ flexDirection:'row', gap:10 },
  ccBtn:{ width:120, backgroundColor:'#F3F4F6', borderRadius:12, alignItems:'center', justifyContent:'center', paddingVertical:12, flexDirection:'row', gap:6 },
  input:{ flex:1, backgroundColor:'#F3F4F6', borderRadius:12, paddingHorizontal:12, paddingVertical:12, fontWeight:'800', textAlign: 'right' },

  nextBtn:{ marginTop:6, backgroundColor:PALETTE.primary, borderRadius:14, paddingVertical:14, alignItems:'center', shadowColor:'#000', shadowOpacity:0.12, shadowRadius:8, elevation:2 },
  nextTxt:{ color:'#fff', fontWeight:'900', fontSize:16 },
  err:{ color:'#dc2626', fontWeight:'800', textAlign: 'right' },

  backdrop:{ flex:1, backgroundColor:'rgba(0,0,0,0.45)', padding:16, justifyContent:'center' },
  picker:{ backgroundColor:'#fff', borderRadius:16, padding:16, maxHeight:'70%', gap:12 },
  item:{ flexDirection:'row', alignItems:'center', gap:12, paddingVertical:6 },
});
