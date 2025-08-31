import * as React from 'react';
import {
  View, Text, StyleSheet, FlatList, Image, Pressable, TextInput,
  ImageBackground, Dimensions, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { PALETTE } from '../_dksa-theme';

type Room = {
  id: string;
  title: string;
  cover?: string;
  avatar: string;
  listeners: number;
  lang?: string;
  country?: string;
};

const W = Dimensions.get('window').width;

const RECENTS: Room[] = new Array(8).fill(0).map((_, i) => ({
  id: `r${i+1}`,
  title: `غرفة زرتها ${i+1}`,
  avatar: `https://i.pravatar.cc/120?img=${(i%60)+1}`,
  cover: `https://picsum.photos/seed/rc${i}/1200/600`,
  listeners: 60 + i * 9,
  country: ['SA','LB','KW','SY'][i%4],
}));

const FEATURED: Room[] = [
  { id:'f1', title:'إذاعة Binmo الرسمي', avatar:'https://i.pravatar.cc/120?img=15', cover:'https://picsum.photos/seed/f1/800/600', listeners:480, country:'SA' },
  { id:'f2', title:'نقطة و سطر جديد...', avatar:'https://i.pravatar.cc/120?img=22', cover:'https://picsum.photos/seed/f2/800/600', listeners:65, country:'SA' },
];

const HOSTS = new Array(8).fill(0).map((_,i)=>({
  id:`h${i}`, name:`مضيف ${i+1}`, avatar:`https://i.pravatar.cc/100?img=${(i%60)+1}`,
}));

export default function Rooms() {
  const [mode, setMode] = React.useState<'list' | 'grid'>('grid'); // keep your toggle
  const [tab, setTab] = React.useState<'my' | 'trend' | 'celeb'>('my'); // RTL order handled in UI
  const [query, setQuery] = React.useState('');

  const filtered = React.useMemo(() => {
    const q = query.trim();
    if (!q) return RECENTS;
    return RECENTS.filter(r => r.title.includes(q));
  }, [query]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F7FA' }}>
      {/* --- Cherry header with RTL top tabs --- */}
      <LinearGradient colors={[PALETTE.soft1, PALETTE.soft3]} start={{x:0,y:0}} end={{x:1,y:0}} style={styles.headerGrad}>
        <View style={styles.headerRow}>
          {/* Left side: bigger home icon + search */}
          <View style={styles.leftIcons}>
            <View style={styles.homeBubble}>
              <MaterialCommunityIcons name="home-variant" size={22} color={PALETTE.primaryDark} />
            </View>
            <Pressable style={styles.iconBtn}><Ionicons name="search" size={18} color={PALETTE.textDark} /></Pressable>
          </View>

          {/* Tabs: RTL order: المشاهير | ترند | الخاص بي (rightmost is first) */}
          <View style={styles.segments}>
            {[
              { key: 'my',    label: 'الخاص بي' },
              { key: 'trend', label: 'ترند' },
              { key: 'celeb', label: 'المشاهير' },
            ].map((t) => {
              const active = tab === (t.key as any);
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

      {/* Search (kept) */}
      <View style={styles.searchWrap}>
        <Ionicons name="search" size={16} color="#8E8E93" />
        <TextInput
          style={styles.searchInput}
          placeholder="ابحث عن غرفة"
          placeholderTextColor="#A1A1A1"
          value={query}
          onChangeText={setQuery}
          textAlign="right"
        />
        {/* View mode toggle */}
        <View style={styles.toggleWrap}>
          <Pressable onPress={() => setMode('list')} style={[styles.toggleBtn, mode === 'list' && styles.toggleActive]}>
            <MaterialCommunityIcons name="view-list" size={16} />
            <Text style={[styles.toggleTxt, mode === 'list' && styles.toggleTxtActive]}>قائمة</Text>
          </Pressable>
          <Pressable onPress={() => setMode('grid')} style={[styles.toggleBtn, mode === 'grid' && styles.toggleActive]}>
            <MaterialCommunityIcons name="view-grid" size={16} />
            <Text style={[styles.toggleTxt, mode === 'grid' && styles.toggleTxtActive]}>شبكة</Text>
          </Pressable>
        </View>
      </View>

      {/* Body by top tab */}
      {tab === 'my' && <MyTab filtered={filtered} mode={mode} />}
      {tab === 'trend' && <TrendTab mode={mode} />}
      {tab === 'celeb' && <CelebTab mode={mode} />}
    </SafeAreaView>
  );
}

/* -------- Tab: الخاص بي (مريم) -------- */
function MyTab({ filtered, mode }: { filtered: Room[]; mode: 'list'|'grid' }) {
  // مريم + غرفتها أعلى القائمة
  const myRoom: Room = {
    id:'maryam-room',
    title:'غرفتي - مريم',
    avatar:'https://i.pravatar.cc/120?img=5',
    cover:'https://picsum.photos/seed/maryam/1200/600',
    listeners: 132,
    country:'SA',
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
      {/* My room card */}
      <View style={{ paddingHorizontal: 12, paddingTop: 12 }}>
        <View style={styles.myCard}>
          <Image source={{ uri: myRoom.cover! }} style={styles.myCover} />
          <Image source={{ uri: myRoom.avatar }} style={styles.myAvatar} />
          <Text style={styles.myTitle} numberOfLines={1}>{myRoom.title}</Text>
          <View style={styles.myMetaRow}>
            <View style={styles.metaPill}><Text style={styles.metaPillTxt}>{myRoom.country}</Text></View>
            <View style={{flexDirection:'row-reverse', alignItems:'center', gap:4}}>
              <Ionicons name="radio" size={12} color={PALETTE.okGreen}/>
              <Text style={styles.metaCount}>{myRoom.listeners}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Recently visited by مريم */}
      <Text style={styles.sectionTitle}>الزيارات الأخيرة</Text>
      {mode === 'list'
        ? <FlatList
            data={filtered}
            key={'list-my'}
            keyExtractor={(r)=>r.id}
            contentContainerStyle={{ paddingHorizontal: 12 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => <ListCard room={item} />}
          />
        : <FlatList
            data={filtered}
            key={'grid-my'}
            keyExtractor={(r)=>r.id}
            numColumns={2}
            contentContainerStyle={{ paddingHorizontal: 10 }}
            columnWrapperStyle={{ gap: 10 }}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => <GridCard room={item} />}
          />
      }
    </ScrollView>
  );
}

/* -------- Tab: ترند -------- */
function TrendTab({ mode }: { mode: 'list'|'grid' }) {
  const data = RECENTS.map((r, i) => ({ ...r, title: i%2? 'وكالة أرز لبنان':'بوليفارد سيتي الرياض'}));
  return mode === 'list'
    ? <FlatList data={data} key={'list-tr'} keyExtractor={(r)=>r.id} contentContainerStyle={{ padding:12, paddingBottom: 28 }} ItemSeparatorComponent={()=><View style={{height:10}}/>} renderItem={({item})=> <ListCard room={item}/> }/>
    : <FlatList data={data} key={'grid-tr'} keyExtractor={(r)=>r.id} numColumns={2} contentContainerStyle={{ paddingBottom:28, paddingHorizontal:10 }} columnWrapperStyle={{gap:10}} ItemSeparatorComponent={()=><View style={{height:10}}/>} renderItem={({item})=> <GridCard room={item}/> }/>;
}

/* -------- Tab: المشاهير (RTL + المضيفين المقترحين) -------- */
function CelebTab({ mode }: { mode: 'list'|'grid' }) {
  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 28 }}>
      {/* Featured programs row */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hlist}>
        {FEATURED.map((f)=>(
          <View key={f.id} style={styles.featureCard}>
            <Image source={{ uri: f.cover! }} style={styles.featureImg}/>
            <Text style={styles.featureTitle} numberOfLines={1}>{f.title}</Text>
            <View style={styles.featureMeta}>
              <View style={{flexDirection:'row-reverse', alignItems:'center', gap:4}}>
                <Ionicons name="radio" size={12} color={PALETTE.okGreen}/>
                <Text style={styles.metaCount}>{f.listeners}</Text>
              </View>
              <View style={styles.metaPill}><Text style={styles.metaPillTxt}>{f.country}</Text></View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* المضيفين المقترحين (RTL) */}
      <Text style={styles.subHeader}>المضيفين المقترحين</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.hlist,{paddingVertical:6, flexDirection:'row-reverse'}]}>
        {HOSTS.map(h=>(
          <View key={h.id} style={{ alignItems:'center', width:64 }}>
            <View style={styles.storyRing}>
              <Image source={{ uri: h.avatar }} style={styles.storyAvatar}/>
            </View>
            <Text numberOfLines={1} style={styles.storyName}>{h.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Grid/List below */}
      {mode === 'list'
        ? <FlatList data={RECENTS} key={'list-ce'} keyExtractor={(r)=>r.id} contentContainerStyle={{ padding:12 }} ItemSeparatorComponent={()=><View style={{height:10}}/>} renderItem={({item})=> <ListCard room={item}/> }/>
        : <FlatList data={RECENTS} key={'grid-ce'} keyExtractor={(r)=>r.id} numColumns={2} contentContainerStyle={{ paddingHorizontal:10 }} columnWrapperStyle={{gap:10}} ItemSeparatorComponent={()=><View style={{height:10}}/>} renderItem={({item})=> <GridCard room={item}/> }/>
      }
    </ScrollView>
  );
}

/* ---- Shared small components (use cherry accents) ---- */
function ListCard({ room }: { room: Room }) {
  return (
    <View style={styles.cardList}>
      <ImageBackground source={{ uri: room.cover! }} style={styles.cover} imageStyle={{ borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
        <View style={styles.badgeLive}>
          <Ionicons name="radio" size={12} color="#fff" />
          <Text style={styles.badgeTxt}>{room.listeners} مستمع</Text>
        </View>
      </ImageBackground>
      <View style={styles.cardBody}>
        <Text style={styles.roomTitle} numberOfLines={1}>{room.title}</Text>
        <View style={{ flexDirection: 'row-reverse', alignItems: 'center', gap: 6 }}>
          <View style={styles.metaPill}><Text style={styles.metaPillTxt}>{room.country ?? 'SA'}</Text></View>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Pressable style={styles.joinBtn} onPress={() => {}}>
          <MaterialCommunityIcons name="microphone" size={16} color="#fff" />
          <Text style={styles.joinTxt}>انضم</Text>
        </Pressable>
      </View>
    </View>
  );
}

function GridCard({ room }: { room: Room }) {
  return (
    <LinearGradient colors={['#FFF1F5', '#FFE0E7']} start={{x:0,y:0}} end={{x:1,y:1}} style={styles.skinCard}>
      <Image source={{ uri: room.avatar }} style={styles.skinAvatar}/>
      <Text style={styles.skinTitle} numberOfLines={1}>{room.title}</Text>
      <View style={styles.skinMetaRow}>
        <View style={styles.metaPill}><Text style={styles.metaPillTxt}>{room.country ?? 'SA'}</Text></View>
        <View style={{flexDirection:'row-reverse', alignItems:'center', gap:4}}>
          <Ionicons name="radio" size={12} color={PALETTE.okGreen}/>
          <Text style={styles.metaCount}>{room.listeners}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

/* ---------------- Styles (Cherry Blossom) ---------------- */
const styles = StyleSheet.create({
  headerGrad: { paddingTop: 10, paddingBottom: 12, paddingHorizontal: 12 },
  headerRow: { flexDirection: 'row-reverse', alignItems: 'center', justifyContent: 'space-between' },

  leftIcons: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  homeBubble: { backgroundColor: '#FFE7EE', borderRadius: 12, padding: 8, borderWidth: 1, borderColor: '#FFD4E0' },
  iconBtn: { backgroundColor: '#F2F4F7', borderRadius: 10, padding: 6 },

  segments: { flexDirection: 'row-reverse', alignItems: 'flex-end', gap: 24 },
  segItem: { alignItems: 'center' },
  segTxt: { fontWeight: '700', color: PALETTE.textDim, fontSize: 18 },
  segTxtActive: { color: PALETTE.primaryDark, fontWeight: '900' },
  segUnderline: { height: 3, width: 30, backgroundColor: 'transparent', marginTop: 6, borderRadius: 2 },
  segUnderlineActive: { backgroundColor: PALETTE.primaryDark },

  searchWrap: { paddingHorizontal: 12, paddingTop: 8, paddingBottom: 8, flexDirection:'row-reverse', alignItems:'center', gap: 8 },
  searchInput: { flex: 1, fontSize: 14, paddingVertical: 0, textAlign: 'right' },

  toggleWrap: { flexDirection:'row', gap: 6, backgroundColor: '#EFF3F8', padding: 4, borderRadius: 999 },
  toggleBtn: { flexDirection:'row', gap: 6, alignItems:'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999 },
  toggleActive: { backgroundColor: '#FFFFFF', shadowColor:'#000', shadowOpacity:0.06, shadowRadius:6, elevation:1 },
  toggleTxt: { fontWeight: '700', color: '#6B7280' },
  toggleTxtActive: { color: '#111827' },

  /* My room */
  myCard: { backgroundColor:'#FFFFFF', borderRadius:16, overflow:'hidden', paddingBottom:10 },
  myCover: { width:'100%', height:120 },
  myAvatar: { width:48, height:48, borderRadius:12, position:'absolute', top: 90, right: 12, borderWidth:2, borderColor:'#fff' },
  myTitle: { textAlign:'right', fontWeight:'800', marginTop: 18, marginHorizontal:12 },
  myMetaRow: { flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between', marginTop:6, marginHorizontal:12 },

  sectionTitle: { fontWeight:'900', color:PALETTE.primaryDark, textAlign:'right', marginHorizontal:12, marginTop:16, marginBottom:8 },

  /* Pills & counts */
  metaPill: { backgroundColor:'#FFE7EE', paddingHorizontal:8, paddingVertical:3, borderRadius:999 },
  metaPillTxt: { color: PALETTE.primaryDark, fontWeight:'700', fontSize:12 },
  metaCount: { fontWeight:'700' },

  /* List cards */
  cardList: { backgroundColor:'#FFFFFF', borderRadius:16, overflow:'hidden' },
  cover: { width:'100%', height:120 },
  badgeLive: { position:'absolute', top:8, right:8, backgroundColor:'rgba(0,0,0,0.6)', flexDirection:'row-reverse', alignItems:'center', gap:4, paddingHorizontal:8, paddingVertical:4, borderRadius:12 },
  badgeTxt: { color:'#fff', fontSize:11 },
  cardBody: { paddingHorizontal:12, paddingTop:8, paddingBottom:6, flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between' },
  roomTitle: { fontWeight:'800', flex:1, textAlign:'right', marginLeft:8 },
  cardFooter: { paddingHorizontal:12, paddingBottom:12, flexDirection:'row-reverse', justifyContent:'space-between', alignItems:'center' },
  joinBtn: { backgroundColor: PALETTE.primary, borderRadius:10, paddingHorizontal:14, paddingVertical:8, flexDirection:'row-reverse', gap:6, alignItems:'center' },
  joinTxt: { color:'#fff', fontWeight:'700' },

  /* Grid skin cards */
  skinCard: { width:(W-30)/2, borderRadius:16, padding:12, minHeight:160, alignItems:'center', justifyContent:'center', overflow:'hidden' },
  skinAvatar: { width:64, height:64, borderRadius:32, backgroundColor:'#fff', marginBottom:8 },
  skinTitle: { fontWeight:'800', textAlign:'center', maxWidth:(W-30)/2 - 24 },
  skinMetaRow: { position:'absolute', bottom:10, right:12, left:12, flexDirection:'row', justifyContent:'space-between', alignItems:'center' },

  /* Featured row */
  hlist: { paddingHorizontal: 12, gap: 10, paddingTop: 8 },
  featureCard: { width: W*0.6, backgroundColor:'#fff', borderRadius:16, overflow:'hidden', paddingBottom:8 },
  featureImg: { width:'100%', height:120 },
  featureTitle: { textAlign:'right', fontWeight:'800', marginTop:8, marginHorizontal:10 },
  featureMeta: { flexDirection:'row-reverse', justifyContent:'space-between', alignItems:'center', marginTop:6, marginHorizontal:10 },

  /* Stories (RTL) */
  storyRing: { padding:2, borderRadius:999, backgroundColor:'#FFE7EE' },
  storyAvatar: { width:48, height:48, borderRadius:24, backgroundColor:'#fff' },
  storyName: { fontSize:11, marginTop:4, maxWidth:60, textAlign:'center' },
});
