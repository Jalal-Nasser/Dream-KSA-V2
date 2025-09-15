import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, I18nManager, ScrollView, Pressable, Dimensions } from 'react-native';
import SeatGrid, { SeatUser } from '@/components/SeatGrid';
import InlineChat from '@/components/InlineChat';

const AR = I18nManager.isRTL;
const { height } = Dimensions.get('window');

function useDemoUsers(): SeatUser[] {
  const [toggle, setToggle] = useState(false);
  const users = useMemo<SeatUser[]>(
    () => [
      { id: '42399f0e', name: 'Jalal', role: 'host', imageUrl: null },
      { id: 'd2f76a01', name: 'Khalid', role: 'speaker', imageUrl: null },
      { id: 'aa12bb34', name: 'Areej', role: 'listener', imageUrl: null, handRaised: true },
      { id: 'cc56dd78', name: 'Nada', role: 'listener', imageUrl: null },
      { id: 'ee90ff12', name: 'Sole', role: 'speaker', imageUrl: null },
    ],
    [toggle]
  );
  return users;
}

function RPS({ onClose }: { onClose: () => void }) {
  type R = '🪨'|'📄'|'✂️';
  const opts: R[] = ['🪨','📄','✂️'];
  const win = (a:R,b:R)=> (a==='🪨'&&b==='✂️')||(a==='📄'&&b==='🪨')||(a==='✂️'&&b==='📄');
  const [me,setMe]=useState<R|null>(null); const [bot,setBot]=useState<R|null>(null);
  const [score,setScore]=useState({me:0,bot:0});
  const play=(p:R)=>{const b=opts[Math.floor(Math.random()*3)];setMe(p);setBot(b); if(p!==b){if(win(p,b))setScore(s=>({...s,me:s.me+1})); else setScore(s=>({...s,bot:s.bot+1}));}};
  return (
    <View style={g.modal}>
      <Text style={g.h2}>{AR?'حجر ورق مقص':'Rock · Paper · Scissors'}</Text>
      <View style={[g.row,{justifyContent:'space-around',marginTop:12}]}>
        {opts.map(o=> <Pressable key={o} onPress={()=>play(o)} style={g.choice}><Text style={g.big}>{o}</Text></Pressable>)}
      </View>
      <Text style={g.sub}>{AR?`أنت: ${me??'—'} · الروبوت: ${bot??'—'}`:`You: ${me??'—'} · Bot: ${bot??'—'}`}</Text>
      <Text style={g.sub}>{AR?`النتيجة ${score.me} - ${score.bot}`:`Score ${score.me} - ${score.bot}`}</Text>
      <Pressable onPress={onClose} style={g.close}><Text style={g.closeTxt}>{AR?'إغلاق':'Close'}</Text></Pressable>
    </View>
  );
}

function Dice({ onClose }: { onClose: () => void }) {
  const [a,setA]=useState<number|null>(null); const [b,setB]=useState<number|null>(null);
  const [score,setScore]=useState({me:0,bot:0});
  const roll=()=>{const x=1+Math.floor(Math.random()*6);const y=1+Math.floor(Math.random()*6);setA(x);setB(y); if(x>y)setScore(s=>({...s,me:s.me+1})); else if(y>x)setScore(s=>({...s,bot:s.bot+1}));};
  return (
    <View style={g.modal}>
      <Text style={g.h2}>{AR?'النرد':'Dice Duel'}</Text>
      <View style={[g.row,{justifyContent:'space-between',marginTop:12}]}>
        <View style={g.die}><Text style={g.big}>{a??'—'}</Text></View>
        <Pressable onPress={roll} style={g.roll}><Text style={g.rollTxt}>{AR?'ارمِ':'Roll'}</Text></Pressable>
        <View style={g.die}><Text style={g.big}>{b??'—'}</Text></View>
      </View>
      <Text style={g.sub}>{AR?`النتيجة ${score.me} - ${score.bot}`:`Score ${score.me} - ${score.bot}`}</Text>
      <Pressable onPress={onClose} style={g.close}><Text style={g.closeTxt}>{AR?'إغلاق':'Close'}</Text></Pressable>
    </View>
  );
}

export default function RoomBinmoDemo() {
  const users = useDemoUsers();
  const [showRps,setShowRps]=useState(false);
  const [showDice,setShowDice]=useState(false);

  return (
    <View style={s.page}>
      {/* Compact top bar */}
      <View style={[s.top, { flexDirection: AR ? 'row-reverse' : 'row' }]}>
        <Text style={s.title}>{AR?'غرفة دردشة':'Chat Room'}</Text>
        <View style={{ flex:1 }} />
        <Text style={s.badge}>{AR?'المتواجدون':'Online'}: {users.length}</Text>
      </View>

      {/* Seat grid */}
      <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 140 }}>
        <SeatGrid users={users} />
        {/* Mini games ribbon */}
        <View style={[g.ribbon,{ flexDirection: AR ? 'row-reverse':'row' }]}>
          <Pressable onPress={()=>setShowRps(true)} style={g.card}><Text style={g.cardTxt}>🪨📄✂️  {AR?'لعبة سريعة':'Quick RPS'}</Text></Pressable>
          <Pressable onPress={()=>setShowDice(true)} style={g.card}><Text style={g.cardTxt}>🎲  {AR?'النرد':'Dice'}</Text></Pressable>
          <View style={{ flex:1 }} />
        </View>
      </ScrollView>

      {/* Inline chat overlay */}
      <InlineChat roomId={'demo-room'} meUserId={'42399f0e'} meName={'Jalal'} demo />

      {/* Simple game modals */}
      {showRps && <RPS onClose={()=>setShowRps(false)} />}
      {showDice && <Dice onClose={()=>setShowDice(false)} />}
    </View>
  );
}

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#F7FBFD' },
  top: { alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10 },
  title: { fontSize: 16, fontWeight: '800', color: '#111' },
  badge: { backgroundColor: '#FFF3D6', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, color: '#7A4B00', fontWeight: '700' },
});

const g = StyleSheet.create({
  ribbon: { paddingHorizontal: 2, marginTop: 6, alignItems: 'center' },
  card: { backgroundColor: '#FFFFFF', borderColor: '#eee', borderWidth: 1, borderRadius: 12, paddingVertical: 10, paddingHorizontal: 12, marginHorizontal: 4 },
  cardTxt: { fontWeight: '800', color: '#333' },

  modal: { position: 'absolute', left: 12, right: 12, top: height*0.18, backgroundColor:'#fff', borderRadius:16, borderWidth:1, borderColor:'#eee', padding:16, zIndex:40, alignItems:'center' },
  h2: { fontSize: 16, fontWeight: '800', color: '#111' },
  sub: { marginTop: 8, color: '#555', fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center' },
  choice: { backgroundColor:'#F2E6FF', paddingVertical:10, paddingHorizontal:16, borderRadius:12 },
  big: { fontSize: 28 },
  close: { marginTop: 12, backgroundColor:'#EA4C89', paddingHorizontal:16, paddingVertical:10, borderRadius:12 },
  closeTxt: { color:'#fff', fontWeight:'800' },

  die: { width:64, height:64, backgroundColor:'#F8F2FF', borderRadius:14, alignItems:'center', justifyContent:'center' },
  roll: { backgroundColor:'#7B2BE2', paddingVertical:10, paddingHorizontal:18, borderRadius:14 },
  rollTxt: { color:'#fff', fontWeight:'800' },
});
