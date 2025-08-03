import React, { useState } from 'react';
import { StyleSheet, Text, View, Pressable, ScrollView, Image, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Settings,
  Edit,
  Gift,
  Heart,
  Star,
  Users,
  MessageCircle,
  Mic,
  Calendar,
  Award,
  Share2,
} from 'lucide-react-native';

const ProfileTabs = () => {
  const [activeTab, setActiveTab] = useState('bio');
  return (
    <View style={profileStyles.tabsContainer}>
      <View style={profileStyles.tabs}>
        <Pressable
          onPress={() => setActiveTab('bio')}
          style={[profileStyles.tabButton, activeTab === 'bio' && profileStyles.activeTab]}
        >
          <Text style={[profileStyles.tabText, activeTab === 'bio' && profileStyles.activeTabText]}>
            السيرة الذاتية
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setActiveTab('rooms')}
          style={[profileStyles.tabButton, activeTab === 'rooms' && profileStyles.activeTab]}
        >
          <Text style={[profileStyles.tabText, activeTab === 'rooms' && profileStyles.activeTabText]}>
            غرفي
          </Text>
        </Pressable>
      </View>
      <View style={profileStyles.tabContent}>
        {activeTab === 'bio' && (
          <View>
            <Text style={profileStyles.bioText}>مرحبا بكم في صفحتي!</Text>
            <View style={profileStyles.badgesContainer}>
              <View style={profileStyles.badge}>
                <Award size={16} color="#3b82f6" />
                <Text style={profileStyles.badgeText}>صوت مميز</Text>
              </View>
              <View style={profileStyles.badge}>
                <Star size={16} color="#f59e0b" />
                <Text style={profileStyles.badgeText}>مستخدم نجم</Text>
              </View>
            </View>
          </View>
        )}
        {activeTab === 'rooms' && (
          <View>
            <Text style={profileStyles.bioText}>لا توجد غرف حاليا</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default function ProfilePage() {
  const insets = useSafeAreaInsets();
  const [isFollowing, setIsFollowing] = useState(false);

  return (
    <ScrollView contentContainerStyle={[profileStyles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Header */}
      <View style={profileStyles.header}>
        <Pressable style={profileStyles.headerButton}>
          <Settings color="white" size={24} />
        </Pressable>
        <Pressable style={profileStyles.headerButton}>
          <Gift color="white" size={24} />
        </Pressable>
      </View>

      {/* Profile Card */}
      <View style={profileStyles.profileCard}>
        <View style={profileStyles.profileImageContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=face' }}
            style={profileStyles.profileImage}
          />
          <View style={profileStyles.onlineStatus} />
          <Pressable style={profileStyles.editButton}>
            <Edit color="white" size={20} />
          </Pressable>
        </View>

        <View style={profileStyles.profileInfo}>
          <Text style={profileStyles.userName}>عبدالله القحطاني</Text>
          <View style={profileStyles.userStats}>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>1.2k</Text>
              <Text style={profileStyles.statText}>متابع</Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>500</Text>
              <Text style={profileStyles.statText}>متابع</Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>3.4k</Text>
              <Text style={profileStyles.statText}>إعجاب</Text>
            </View>
          </View>
          <View style={profileStyles.actionsContainer}>
            <TouchableOpacity onPress={() => setIsFollowing(!isFollowing)} style={profileStyles.followButton}>
              <Text style={profileStyles.followButtonText}>
                {isFollowing ? 'يتابع' : '+ متابعة'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={profileStyles.messageButton}>
              <MessageCircle color="#3b82f6" size={20} />
            </TouchableOpacity>
            <TouchableOpacity style={profileStyles.shareButton}>
              <Share2 color="#3b82f6" size={20} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Profile Details */}
      <View style={profileStyles.detailsCard}>
        <View style={profileStyles.detailItem}>
          <View style={profileStyles.detailIcon}>
            <Mic color="#4f46e5" size={20} />
          </View>
          <Text style={profileStyles.detailText}>المهنة: مهندس برمجيات</Text>
        </View>
        <View style={profileStyles.detailItem}>
          <View style={profileStyles.detailIcon}>
            <Calendar color="#f59e0b" size={20} />
          </View>
          <Text style={profileStyles.detailText}>تاريخ الميلاد: 21 مايو 1990</Text>
        </View>
        <View style={profileStyles.detailItem}>
          <View style={profileStyles.detailIcon}>
            <Users color="#ef4444" size={20} />
          </View>
          <Text style={profileStyles.detailText}>الاهتمامات: التقنية، الألعاب، السفر</Text>
        </View>
      </View>

      <ProfileTabs />
    </ScrollView>
  );
}

const profileStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0a0e15',
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerButton: {
    padding: 8,
  },
  profileCard: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  profileImageContainer: {
    width: 128,
    height: 128,
    borderRadius: 64,
    borderWidth: 4,
    borderColor: '#374151',
    position: 'relative',
    marginBottom: 16,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    borderRadius: 64,
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1f2937',
  },
  profileInfo: {
    alignItems: 'center',
    width: '100%',
  },
  userName: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 24,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statText: {
    color: '#9ca3af',
    fontSize: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    gap: 16,
  },
  followButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  followButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  messageButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3b82f620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#3b82f620',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 24,
    marginBottom: 24,
  },
  detailItem: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginBottom: 16,
  },
  detailIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#374151',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  detailText: {
    color: '#e5e7eb',
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  tabsContainer: {
    backgroundColor: '#1f2937',
    borderRadius: 24,
    padding: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    borderRadius: 16,
    padding: 4,
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  tabText: {
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  activeTabText: {
    color: '#1f2937',
  },
  tabContent: {
    minHeight: 100,
  },
  bioText: {
    color: '#e5e7eb',
    textAlign: 'right',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    flexWrap: 'wrap',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#374151',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginLeft: 8,
    marginBottom: 8,
  },
  badgeText: {
    color: '#e5e7eb',
    fontSize: 12,
    marginLeft: 8,
  },
});