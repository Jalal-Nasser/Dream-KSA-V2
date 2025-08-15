import { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '../../lib/supabase';
import { currentMonth } from '../../lib/agency-utils';

type Earnings = { id:string; total_points:number; host_share_points:number; agency_share_points:number; agency_id:string|null };
type Payout = { id:string; amount:number; status:string; created_at:string; agency_id:string|null };

export default function HostDashboard() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string|undefined>();
  const [agencyId, setAgencyId] = useState<string|undefined>();
  const [earn, setEarn] = useState<Earnings|undefined>();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const month = useMemo(currentMonth, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setMe(user.id);

      const { data: meHost } = await supabase.from('hosts').select('agency_id').eq('user_id', user.id).maybeSingle();
      if (meHost?.agency_id) setAgencyId(meHost.agency_id);

      const { data: meEarn } = await supabase
        .from('monthly_earnings')
        .select('id,total_points,host_share_points,agency_share_points,agency_id')
        .eq('host_id', user.id)
        .eq('month', month)
        .maybeSingle();
      setEarn(meEarn ?? undefined);

      const { data: mePayouts } = await supabase
        .from('payouts')
        .select('id,amount,status,created_at,agency_id')
        .eq('beneficiary_id', user.id)
        .order('created_at', { ascending:false })
        .limit(10);
      setPayouts(mePayouts ?? []);
      setLoading(false);
    })();
  }, [month]);

  const requestMyPayout = async () => {
    try {
      if (!me) return;
      const res = await fetch(`https://kgcpeoidouajwytndtqi.functions.supabase.co/request-payout`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ month, beneficiary_type:'host', beneficiary_id: me, agency_id: agencyId ?? null })
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('تم الإرسال', 'تم تقديم طلب السحب بنجاح');
    } catch(e:any) {
      Alert.alert('خطأ', e?.message ?? 'تعذر تقديم الطلب');
    }
  };

  if (loading) return <View style={S.c}><ActivityIndicator/></View>;

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12, direction:'rtl' }}>
      <View style={S.card}>
        <Text style={S.cardTitle}>أرباحي لشهر {month}</Text>
        {earn ? (
          <>
            <Text style={S.item}>مجموع النقاط: {earn.total_points}</Text>
            <Text style={S.item}>نصيبي: {earn.host_share_points}</Text>
            <Text style={S.item}>نصيب الوكالة: {earn.agency_share_points}</Text>
          </>
        ) : <Text style={S.muted}>لا توجد بيانات بعد.</Text>}
        <View style={{ height:10 }}/>
        <Pressable onPress={requestMyPayout} style={S.btn}>
          <Text style={S.btnText}>طلب سحب</Text>
        </Pressable>
      </View>

      <View style={S.card}>
        <Text style={S.cardTitle}>الدفعات الأخيرة</Text>
        {payouts.length===0 ? <Text style={S.muted}>لا توجد دفعات.</Text> : payouts.map(p=>(
          <View key={p.id} style={S.rowBetween}>
            <Text style={S.itemSmall}>{new Date(p.created_at).toLocaleDateString()}</Text>
            <Text style={S.itemSmall}>{p.amount} — {p.status}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const S = StyleSheet.create({
  c:{ flex:1, alignItems:'center', justifyContent:'center', padding:24, direction:'rtl' },
  card:{ backgroundColor:'#fff', padding:14, borderRadius:12, elevation:2 },
  cardTitle:{ fontSize:16, fontWeight:'600', textAlign:'right' },
  item:{ fontSize:15, textAlign:'right' },
  itemSmall:{ fontSize:13, textAlign:'right', color:'#444' },
  rowBetween:{ flexDirection:'row-reverse', justifyContent:'space-between', paddingVertical:6 },
  muted:{ color:'#777', textAlign:'right' },
  btn:{ backgroundColor:'#6C63FF', borderRadius:10, paddingVertical:10, alignItems:'center' },
  btnText:{ color:'#fff', fontSize:15 }
});
