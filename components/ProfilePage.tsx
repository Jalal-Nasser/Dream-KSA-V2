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
              <Text style={profileStyles.statNumber}>856</Text>
              <Text style={profileStyles.statText}>متابَع</Text>
            </View>
            <View style={profileStyles.statItem}>
              <Text style={profileStyles.statNumber}>24</Text>
              <Text style={profileStyles.statText}>غرفة</Text>
            </View>
          </View>
          <TouchableOpacity
            style={[profileStyles.followButton, isFollowing && profileStyles.followingButton]}
            onPress={() => setIsFollowing(!isFollowing)}
          >
            <Text style={[profileStyles.followButtonText, isFollowing && profileStyles.followingButtonText]}>
              {isFollowing ? 'متابَع' : 'متابعة'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Profile Tabs */}
      <ProfileTabs />

      {/* Quick Actions */}
      <View style={profileStyles.quickActions}>
        <Pressable style={profileStyles.actionButton}>
          <MessageCircle size={20} color="#3b82f6" />
          <Text style={profileStyles.actionText}>رسالة</Text>
        </Pressable>
        <Pressable style={profileStyles.actionButton}>
          <Mic size={20} color="#10b981" />
          <Text style={profileStyles.actionText}>دعوة للغرفة</Text>
        </Pressable>
        <Pressable style={profileStyles.actionButton}>
          <Share2 size={20} color="#f59e0b" />
          <Text style={profileStyles.actionText}>مشاركة</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const profileStyles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0f172a',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
  },
  profileCard: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: '#3b82f6',
  },
  onlineStatus: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#10b981',
    borderWidth: 3,
    borderColor: '#1e293b',
  },
  editButton: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#3b82f6',
    borderRadius: 20,
    padding: 8,
  },
  profileInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  statText: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#3b82f6',
  },
  followButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  followingButtonText: {
    color: '#3b82f6',
  },
  tabsContainer: {
    backgroundColor: '#1e293b',
    marginHorizontal: 20,
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 12,
  },
  activeTab: {
    backgroundColor: '#3b82f6',
  },
  tabText: {
    color: '#94a3b8',
    fontWeight: '600',
  },
  activeTabText: {
    color: '#fff',
  },
  tabContent: {
    minHeight: 100,
  },
  bioText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  badgesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  badgeText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: '#1e293b',
    padding: 16,
    borderRadius: 16,
    minWidth: 80,
  },
  actionText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
});
