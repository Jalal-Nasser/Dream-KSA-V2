import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bell,
  Plus,
  Search,
  Star,
  Music,
  MessageCircle,
  Users,
  Calendar,
} from 'lucide-react-native';
import RoomCard from './RoomCard';

export default function HomePage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  
  return (
    <LinearGradient colors={["#e664fa", "#4d9ef6"]} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
        {/* Gradient Header */}
        <View style={[homeStyles.header, { paddingTop: insets.top + 10 }]}> 
          <View style={homeStyles.headerLeft}>
            <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={homeStyles.avatar} />
            <Bell color="#fff" size={22} style={{ marginLeft: 8 }} />
          </View>
          <View style={homeStyles.headerCenter}>
            <Text style={homeStyles.headerTitle}>Dream KSA</Text>
            <Text style={homeStyles.headerSubtitle}>غرف الدردشة الصوتية</Text>
          </View>
          <View style={homeStyles.headerRight}>
            <Pressable style={homeStyles.headerButton}>
              <Plus color="#fff" size={22} />
            </Pressable>
          </View>
        </View>

        {/* Search Bar */}
        <View style={homeStyles.searchContainer}>
          <TextInput
            style={homeStyles.searchInput}
            placeholder="ابحث عن غرفة أو موضوع"
            placeholderTextColor="#fff"
          />
        </View>

        {/* Category Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={homeStyles.chipsScroll} contentContainerStyle={homeStyles.chipsContainer}>
          {['الكل', 'مشهور', 'تقنية', 'موسيقى', 'تعليم'].map((cat, i) => (
            <Pressable key={cat} style={[homeStyles.chip, i === 0 && homeStyles.chipActive]}>
              <Text style={[homeStyles.chipText, i === 0 && homeStyles.chipTextActive]}>{cat}</Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Create Room Button */}
        <View style={homeStyles.createRoomRow}>
          <Text style={homeStyles.roomsCount}>جميع الغرف <Text style={{ color: '#6d28d9' }}>6</Text></Text>
          <Pressable style={homeStyles.createRoomBtn} onPress={() => router.push('/createroom') }>
            <Plus color="#fff" size={18} />
            <Text style={homeStyles.createRoomText}>إنشاء غرفة</Text>
          </Pressable>
        </View>

        {/* Room Cards Grid */}
        <View style={homeStyles.roomsGrid}>
          {[1,2,3,4,5,6].map((i) => (
            <Pressable
              key={i}
              style={homeStyles.roomCard}
              onPress={() => router.push(`/voicechat?roomId=room${i}`)}
            >
              <Image source={{ uri: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' }} style={homeStyles.roomImage} />
              <View style={homeStyles.roomOverlay} />
              <View style={homeStyles.roomTopRow}>
                <View style={homeStyles.roomLiveBadge}><Text style={homeStyles.roomLiveText}>مباشر</Text></View>
                <View style={homeStyles.roomTypeBadge}><Text style={homeStyles.roomTypeText}>شائع</Text></View>
              </View>
              <View style={homeStyles.roomInfoRow}>
                <Image source={{ uri: 'https://randomuser.me/api/portraits/men/32.jpg' }} style={homeStyles.roomAvatar} />
                <Text style={homeStyles.roomName}>غرفة دردشة</Text>
              </View>
              <Text style={homeStyles.roomDesc}>لحظات جميلة وذكريات رائعة</Text>
              <View style={homeStyles.roomStatsRow}>
                <View style={homeStyles.roomStat}><Text style={homeStyles.roomStatText}>201</Text></View>
                <View style={homeStyles.roomStat}><Text style={homeStyles.roomStatText}>4</Text></View>
              </View>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const homeStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  headerRight: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    padding: 12,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    textAlign: 'right',
  },
  chipsScroll: {
    marginBottom: 20,
  },
  chipsContainer: {
    paddingHorizontal: 20,
    gap: 12,
  },
  chip: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#fff',
  },
  chipText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#4d9ef6',
  },
  createRoomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  roomsCount: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  createRoomBtn: {
    backgroundColor: '#6d28d9',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  createRoomText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    gap: 16,
  },
  roomCard: {
    width: '48%',
    height: 200,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: '100%',
  },
  roomOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  roomTopRow: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomLiveBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomLiveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  roomTypeBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roomTypeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  roomInfoRow: {
    position: 'absolute',
    bottom: 60,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#fff',
  },
  roomName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  roomDesc: {
    position: 'absolute',
    bottom: 40,
    left: 12,
    right: 12,
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    lineHeight: 16,
  },
  roomStatsRow: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomStat: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  roomStatText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
});
