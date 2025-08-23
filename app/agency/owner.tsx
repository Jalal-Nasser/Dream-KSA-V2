import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ActivityIndicator, Pressable, StyleSheet, ScrollView, Alert } from 'react-native';
import { supabase } from '@/lib/supabase';
import { currentMonth } from '@/lib/agency-utils';

type Agency = { id: string; name: string };
type HostRow = { user_id: string; agency_id: string; monthly_hours: number|null; monthly_gifts: number|null; display_name: string|null };
type Summary = { total_points: number; host_share_points: number; agency_share_points: number };
type Payout = { id: string; amount: number; status: string; created_at: string };

export default function OwnerDashboard() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<string|undefined>();
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [agencyId, setAgencyId] = useState<string|undefined>();
  const [hosts, setHosts] = useState<HostRow[]>([]);
  const [summary, setSummary] = useState<Summary|undefined>();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const month = useMemo(currentMonth, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      setMe(user.id);

      const { data: ag } = await supabase.from('agencies').select('id,name').eq('owner_id', user.id).order('created_at', { ascending:false });
      setAgencies(ag ?? []);
      setAgencyId(ag?.[0]?.id);
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (!agencyId) return;
    (async () => {
      setLoading(true);
      // Hosts list
      const { data: hs } = await supabase
        .from('hosts')
        .select('user_id, agency_id, monthly_hours, monthly_gifts, profiles:profiles(display_name)')
        .eq('agency_id', agencyId)
        .limit(100);
      const normalized: HostRow[] = (hs ?? []).map((h:any)=>({
        user_id: h.user_id, agency_id: h.agency_id, monthly_hours: h.monthly_hours, monthly_gifts: h.monthly_gifts, display_name: h.profiles?.display_name ?? null
      }));
      setHosts(normalized);

      // Summary from monthly_earnings
      const { data: sumRows, error: sumErr } = await supabase
        .from('monthly_earnings')
        .select('total_points, host_share_points, agency_share_points')
        .eq('agency_id', agencyId)
        .eq('month', month);
      if (sumErr) {
        setSummary({ total_points:0, host_share_points:0, agency_share_points:0 });
      } else {
        const agg = (sumRows??[]).reduce((a:any,r:any)=>({
          total_points: a.total_points + (r.total_points||0),
          host_share_points: a.host_share_points + (r.host_share_points||0),
          agency_share_points: a.agency_share_points + (r.agency_share_points||0),
        }), { total_points:0, host_share_points:0, agency_share_points:0 });
        setSummary(agg);
      }

      // Payouts for agency
      const { data: po } = await supabase
        .from('payouts')
        .select('id, amount, status, created_at')
        .eq('agency_id', agencyId)
        .order('created_at', { ascending:false })
        .limit(10);
      setPayouts(po ?? []);
      setLoading(false);
    })();
  }, [agencyId, month]);

  const requestAgencyPayout = async () => {
    try {
      if (!me || !agencyId) return;
      const res = await fetch(`https://kgcpeoidouajwytndtqi.functions.supabase.co/request-payout`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({ month, beneficiary_type:'agency', beneficiary_id: me, agency_id: agencyId })
      });
      if (!res.ok) throw new Error(await res.text());
      Alert.alert('تم الإرسال', 'تم تقديم طلب السحب بنجاح');
    } catch(e:any) {
      Alert.alert('خطأ', e?.message ?? 'تعذر تقديم الطلب');
    }
  };

  if (loading && !agencyId) return <View style={S.c}><ActivityIndicator/></View>;
  if (!agencyId) return <View style={S.c}><Text style={S.h}>لا توجد وكالات مملوكة.</Text></View>;

  return (
    <ScrollView contentContainerStyle={{ padding:16, gap:12, direction:'rtl' }}>
      {/* Agency switcher (if many) */}
      {agencies.length>1 && (
        <View style={S.row}>
          {agencies.map(a=>(
            <Pressable key={a.id} onPress={()=>setAgencyId(a.id)} style={[S.chip, a.id===agencyId && S.chipActive]}>
              <Text style={S.chipText}>{a.name}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Summary */}
      <View style={S.card}>
        <Text style={S.cardTitle}>ملخص شهر {month}</Text>
        <View style={{ height:8 }}/>
        <Text style={S.item}>مجموع النقاط: {summary?.total_points ?? 0}</Text>
        <Text style={S.item}>حصة المضيفين: {summary?.host_share_points ?? 0}</Text>
        <Text style={S.item}>حصة الوكالة: {summary?.agency_share_points ?? 0}</Text>
        <View style={{ height:10 }}/>
        <Pressable onPress={requestAgencyPayout} style={S.btn}>
          <Text style={S.btnText}>طلب سحب للوكالة</Text>
        </Pressable>
      </View>

      {/* Hosts */}
      <View style={S.card}>
        <Text style={S.cardTitle}>المضيفون</Text>
        {hosts.length===0 ? <Text style={S.muted}>لا يوجد مضيفون.</Text> : hosts.map(h=>(
          <View key={h.user_id} style={S.rowBetween}>
            <Text style={S.item}>{h.display_name ?? h.user_id.slice(0,8)}</Text>
            <Text style={S.itemSmall}>هدايا هذا الشهر: {h.monthly_gifts ?? 0}</Text>
          </View>
        ))}
      </View>

      {/* Payouts */}
      <View style={S.card}>
        <Text style={S.cardTitle}>الدفعات الأخيرة</Text>
        {payouts.length===0 ? <Text style={S.muted}>لا توجد بيانات.</Text> : payouts.map(p=>(
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
  h:{ fontSize:18, textAlign:'center' },
  row:{ flexDirection:'row-reverse', flexWrap:'wrap', gap:8 },
  chip:{ paddingVertical:6, paddingHorizontal:12, borderRadius:999, backgroundColor:'#eee' },
  chipActive:{ backgroundColor:'#C6B6FF' },
  chipText:{ fontSize:14 },
  card:{ backgroundColor:'#fff', padding:14, borderRadius:12, elevation:2 },
  cardTitle:{ fontSize:16, fontWeight:'600', textAlign:'right' },
  item:{ fontSize:15, textAlign:'right' },
  itemSmall:{ fontSize:13, textAlign:'right', color:'#444' },
  muted:{ color:'#777', textAlign:'right' },
  rowBetween:{ flexDirection:'row-reverse', justifyContent:'space-between', paddingVertical:6 },
  btn:{ backgroundColor:'#6C63FF', borderRadius:10, paddingVertical:10, alignItems:'center' },
  btnText:{ color:'#fff', fontSize:15 }
});
