import * as React from 'react';
import { View, Text, StyleSheet, Image, Pressable, Modal, ScrollView, SafeAreaView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { PALETTE } from '../../lib/theme';

export default function RoomScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = React.useState(false);

  const host = {
    name: 'مريم',
    id: '23733397',
    avatar: 'https://i.pravatar.cc/120?img=5',
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
      <LinearGradient colors={['#590D22', '#C9184A']} start={{x:0,y:0}} end={{x:0,y:1}} style={{ flex: 1 }}>
        {/* TOP BAR */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.topBtn}>
            <MaterialCommunityIcons name="chevron-right" size={20} color="#fff" />
          </Pressable>

          <View style={styles.roomHeader}>
            <Text style={styles.roomHost} numberOfLines={1}>{host.name}</Text>
            <Text style={styles.roomId}>ID:{host.id}</Text>
          </View>

          <Pressable onPress={() => setSettingsOpen(true)} style={styles.topBtn}>
            <MaterialCommunityIcons name="dots-horizontal" size={20} color="#fff" />
          </Pressable>
        </View>

        {/* HOST AVATAR + SCORE */}
        <View style={styles.hostRow}>
          <Image source={{ uri: host.avatar }} style={styles.hostAvatar} />
          <View style={styles.scorePill}>
            <MaterialCommunityIcons name="chevron-left" size={14} color="#D4E7E3" />
            <Text style={{ color:'#D4E7E3', fontWeight:'800' }}>0</Text>
            <MaterialCommunityIcons name="trophy" size={14} color="#FFD66E" />
          </View>
        </View>

        {/* SEATS GRID */}
        <View style={styles.seatsGrid}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={styles.seat}>
              <MaterialCommunityIcons name="microphone" size={20} color="rgba(255,255,255,0.8)" />
              <Text style={styles.seatLabel}>No.{12 - i}</Text>
            </View>
          ))}
        </View>

        {/* CHAT AREA (preview) */}
        <View style={styles.chatWrap}>
          <View style={styles.chatTabs}>
            <Text style={[styles.chatTab, styles.chatTabActive]}>الكل</Text>
            <Text style={styles.chatTab}>الدردشة</Text>
          </View>

          <View style={styles.msgBubble}>
            <Text style={styles.msgTitle}>إعلان</Text>
            <Text style={styles.msgText}>أصدقائي، دعونا نتحدث! 🥰😉</Text>
          </View>

          {/* JOIN ROW */}
          <View style={styles.joinRow}>
            <View style={styles.joinLeft}>
              <MaterialCommunityIcons name="hand-okay" size={16} color="#fff" />
              <Text style={styles.joinUser}>مريم</Text>
              <View style={styles.joinCounter}><Text style={styles.joinCounterTxt}>0</Text></View>
            </View>
            <Pressable style={styles.joinBtn}>
              <MaterialCommunityIcons name="microphone" size={16} color="#fff" />
              <Text style={styles.joinBtnTxt}>دخل</Text>
            </Pressable>
          </View>
        </View>

        {/* FLOATING ADS / ACTIONS (design only) */}
        <View style={styles.fabCol}>
          <Image source={{ uri: 'https://i.imgur.com/8QH3B2G.png' }} style={styles.sticker} />
          <Image source={{ uri: 'https://i.imgur.com/2QfG2bT.png' }} style={[styles.sticker, { marginTop: 10 }]} />
        </View>

        <View style={styles.bottomActions}>
          {[
            { icon: 'gift-outline' },
            { icon: 'gamepad-circle-outline' },
            { icon: 'email-outline' },
            { icon: 'dots-grid' },
            { icon: 'dots-horizontal-circle-outline' },
          ].map((a, idx) => (
            <View key={idx} style={styles.actionBubble}>
              <MaterialCommunityIcons name={a.icon as any} size={20} color="#fff" />
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* SETTINGS SHEET */}
      <Modal transparent animationType="slide" visible={settingsOpen} onRequestClose={() => setSettingsOpen(false)}>
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>إعدادات الغرفة</Text>
            <ScrollView contentContainerStyle={styles.grid}>
              {[
                { label:'قفل', icon:'lock-outline' },
                { label:'الخلفية', icon:'image-outline' },
                { label:'إدارة المايك', icon:'microphone-settings' },
                { label:'تعديل الغرفة', icon:'cog-outline' },
                { label:'الديكور', icon:'brush' },
                { label:'أنشطة الغرفة', icon:'account-group-outline' },
                { label:'موسيقى', icon:'music' },
                { label:'صرف', icon:'cash' },
                { label:'تأثيرات المايك', icon:'waveform' },
                { label:'تأثيرات الهوية', icon:'account-badge-outline' },
                { label:'شاشة واضحة', icon:'monitor-eye' },
                { label:'كتم الصوت', icon:'microphone-off' },
                { label:'مغير الصوت', icon:'tune-variant' },
                { label:'عازل صوت', icon:'equalizer' },
              ].map((item) => (
                <View key={item.label} style={styles.gridItem}>
                  <View style={styles.gridIcon}>
                    <MaterialCommunityIcons name={item.icon as any} size={20} color={PALETTE.primaryDark} />
                  </View>
                  <Text style={styles.gridLabel}>{item.label}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable onPress={() => setSettingsOpen(false)} style={styles.sheetClose}>
              <Text style={{ color: '#fff', fontWeight: '800' }}>إغلاق</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, paddingTop:6 },
  topBtn: { padding:6 },
  roomHeader: { flexDirection:'column', alignItems:'flex-end' },
  roomHost: { color:'#fff', fontWeight:'900', fontSize:16 },
  roomId: { color:'#D0E7E4', fontSize:12 },

  hostRow: { flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingHorizontal:12, marginTop:6 },
  hostAvatar: { width:32, height:32, borderRadius:16, borderWidth:2, borderColor:'rgba(255,255,255,0.6)' },
  scorePill: { flexDirection:'row', alignItems:'center', gap:6, backgroundColor:'rgba(0,0,0,0.25)', paddingHorizontal:10, paddingVertical:6, borderRadius:12 },

  seatsGrid: { flexDirection:'row', flexWrap:'wrap', justifyContent:'space-between', gap:12, paddingHorizontal:16, paddingTop:12 },
  seat: { width:'15%', aspectRatio:1, minWidth:48, borderRadius:999, borderWidth:1, borderColor:'rgba(255,255,255,0.25)', alignItems:'center', justifyContent:'center', marginHorizontal:4, marginVertical:6 },
  seatLabel: { color:'rgba(255,255,255,0.85)', fontSize:10, marginTop:6 },

  chatWrap: { flex:1, marginTop:8, paddingHorizontal:12 },
  chatTabs: { flexDirection:'row-reverse', gap:16, marginBottom:8 },
  chatTab: { color:'#D0E7E4' },
  chatTabActive: { color:'#fff', fontWeight:'800', borderBottomWidth:2, borderBottomColor:'#fff' },

  msgBubble: { backgroundColor:'rgba(0,0,0,0.25)', borderRadius:12, padding:10, marginTop:6 },
  msgTitle: { color:'#A7E9D8', fontWeight:'900', marginBottom:4 },
  msgText: { color:'#fff' },

  joinRow: { marginTop:10, flexDirection:'row-reverse', alignItems:'center', justifyContent:'space-between' },
  joinLeft: { flexDirection:'row-reverse', alignItems:'center', gap:6, backgroundColor:'rgba(0,0,0,0.25)', paddingHorizontal:10, paddingVertical:6, borderRadius:12 },
  joinUser: { color:'#fff', fontWeight:'800' },
  joinCounter: { backgroundColor:'rgba(255,255,255,0.25)', paddingHorizontal:6, paddingVertical:2, borderRadius:8 },
  joinCounterTxt: { color:'#fff', fontWeight:'800' },
  joinBtn: { backgroundColor:'rgba(0,0,0,0.35)', paddingHorizontal:16, paddingVertical:8, borderRadius:12, flexDirection:'row-reverse', alignItems:'center', gap:6 },
  joinBtnTxt: { color:'#fff', fontWeight:'900' },

  fabCol: { position:'absolute', left:8, bottom:120, gap:10 },
  sticker: { width:44, height:44, borderRadius:10, opacity:0.9 },

  bottomActions: { position:'absolute', bottom:16, right:0, left:0, flexDirection:'row', justifyContent:'space-around', paddingHorizontal:16 },
  actionBubble: { width:44, height:44, borderRadius:22, backgroundColor:'rgba(255,255,255,0.2)', alignItems:'center', justifyContent:'center', borderWidth:1, borderColor:'rgba(255,255,255,0.35)' },

  // Settings sheet
  sheetBackdrop: { flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'flex-end' },
  sheet: { backgroundColor:'#142D33', borderTopLeftRadius:16, borderTopRightRadius:16, paddingTop:10 },
  sheetTitle: { color:'#E7F7F4', fontWeight:'900', textAlign:'right', marginHorizontal:16, marginBottom:6 },
  grid: { flexDirection:'row-reverse', flexWrap:'wrap', gap:14, paddingHorizontal:16, paddingBottom:16 },
  gridItem: { width:'22%', alignItems:'center', gap:6, marginVertical:6 },
  gridIcon: { width:40, height:40, borderRadius:12, backgroundColor:'#EAF5F2', alignItems:'center', justifyContent:'center' },
  gridLabel: { color:'#D7EEEA', fontSize:12, textAlign:'center' },
  sheetClose: { marginTop:6, marginHorizontal:16, backgroundColor: PALETTE.primary, borderRadius:12, alignItems:'center', paddingVertical:10, marginBottom:12 },
});
