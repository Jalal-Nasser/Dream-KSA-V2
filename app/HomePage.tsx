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
          <Pressable style={homeStyles.createRoomBtn} onPress={() => router.push('/voicechat?roomId=new') }>
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingBottom: 10,
    marginTop: 8,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#fff',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#e0e7ff',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 12,
  },
  searchContainer: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 16,
    marginHorizontal: 18,
    marginTop: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    height: 44,
    justifyContent: 'center',
  },
  searchInput: {
    color: '#fff',
    fontSize: 15,
    textAlign: 'right',
    width: '100%',
  },
  chipsScroll: {
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  chipsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
  },
  chip: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 7,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#4d9ef6',
  },
  chipText: {
    color: '#4d9ef6',
    fontWeight: 'bold',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#fff',
  },
  createRoomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 8,
    marginBottom: 8,
  },
  roomsCount: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  createRoomBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4d9ef6',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  createRoomText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    marginLeft: 6,
  },
  roomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: 18,
    marginTop: 8,
    gap: 12,
  },
  roomCard: {
    width: '47%',
    aspectRatio: 1.2,
    backgroundColor: '#fff',
    borderRadius: 18,
    marginBottom: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  roomImage: {
    width: '100%',
    height: 80,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  roomOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
  },
  roomTopRow: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  roomLiveBadge: {
    backgroundColor: '#f43f5e',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roomLiveText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roomTypeBadge: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roomTypeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  roomInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    marginHorizontal: 8,
    gap: 8,
  },
  roomAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#fff',
  },
  roomName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#222',
  },
  roomDesc: {
    fontSize: 11,
    color: '#555',
    marginHorizontal: 8,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'right',
  },
  roomStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginHorizontal: 8,
    marginBottom: 6,
  },
  roomStat: {
    backgroundColor: '#e0e7ff',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  roomStatText: {
    color: '#4d9ef6',
    fontSize: 11,
    fontWeight: 'bold',
  },
});