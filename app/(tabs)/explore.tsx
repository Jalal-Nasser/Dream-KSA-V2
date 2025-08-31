import * as React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

const W = Dimensions.get('window').width;

type SkinCard = { id: string; title: string; listeners: number; badge?: { text: string; bg: string; fg: string } | null; avatar: string; skin: number; country?: string; };
const SKINS = [
  { colors: ['#DFF7EE', '#E9F0FF'] },
  { colors: ['#FFF1F5', '#EAE8FF'] },
  { colors: ['#FFF6E5', '#FFE8F1'] },
  { colors: ['#E8F6FF', '#F4E8FF'] },
];

export default function Explore() {
  const [tab, setTab] = React.useState<'my' | 'trend' | 'celeb'>('trend');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* Gradient header with Binmo-style top bar */}
      <LinearGradient colors={['#E9FBF3', '#EAF2FF']} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.headerGrad}>
        <View style={styles.headerRow}>
          {/* left icons (home bubble + search) */}
          <View style={styles.leftIcons}>
            <View style={styles.homeBubble}>
              <MaterialCommunityIcons name="home-variant" size={18} color="#0A8F5D" />
            </View>
            <Pressable style={styles.iconBtn}><Ionicons name="search" size={18} color="#3C4856" /></Pressable>
          </View>

          {/* segmented tabs */}
          <View style={styles.segments}>
            {[
              { key: 'my', label: 'الخاص بي' },
              { key: 'trend', label: 'ترند' },
              { key: 'celeb', label: 'المشاهير' },
            ].map((t) => {
              const active = tab === t.key;
              return (
                <Pressable key={t.key} onPress={() => setTab(t.key as any)} style={styles.segItem}>
                  <Text style={[styles.segTxt, active && styles.segTxtActive]}>{t.label}</Text>
                  <View style={[styles.segUnderline, active && styles.segUnderlineActive]} />
                </Pressable>
              );
            })}
          </View>
        </View>
      </LinearGradient>

      {/* Body switches by tab */}
      {tab === 'my' && <MyTab />}
      {tab === 'trend' && <TrendTab />}
      {tab === 'celeb' && <CelebTab />}
    </SafeAreaView>
  );
}

/* -------- My Tab (feed style) -------- */
function MyTab() {
  const FEED = new Array(8).fill(0).map((_, i) => ({
    id: `f${i}`, name: i===0?'Jaz':'مستخدم ' + (i+1), country: ['LB','DE','KW','SY','US'][i%5],
    avatar: `https://i.pravatar.cc/120?img=${(i%60)+1}`,
    snippet: i===0?'أصدقائي، دعونا نتحدث! 🥰😉':'لا تبرر، اترك سوء الظن يأكل نفسه...',
    count: i*17,
  }));
  return (
    <ScrollView contentContainerStyle={{ padding: 12, paddingBottom: 26 }}>
      {FEED.map((it, idx) => (
        <View key={it.id} style={styles.feedCard}>
          <Image source={{ uri: it.avatar }} style={styles.feedAvatar} />
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={styles.feedName} numberOfLines={1}>{it.name}</Text>
            <Text style={styles.feedSnippet} numberOfLines={1}>{it.snippet}</Text>
            <View style={styles.feedMetaRow}>
              <View style={styles.metaPill}><Text style={styles.metaPillTxt}>{it.country}</Text></View>
              <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 4 }}>
                <Ionicons name="radio" size={12} color="#21A67A" />
                <Text style={styles.metaCount}>{it.count}</Text>
              </View>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

/* -------- Trend Tab (banner + grid of skin cards) -------- */
function TrendTab() {
  const CARDS: SkinCard[] = new Array(10).fill(0).map((_, i) => ({
    id: `t${i}`, title: i%3===0?'وكالة أرز لبنان':'بوليفارد سيتي الرياض', listeners: 120 + i*23,
    badge: i%4===0 ? { text:'Top1', bg:'#FFE8AA', fg:'#7A4E00' } : i%4===1 ? { text:'Top3', bg:'#FFE8AA', fg:'#7A4E00' } : i%4===2 ? { text:'رسمي', bg:'#DDF2FF', fg:'#0A4F8F' } : null,
    avatar: `https://i.pravatar.cc/160?img=${(i%60)+1}`,
    skin: i % SKINS.length,
    country: ['SA','LB','AE','KW'][i%4],
  }));

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      {/* hero banner carousel (static 2 banners) */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hlist}>
        {['https://picsum.photos/seed/banner1/1200/480','https://picsum.photos/seed/banner2/1200/480'].map((src, i)=>(
          <Image key={i} source={{ uri: src }} style={styles.banner} />
        ))}
      </ScrollView>

      {/* grid */}
      <View style={styles.gridWrap}>
        {CARDS.map((c, i) => <SkinCardView key={c.id} card={c} index={i} />)}
      </View>
    </ScrollView>
  );
}

/* -------- Celeb Tab (featured row + suggested hosts + grid) -------- */
function CelebTab() {
  const FEATURED = [
    { id:'p1', title:'إذاعة Binmo الرسمي', img:'https://picsum.photos/seed/prog1/800/600', stat:480, country:'SA' },
    { id:'p2', title:'نقطة و سطر جديد...', img:'https://picsum.photos/seed/prog2/800/600', stat:65, country:'SA' },
  ];
  const HOSTS = new Array(10).fill(0).map((_,i)=>({ id:`h${i}`, name:'مضيف '+(i+1), avatar:`https://i.pravatar.cc/100?img=${(i%60)+1}`, badge:i%3===0 }));
  const CARDS: SkinCard[] = new Array(8).fill(0).map((_, i) => ({
    id: `c${i}`, title: i%2? 'وكالَه أرز لبنان':'وك ضلّع لِيتان آذ', listeners: 300+i*11,
    badge: null, avatar:`https://i.pravatar.cc/160?img=${(i%60)+1}`, skin: (i+1)%SKINS.length, country:'LB'
  }));

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      {/* Featured row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hlist}>
        {FEATURED.map((f)=>(
          <View key={f.id} style={styles.featureCard}>
            <Image source={{ uri: f.img }} style={styles.featureImg}/>
            <Text style={styles.featureTitle} numberOfLines={1}>{f.title}</Text>
            <View style={styles.featureMeta}>
              <View style={{flexDirection:'row-reverse', alignItems:'center', gap:4}}>
                <Ionicons name="radio" size={12} color="#21A67A"/>
                <Text style={styles.featureStat}>{f.stat}</Text>
              </View>
              <View style={styles.metaPill}><Text style={styles.metaPillTxt}>{f.country}</Text></View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* suggested hosts */}
      <Text style={styles.subHeader}>المضيفين المقترحين</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.hlist,{paddingVertical:6}]}>
        {HOSTS.map(h=>(
          <View key={h.id} style={{ alignItems:'center', width:64 }}>
            <View style={[styles.storyRing, h.badge && { backgroundColor:'#D1FAE5' }]}>
              <Image source={{ uri: h.avatar }} style={styles.storyAvatar}/>
            </View>
            <Text numberOfLines={1} style={styles.storyName}>{h.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* grid */}
      <View style={styles.gridWrap}>
        {CARDS.map((c, i) => <SkinCardView key={c.id} card={c} index={i} />)}
      </View>
    </ScrollView>
  );
}

/* -------- Shared card view (gradient skin) -------- */
function SkinCardView({ card, index }: { card: SkinCard; index: number }) {
  const skin = SKINS[card.skin % SKINS.length];
  return (
    <LinearGradient colors={skin.colors} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.skinCard}>
      {/* badge */}
      {card.badge && (
        <View style={[styles.cornerBadge, { backgroundColor: card.badge.bg }]}>
          <Text style={[styles.cornerBadgeTxt, { color: card.badge.fg }]}>{card.badge.text}</Text>
        </View>
      )}
      {/* avatar */}
      <Image source={{ uri: card.avatar }} style={styles.skinAvatar}/>
      <Text style={styles.skinTitle} numberOfLines={1}>{card.title}</Text>
      <View style={styles.skinMetaRow}>
        <View style={styles.metaPill}><Text style={styles.metaPillTxt}>{card.country ?? 'SA'}</Text></View>
        <View style={{flexDirection:'row-reverse', alignItems:'center', gap:4}}>
          <Ionicons name="radio" size={12} color="#21A67A"/>
          <Text style={styles.featureStat}>{card.listeners}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

/* ---------------- Styles ---------------- */
const styles = StyleSheet.create({
  headerGrad: { paddingTop: 8, paddingBottom: 10, paddingHorizontal: 12 },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },
  leftIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  homeBubble: { backgroundColor: '#DFF6EA', borderRadius: 10, padding: 6 },
  iconBtn: { backgroundColor: '#F2F4F7', borderRadius: 10, padding: 6 },

  segments: { flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 18 },
  segItem: { alignItems: 'center' },
  segTxt: { fontWeight: '700', color: '#8A95A3', fontSize: 16 },
  segTxtActive: { color: '#111827' },
  segUnderline: { height: 2, width: 26, backgroundColor: 'transparent', marginTop: 6, borderRadius: 2 },
  segUnderlineActive: { backgroundColor: '#10B981' },

  hlist: { paddingHorizontal: 12, gap: 10, paddingTop: 8 },
  banner: { width: W * 0.86, height: 140, borderRadius: 16 },

  /* feed cards (My tab) */
  feedCard: { flexDirection: 'row-reverse', alignItems: 'center', gap: 10, backgroundColor:'#FFFFFF', borderRadius: 14, padding: 10, marginBottom: 10 },
  feedAvatar: { width: 42, height: 42, borderRadius: 10 },
  feedName: { fontWeight: '800', textAlign: 'right' },
  feedSnippet: { color:'#98A2B3', marginTop: 4, textAlign:'right' },
  feedMetaRow: { marginTop: 6, flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between' },
  metaPill: { backgroundColor:'#E7F8ED', paddingHorizontal:8, paddingVertical:3, borderRadius:999 },
  metaPillTxt: { color:'#166534', fontWeight:'700', fontSize:12 },
  metaCount: { fontWeight:'700' },

  /* featured program (Celeb) */
  featureCard: { width: W*0.6, backgroundColor:'#fff', borderRadius:16, overflow:'hidden', paddingBottom:8 },
  featureImg: { width: '100%', height: 120 },
  featureTitle: { textAlign:'right', fontWeight:'800', marginTop:8, marginHorizontal:10 },
  featureMeta: { flexDirection:'row-reverse', justifyContent:'space-between', alignItems:'center', marginTop:6, marginHorizontal:10 },
  featureStat: { fontWeight:'700' },

  /* stories row */
  storyRing: { padding:2, borderRadius:999, backgroundColor:'#E9F5FF' },
  storyAvatar: { width:48, height:48, borderRadius:24, backgroundColor:'#fff' },
  storyName: { fontSize:11, marginTop:4, maxWidth:60, textAlign:'center' },

  /* grid of skin cards */
  gridWrap: { paddingHorizontal: 10, paddingTop: 10, flexDirection:'row', flexWrap:'wrap', gap:10 },
  skinCard: { width:(W-30)/2, borderRadius:16, padding:12, minHeight:160, alignItems:'center', justifyContent:'center', overflow:'hidden' },
  cornerBadge: { position:'absolute', top:8, right:10, paddingHorizontal:10, paddingVertical:4, borderRadius:999 },
  cornerBadgeTxt: { fontWeight:'800', fontSize:12 },
  skinAvatar: { width:64, height:64, borderRadius:32, backgroundColor:'#fff', marginBottom:8 },
  skinTitle: { fontWeight:'800', textAlign:'center', maxWidth:(W-30)/2 - 24 },
  skinMetaRow: { position:'absolute', bottom:10, right:12, left:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },
  subHeader: { fontSize:14, fontWeight:'700', marginTop:16, marginHorizontal:10 },
});
