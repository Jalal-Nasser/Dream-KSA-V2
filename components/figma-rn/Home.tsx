import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, Gift, Bell, Plus, Search as SearchIcon } from 'lucide-react-native';

type Speaker = {
  id: string;
  name: string;
  avatar?: string;
  isSpeaking: boolean;
  role?: 'owner' | 'speaker' | 'listener';
};

type Room = {
  id: string;
  name: string;
  topic: string;
  participants: number;
  maxParticipants: number;
  isLive: boolean;
  isHot?: boolean;
  category: string;
  image?: string;
  speakers: Speaker[];
};

const CATEGORIES = [
  { name: 'الكل' },
  { name: 'مشهور' },
  { name: 'تقنية' },
  { name: 'موسيقى' },
  { name: 'تعليم' },
  { name: 'اجتماعي' },
];

const SAMPLE_ROOMS: Room[] = [
  {
    id: '1',
    name: 'وحكايةُ صُحبةٍ وحلاوةُ',
    topic: 'غرفة قهوة الشباب و الأنبساط',
    participants: 457,
    maxParticipants: 500,
    isLive: true,
    isHot: true,
    category: 'اجتماعي',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&h=600&fit=crop',
    speakers: [],
  },
  {
    id: '2',
    name: 'قهوة صباحية و إهداءات',
    topic: 'غاية ذوكل وكالة المائة الراقية',
    participants: 430,
    maxParticipants: 500,
    isLive: true,
    isHot: true,
    category: 'موسيقى',
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&h=600&fit=crop',
    speakers: [],
  },
  {
    id: '3',
    name: 'مقرات منوعة 🌹 وكالة',
    topic: 'أحلى الأوقات مع الأصدقاء',
    participants: 408,
    maxParticipants: 500,
    isLive: true,
    category: 'اجتماعي',
    image: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
    speakers: [],
  },
  {
    id: '4',
    name: 'وقت الة مدهشة 👑',
    topic: 'لحظات جميلة وذكريات رائعة',
    participants: 354,
    maxParticipants: 400,
    isLive: true,
    category: 'تعليم',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop',
    speakers: [],
  },
];

interface FigmaRNHomeProps {
  onRoomJoin: (roomId: string) => void;
  onProfileOpen: () => void;
}

export default function FigmaRNHome({ onRoomJoin, onProfileOpen }: FigmaRNHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');

  const filteredRooms = useMemo(() => {
    return SAMPLE_ROOMS.filter((room) => {
      const matchesSearch =
        room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        room.topic.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'الكل' || (selectedCategory === 'مشهور' && room.isHot) || room.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  return (
    <LinearGradient colors={["#7c3aed", "#ec4899", "#3b82f6"]} locations={[0.05, 0.5, 0.95]} style={styles.container}>
      <ScrollView contentContainerStyle={{ paddingBottom: 28 }} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.flagBox}>
              <Text style={styles.flagText}>🇸🇦</Text>
              <Mic color="#fff" size={16} />
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.appTitle}>Dream KSA</Text>
              <Text style={styles.appSubtitle}>غرف الدردشة الصوتية</Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <Pressable style={styles.headerIconBtn}>
              <Gift color="#fff" size={20} />
            </Pressable>
            <Pressable style={[styles.headerIconBtn, { marginLeft: 8 }]}>
              <Bell color="#fff" size={20} />
            </Pressable>
            <Pressable style={[styles.headerIconBtn, { marginLeft: 8 }]}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face' }}
                style={styles.avatar}
              />
            </Pressable>
          </View>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <SearchIcon color="#94a3b8" size={18} style={{ marginLeft: 8 }} />
          <TextInput
            style={styles.searchInput}
            placeholder="ابحث عن غرفة أو موضوع"
            placeholderTextColor="#cbd5e1"
            value={searchQuery}
            onChangeText={setSearchQuery}
            textAlign="right"
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoriesContainer}>
          {CATEGORIES.map((c, i) => {
            const active = c.name === selectedCategory;
            return (
              <Pressable key={c.name} onPress={() => setSelectedCategory(c.name)} style={[styles.categoryChip, active && styles.categoryChipActive]}>
                <Text style={[styles.categoryText, active && styles.categoryTextActive]}>{c.name}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Section header */}
        <View style={styles.sectionHeaderRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>
              {selectedCategory === 'الكل' ? 'جميع الغرف' : selectedCategory === 'مشهور' ? 'الغرف الشائعة' : `غرف ${selectedCategory}`}
            </Text>
          </View>
          <Pressable style={styles.createBtn}>
            <Plus color="#fff" size={18} />
            <Text style={styles.createBtnText}>إنشاء غرفة</Text>
          </Pressable>
        </View>

        {/* Rooms grid */}
        <View style={styles.roomsGrid}>
          {filteredRooms.map((room) => (
            <View key={room.id} style={styles.roomCard}>
              <Image source={{ uri: room.image }} style={styles.roomImage} />
              <View style={styles.roomOverlay} />
              <View style={styles.roomTopRow}>
                {room.isLive && (
                  <View style={[styles.badge, { backgroundColor: '#ef4444' }]}>
                    <Text style={styles.badgeText}>مباشر</Text>
                  </View>
                )}
                {room.isHot && (
                  <View style={[styles.badge, { backgroundColor: '#f59e0b' }]}>
                    <Text style={styles.badgeText}>شائع</Text>
                  </View>
                )}
              </View>
              <Text style={styles.roomName} numberOfLines={1}>{room.name}</Text>
              <Text style={styles.roomTopic} numberOfLines={1}>{room.topic}</Text>
              <View style={styles.roomStatsRow}>
                <View style={styles.statPill}><Text style={styles.statPillText}>{room.participants}</Text></View>
                <View style={styles.statPill}><Text style={styles.statPillText}>{room.maxParticipants}</Text></View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  headerIconBtn: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    padding: 8,
    borderRadius: 12,
  },
  flagBox: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagText: { color: '#fff', fontSize: 12, marginRight: 6 },
  appTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  appSubtitle: { color: '#e0e7ff', fontSize: 12 },
  avatar: { width: 34, height: 34, borderRadius: 10 },
  searchRow: {
    marginHorizontal: 16,
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: { color: '#fff', fontSize: 14, flex: 1 },
  categoriesContainer: { paddingHorizontal: 10, paddingVertical: 10 },
  categoryChip: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  categoryChipActive: { backgroundColor: '#4d9ef6' },
  categoryText: { color: '#4d9ef6', fontWeight: 'bold' },
  categoryTextActive: { color: '#fff' },
  sectionHeaderRow: {
    marginTop: 6,
    marginHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  createBtn: {
    backgroundColor: '#4d9ef6',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  createBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13, marginLeft: 6 },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 10,
  },
  roomCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
  },
  roomImage: { width: '100%', height: 90 },
  roomOverlay: { position: 'absolute', left: 0, right: 0, top: 0, height: 90, backgroundColor: 'rgba(0,0,0,0.2)' },
  roomTopRow: { position: 'absolute', top: 8, left: 8, right: 8, flexDirection: 'row', justifyContent: 'space-between' },
  badge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  roomName: { color: '#111827', fontWeight: '600', fontSize: 13, marginTop: 8, marginHorizontal: 8, textAlign: 'right' },
  roomTopic: { color: '#6b7280', fontSize: 11, marginTop: 2, marginHorizontal: 8, marginBottom: 6, textAlign: 'right' },
  roomStatsRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginHorizontal: 8, marginBottom: 10 },
  statPill: { backgroundColor: '#e0e7ff', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
  statPillText: { color: '#4d9ef6', fontSize: 11, fontWeight: 'bold' },
});


