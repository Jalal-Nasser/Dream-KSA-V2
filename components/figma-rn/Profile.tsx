import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Gift, Edit3, Coins, ChevronRight } from 'lucide-react-native';

interface FigmaRNProfileProps {
  onBack: () => void;
}

export default function FigmaRNProfile({ onBack }: FigmaRNProfileProps) {
  const [following, setFollowing] = useState(false);

  return (
    <LinearGradient colors={["#1F2937", "#111827", "#0A0E15"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.headerBtn}>
            <Settings color="#fff" size={20} />
          </Pressable>
          <Pressable style={styles.headerBtn}>
            <Gift color="#fff" size={20} />
          </Pressable>
        </View>

        {/* Profile Card */}
        <View style={styles.card}>
          <View style={{ alignItems: 'center' }}>
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face' }}
                style={styles.avatar}
              />
              <View style={styles.online} />
              <Pressable style={styles.editFab}>
                <Edit3 color="#fff" size={18} />
              </Pressable>
            </View>
            <Text style={styles.name}>عبدالله القحطاني</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}><Text style={styles.statNum}>1.2k</Text><Text style={styles.statLabel}>متابع</Text></View>
              <View style={styles.statItem}><Text style={styles.statNum}>500</Text><Text style={styles.statLabel}>متابع</Text></View>
              <View style={styles.statItem}><Text style={styles.statNum}>3.4k</Text><Text style={styles.statLabel}>إعجاب</Text></View>
            </View>

            <View style={styles.actionsRow}>
              <Pressable onPress={() => setFollowing((v) => !v)} style={styles.followBtn}>
                <Text style={styles.followText}>{following ? 'يتابع' : '+ متابعة'}</Text>
              </Pressable>
            </View>
          </View>
        </View>

        {/* Menu */}
        <View style={styles.menuCard}>
          {[
            { name: 'محطة', color: '#f59e0b' },
            { name: 'متجر', color: '#10b981' },
            { name: 'وكالة', color: '#3b82f6' },
            { name: 'مهام', color: '#6366f1', badge: 'مكافآت' },
            { name: 'الزيارات الأخيرة', color: '#9ca3af' },
            { name: 'خدمة العملاء', color: '#9ca3af' },
            { name: 'اللغة', color: '#a855f7', badge: 'أول شجعة' },
            { name: 'إعدادات', color: '#9ca3af' },
          ].map((item, idx) => (
            <View key={idx} style={styles.menuRow}>
              <View style={styles.menuLeft}>
                <View style={[styles.menuIconBox, { backgroundColor: `${item.color}20` }]}> 
                  <Coins color={item.color} size={18 as any} />
                </View>
                <Text style={styles.menuText}>{item.name}</Text>
                {item.badge && <View style={styles.badge}><Text style={styles.badgeText}>{item.badge}</Text></View>}
              </View>
              <ChevronRight color="#9ca3af" size={16} />
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, marginBottom: 8 },
  headerBtn: { padding: 8 },
  card: { backgroundColor: '#1f2937', borderRadius: 24, padding: 20, marginBottom: 16 },
  avatarWrap: { width: 128, height: 128, borderRadius: 64, borderWidth: 4, borderColor: '#374151', position: 'relative' },
  avatar: { width: '100%', height: '100%', borderRadius: 64 },
  online: { position: 'absolute', bottom: 8, right: 8, width: 16, height: 16, borderRadius: 8, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#1f2937' },
  editFab: { position: 'absolute', bottom: 0, right: 0, width: 40, height: 40, borderRadius: 20, backgroundColor: '#3b82f6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#1f2937' },
  name: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginTop: 12, marginBottom: 12 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 16, width: '100%' },
  statItem: { alignItems: 'center' },
  statNum: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  statLabel: { color: '#9ca3af', fontSize: 12 },
  actionsRow: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  followBtn: { backgroundColor: '#3b82f6', borderRadius: 12, paddingHorizontal: 20, paddingVertical: 12 },
  followText: { color: '#fff', fontWeight: 'bold' },
  menuCard: { backgroundColor: '#1f2937', borderRadius: 24, overflow: 'hidden' },
  menuRow: { flexDirection: 'row-reverse', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.08)' },
  menuLeft: { flexDirection: 'row-reverse', alignItems: 'center' },
  menuIconBox: { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  menuText: { color: '#e5e7eb', fontSize: 14 },
  badge: { backgroundColor: '#f59e0b', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginRight: 8 },
  badgeText: { color: '#111827', fontWeight: 'bold', fontSize: 10 },
});


