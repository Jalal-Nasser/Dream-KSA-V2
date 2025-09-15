import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, I18nManager, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

const AR = I18nManager.isRTL;

type RPS = '🪨'|'📄'|'✂️';
const rpsOptions: RPS[] = ['🪨','📄','✂️'];
const rpsWin = (a: RPS, b: RPS) =>
  (a === '🪨' && b === '✂️') || (a === '📄' && b === '🪨') || (a === '✂️' && b === '📄');

export default function GamesHub() {
  const router = useRouter();

  // Rock-Paper-Scissors
  const [myPick, setMyPick] = useState<RPS | null>(null);
  const [botPick, setBotPick] = useState<RPS | null>(null);
  const [rpsScore, setRpsScore] = useState({ me: 0, bot: 0 });

  const playRPS = (pick: RPS) => {
    const bot = rpsOptions[Math.floor(Math.random()*3)];
    setMyPick(pick); setBotPick(bot);
    if (pick === bot) return;
    if (rpsWin(pick, bot)) setRpsScore(s => ({...s, me: s.me+1}));
    else setRpsScore(s => ({...s, bot: s.bot+1}));
  };

  // Dice duel
  const [d1, setD1] = useState<number | null>(null);
  const [d2, setD2] = useState<number | null>(null);
  const [diceScore, setDiceScore] = useState({ me: 0, bot: 0 });
  const roll = () => {
    const a = 1 + Math.floor(Math.random()*6);
    const b = 1 + Math.floor(Math.random()*6);
    setD1(a); setD2(b);
    if (a > b) setDiceScore(s => ({...s, me: s.me+1}));
    else if (b > a) setDiceScore(s => ({...s, bot: s.bot+1}));
  };

  return (
    <ScrollView style={s.page} contentContainerStyle={{ padding: 16 }}>
      <View style={s.header}>
        <Pressable onPress={() => router.back()}><Text style={s.back}>←</Text></Pressable>
        <Text style={[s.h1, { textAlign: 'center', flex: 1 }]}>{AR ? 'مركز الألعاب' : 'Games Center'}</Text>
        <View style={{ width: 28 }} />
      </View>

      {/* RPS */}
      <View style={s.card}>
        <Text style={s.h2}>{AR ? 'حجر ورق مقص' : 'Rock Paper Scissors'}</Text>
        <Text style={s.sub}>{AR ? 'اختر ضد الروبوت' : 'Pick vs bot'}</Text>
        <View style={[s.row, { justifyContent: 'space-around', marginTop: 12 }]}>
          {rpsOptions.map(o => (
            <Pressable key={o} onPress={() => playRPS(o)} style={s.rpsBtn}><Text style={s.big}>{o}</Text></Pressable>
          ))}
        </View>
        <View style={[s.row, { marginTop: 10, justifyContent: 'space-between' }]}>
          <Text style={s.small}>{AR ? `اختيارك: ${myPick ?? '—'}` : `You: ${myPick ?? '—'}`}</Text>
          <Text style={s.small}>{AR ? `الروبوت: ${botPick ?? '—'}` : `Bot: ${botPick ?? '—'}`}</Text>
        </View>
        <Text style={[s.score, { marginTop: 6 }]}>{AR ? `النتيجة ${rpsScore.me} - ${rpsScore.bot}` : `Score ${rpsScore.me} - ${rpsScore.bot}`}</Text>
      </View>

      {/* Dice */}
      <View style={s.card}>
        <Text style={s.h2}>{AR ? 'النرد' : 'Dice Duel'}</Text>
        <Text style={s.sub}>{AR ? 'ارمِ النرد وافز بالنقاط' : 'Roll and score'}</Text>
        <View style={[s.row, { justifyContent: 'space-between', marginTop: 12 }]}>
          <View style={s.die}><Text style={s.big}>{d1 ?? '—'}</Text></View>
          <Pressable onPress={roll} style={s.roll}><Text style={s.rollTxt}>{AR ? 'ارمِ' : 'Roll'}</Text></Pressable>
          <View style={s.die}><Text style={s.big}>{d2 ?? '—'}</Text></View>
        </View>
        <Text style={[s.score, { marginTop: 6 }]}>{AR ? `النتيجة ${diceScore.me} - ${diceScore.bot}` : `Score ${diceScore.me} - ${diceScore.bot}`}</Text>
      </View>

      {/* Coming soon list */}
      <View style={s.card}>
        <Text style={s.h2}>{AR ? 'قريبًا' : 'Coming soon'}</Text>
        <View style={[s.row, { marginTop: 10 }]}>
          {['UNO', 'Ludo', AR ? 'لعبة الكريم' : 'Karim'].map((t) => (
            <View key={t} style={s.soonTag}><Text style={s.small}>{t}</Text></View>
          ))}
        </View>
      </View>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  page: { backgroundColor: '#F7FBFD' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  back: { fontSize: 20, padding: 6, color: '#666' },
  h1: { fontSize: 18, fontWeight: '800', color: '#111' },
  h2: { fontSize: 16, fontWeight: '800', color: '#222' },
  sub: { color: '#777', marginTop: 2 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, marginTop: 12, borderWidth: 1, borderColor: '#eee' },
  row: { flexDirection: 'row', alignItems: 'center' },
  rpsBtn: { backgroundColor: '#F2E6FF', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12 },
  big: { fontSize: 28 },
  small: { fontSize: 13, color: '#444' },
  score: { textAlign: 'center', fontWeight: '800', color: '#7B2BE2' },
  die: { width: 64, height: 64, borderRadius: 14, backgroundColor: '#F8F2FF', alignItems: 'center', justifyContent: 'center' },
  roll: { backgroundColor: '#EA4C89', paddingVertical: 10, paddingHorizontal: 18, borderRadius: 14 },
  rollTxt: { color: '#fff', fontWeight: '800' },
  soonTag: { backgroundColor: '#FFF3D6', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 10, marginRight: 8 },
});


