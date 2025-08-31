import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CherryHeader from '../../components/CherryHeader';
import { PALETTE } from '../../../lib/theme';

export default function SettingsScreen() {
  const [privacy,setPrivacy]=React.useState(true);
  const [reqs,setReqs]=React.useState(true);
  const [notifMentions,setNotifMentions]=React.useState(true);
  const [notifFollows,setNotifFollows]=React.useState(false);
  const [dark,setDark]=React.useState(false);

  return (
    <SafeAreaView style={{ flex:1, backgroundColor: PALETTE.soft1 }}>
      <CherryHeader title="إعدادات" />
      <ScrollView contentContainerStyle={{ padding:12, gap:10, paddingBottom:24 }}>
        <Section title="الخصوصية">
          <SettingRow label="حساب خاص" value={privacy} onChange={setPrivacy} />
          <SettingRow label="السماح بطلبات الصداقة" value={reqs} onChange={setReqs} last />
        </Section>

        <Section title="الإشعارات">
          <SettingRow label="إشعارات الذِكر @ " value={notifMentions} onChange={setNotifMentions} />
          <SettingRow label="إشعارات المتابعة" value={notifFollows} onChange={setNotifFollows} last />
        </Section>

        <Section title="المظهر">
          <SettingRow label="الوضع الداكن" value={dark} onChange={setDark} last />
        </Section>
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function SettingRow({ label, value, onChange, last=false }: { label:string; value:boolean; onChange:(v:boolean)=>void; last?:boolean }) {
  return (
    <View style={[styles.row, last && { borderBottomWidth:0 }]}>
      <Switch value={value} onValueChange={onChange} trackColor={{ false: PALETTE.soft2, true: PALETTE.primary }} thumbColor={'#fff'} />
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section:{ gap:8 },
  sectionTitle:{ textAlign:'right', fontWeight:'900', color:PALETTE.primaryDark },
  card:{ backgroundColor:'#fff', borderRadius:16, overflow:'hidden' },
  row:{ flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between', paddingVertical:12, paddingHorizontal:12, borderBottomWidth:StyleSheet.hairlineWidth, borderBottomColor:PALETTE.soft2 },
  label:{ fontWeight:'800' },
});
