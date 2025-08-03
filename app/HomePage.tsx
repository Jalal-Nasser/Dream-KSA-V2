import React from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, TextInput, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Bell,
  MessageCircle,
  Plus,
  Compass,
  Star,
  Search,
  Users,
  Settings,
  Mic,
  Gift,
  PlusCircle,
  Menu,
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';

// Placeholder for your RoomCard component
const RoomCard = () => (
  <View style={homeStyles.roomCard}>
    <View style={homeStyles.roomCardHeader}>
      <View style={homeStyles.roomUserCount}>
        <Users color="white" size={12} />
        <Text style={homeStyles.roomUserCountText}>+45</Text>
      </View>
      <View style={homeStyles.liveBadge}>
        <View style={homeStyles.liveDot} />
        <Text style={homeStyles.liveText}>مباشر</Text>
      </View>
    </View>
    <View style={homeStyles.roomProfileImageContainer}>
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face' }}
        style={homeStyles.roomProfileImage}
      />
    </View>
    <View style={homeStyles.roomCardFooter}>
      <View style={homeStyles.roomTags}>
        <Text style={homeStyles.roomTagText}>نقاش</Text>
        <Text style={homeStyles.roomTagText}>عام</Text>
      </View>
      <Text style={homeStyles.roomName}>نقاش تقني</Text>
    </View>
  </View>
);

export default function HomePage() {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={['#1F2937', '#111827', '#0A0E15']}
      style={[homeStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}
    >
      {/* Header */}
      <View style={homeStyles.header}>
        <Pressable style={homeStyles.headerButton}>
          <Bell color="white" size={24} />
        </Pressable>
        <View style={homeStyles.headerCenter}>
          <Text style={homeStyles.headerTitle}>الرئيسية</Text>
        </View>
        <Pressable style={homeStyles.headerButton}>
          <Plus color="white" size={24} />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={homeStyles.scrollViewContent}>
        {/* Search Bar */}
        <View style={homeStyles.searchBarContainer}>
          <TextInput
            placeholder="ابحث عن الغرف أو الأصدقاء"
            placeholderTextColor="#9ca3af"
            style={homeStyles.searchBarInput}
          />
          <Search color="#9ca3af" size={20} style={homeStyles.searchIcon} />
        </View>

        {/* Categories */}
        <View style={homeStyles.categoriesContainer}>
          <Text style={homeStyles.sectionTitle}>أهم الفئات</Text>
          <View style={homeStyles.categoriesList}>
            <View style={homeStyles.categoryCard}>
              <View style={homeStyles.categoryIcon}>
                <Compass color="#4f46e5" size={20} />
              </View>
              <Text style={homeStyles.categoryText}>استكشف</Text>
            </View>
            <View style={homeStyles.categoryCard}>
              <View style={homeStyles.categoryIcon}>
                <Star color="#f59e0b" size={20} />
              </View>
              <Text style={homeStyles.categoryText}>النجوم</Text>
            </View>
            <View style={homeStyles.categoryCard}>
              <View style={homeStyles.categoryIcon}>
                <Music color="#ef4444" size={20} />
              </View>
              <Text style={homeStyles.categoryText}>الموسيقى</Text>
            </View>
            <View style={homeStyles.categoryCard}>
              <View style={homeStyles.categoryIcon}>
                <MessageCircle color="#3b82f6" size={20} />
              </View>
              <Text style={homeStyles.categoryText}>النقاشات</Text>
            </View>
          </View>
        </View>

        {/* Live Rooms Section */}
        <View style={homeStyles.section}>
          <View style={homeStyles.sectionHeader}>
            <Text style={homeStyles.sectionTitle}>غرف مباشرة</Text>
            <Pressable>
              <Text style={homeStyles.viewAllText}>عرض الكل</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={homeStyles.roomsList}>
            <RoomCard />
            <RoomCard />
            <RoomCard />
          </ScrollView>
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={homeStyles.footer}>
        <Pressable style={homeStyles.footerButton}>
          <Menu color="white" size={24} />
          <Text style={homeStyles.footerText}>الرئيسية</Text>
        </Pressable>
        <Pressable style={homeStyles.footerButton}>
          <Mic color="#9ca3af" size={24} />
          <Text style={homeStyles.footerTextInactive}>غرفي</Text>
        </Pressable>
        <Pressable style={homeStyles.footerButton}>
          <Gift color="#9ca3af" size={24} />
          <Text style={homeStyles.footerTextInactive}>المتجر</Text>
        </Pressable>
        <Pressable style={homeStyles.footerButton}>
          <Settings color="#9ca3af" size={24} />
          <Text style={homeStyles.footerTextInactive}>الإعدادات</Text>
        </Pressable>
        <Pressable style={homeStyles.footerButton}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }}
            style={homeStyles.footerProfileImage}
          />
          <Text style={homeStyles.footerTextInactive}>حسابي</Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const homeStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollViewContent: {
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchBarContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 24,
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  searchBarInput: {
    flex: 1,
    color: 'white',
    paddingVertical: 12,
    textAlign: 'right',
  },
  searchIcon: {
    marginRight: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'right',
  },
  viewAllText: {
    color: '#9ca3af',
    fontSize: 14,
  },
  categoriesContainer: {
    marginBottom: 24,
  },
  categoriesList: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  categoryCard: {
    alignItems: 'center',
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 12,
  },
  roomsList: {
    paddingBottom: 8,
    paddingRight: 16,
  },
  roomCard: {
    backgroundColor: '#374151',
    width: 150,
    height: 200,
    borderRadius: 16,
    padding: 12,
    marginRight: 12,
    justifyContent: 'space-between',
  },
  roomCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  roomUserCount: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  roomUserCountText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ef4444',
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 4,
  },
  liveText: {
    color: 'white',
    fontSize: 10,
  },
  roomProfileImageContainer: {
    alignItems: 'center',
  },
  roomProfileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: 'white',
  },
  roomCardFooter: {
    alignItems: 'center',
  },
  roomTags: {
    flexDirection: 'row-reverse',
    marginBottom: 4,
  },
  roomTagText: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: 'white',
    fontSize: 10,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginHorizontal: 2,
  },
  roomName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: '#1F2937',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
  },
  footerButton: {
    alignItems: 'center',
  },
  footerText: {
    color: 'white',
    fontSize: 10,
    marginTop: 4,
  },
  footerTextInactive: {
    color: '#9ca3af',
    fontSize: 10,
    marginTop: 4,
  },
  footerProfileImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});