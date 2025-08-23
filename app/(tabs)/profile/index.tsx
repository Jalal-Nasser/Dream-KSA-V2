import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Camera, Save, User, Building2, Crown } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import AvatarPicker from '@/src/components/AvatarPicker';

interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

interface VipInfo {
  vip_name: string;
  badge_color: string;
  priority: number;
}

interface AgencyMembership {
  agency_id: string;
  agency_name: string;
  role: 'owner' | 'manager' | 'host' | 'member';
  joined_at: string;
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vipInfo, setVipInfo] = useState<VipInfo | null>(null);
  const [agencyMemberships, setAgencyMemberships] = useState<AgencyMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Fetch user profile and related data
  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError);
        Alert.alert('Error', 'Failed to fetch profile');
        return;
      }

      // Create profile if it doesn't exist
      let finalProfile: Profile;
      if (!profileData) {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            display_name: user.email?.split('@')[0] || 'User',
            bio: null,
            avatar_url: null
          })
          .select()
          .single();

        if (createError) {
          console.error('Profile creation error:', createError);
          Alert.alert('Error', 'Failed to create profile');
          return;
        }
        finalProfile = newProfile;
      } else {
        finalProfile = profileData;
      }

      setProfile(finalProfile);
      setDisplayName(finalProfile.display_name || '');
      setBio(finalProfile.bio || '');
      setAvatarUrl(finalProfile.avatar_url);

      // Fetch VIP info
      const { data: vipData } = await supabase
        .from('user_vip')
        .select(`
          vip_levels (
            name,
            badge_color,
            priority
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (vipData?.vip_levels) {
        setVipInfo({
          vip_name: vipData.vip_levels.name,
          badge_color: vipData.vip_levels.badge_color,
          priority: vipData.vip_levels.priority
        });
      }

      // Fetch agency memberships
      const { data: agencyData } = await supabase
        .from('agency_members')
        .select(`
          agency_id,
          role,
          joined_at,
          agencies (
            name
          )
        `)
        .eq('user_id', user.id);

      if (agencyData) {
        const memberships: AgencyMembership[] = agencyData.map(item => ({
          agency_id: item.agency_id,
          agency_name: item.agencies?.name || 'Unknown Agency',
          role: item.role,
          joined_at: item.joined_at
        }));
        setAgencyMemberships(memberships);
      }

    } catch (error) {
      console.error('Profile fetch error:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Handle avatar upload
  const handleAvatarChange = useCallback(async (uri: string) => {
    if (!profile?.user_id) return;

    try {
      setSaving(true);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const fileName = `${profile.user_id}.jpg`;
      const { data, error } = await supabase.storage
        .from('avatars')
        .upload(fileName, blob, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Avatar upload error:', error);
        Alert.alert('Error', 'Failed to upload avatar');
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      const publicUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('user_id', profile.user_id);

      if (updateError) {
        console.error('Profile update error:', updateError);
        Alert.alert('Error', 'Failed to update profile');
        return;
      }

      setAvatarUrl(publicUrl);
      Alert.alert('Success', 'Avatar updated successfully');

    } catch (error) {
      console.error('Avatar change error:', error);
      Alert.alert('Error', 'Failed to update avatar');
    } finally {
      setSaving(false);
    }
  }, [profile?.user_id]);

  // Handle profile save
  const handleSave = useCallback(async () => {
    if (!profile?.user_id) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', profile.user_id);

      if (error) {
        console.error('Profile save error:', error);
        Alert.alert('Error', 'Failed to save profile');
        return;
      }

      // Update local state
      setProfile(prev => prev ? {
        ...prev,
        display_name: displayName.trim(),
        bio: bio.trim() || null
      } : null);

      setEditing(false);
      Alert.alert('Success', 'Profile updated successfully');

    } catch (error) {
      console.error('Profile save error:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }, [profile?.user_id, displayName, bio]);

  // Handle edit mode toggle
  const toggleEditing = useCallback(() => {
    if (editing) {
      // Reset to original values
      setDisplayName(profile?.display_name || '');
      setBio(profile?.bio || '');
    }
    setEditing(!editing);
  }, [editing, profile]);

  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text className="text-gray-400 mt-4">Loading profile...</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-red-400 text-lg">Profile not found</Text>
        <Pressable
          onPress={fetchProfile}
          className="bg-blue-600 px-6 py-3 rounded-xl mt-4"
        >
          <Text className="text-white font-semibold">Retry</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View 
      className="flex-1 bg-gray-900"
      style={{ paddingTop: insets.top }}
    >
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 py-6 border-b border-gray-800">
          <Text className="text-white text-2xl font-bold text-center">Profile</Text>
        </View>

        {/* Avatar Section */}
        <View className="px-4 py-6">
          <View className="items-center">
            <AvatarPicker
              currentAvatarUrl={avatarUrl}
              onAvatarChange={handleAvatarChange}
              loading={saving}
            />
          </View>
        </View>

        {/* Profile Info Section */}
        <View className="px-4 py-4">
          {/* Display Name */}
          <View className="mb-6">
            <View className="flex-row items-center mb-2">
              <User size={20} color="#6C5CE7" />
              <Text className="text-gray-300 text-sm font-medium ml-2">Display Name</Text>
              {vipInfo && (
                <View 
                  className="ml-3 px-3 py-1 rounded-full"
                  style={{ backgroundColor: vipInfo.badge_color }}
                >
                  <Text className="text-black text-xs font-bold">
                    {vipInfo.vip_name}
                  </Text>
                </View>
              )}
            </View>
            
            {editing ? (
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
                placeholder="Enter display name"
                placeholderTextColor="#6B7280"
                maxLength={50}
              />
            ) : (
              <Text className="text-white text-lg font-semibold px-4 py-3">
                {profile.display_name || 'No display name'}
              </Text>
            )}
          </View>

          {/* Bio */}
          <View className="mb-6">
            <Text className="text-gray-300 text-sm font-medium mb-2">Bio</Text>
            
            {editing ? (
              <TextInput
                value={bio}
                onChangeText={setBio}
                className="bg-gray-800 text-white px-4 py-3 rounded-xl border border-gray-700"
                placeholder="Tell us about yourself..."
                placeholderTextColor="#6B7280"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                maxLength={500}
              />
            ) : (
              <Text className="text-gray-300 px-4 py-3">
                {profile.bio || 'No bio added yet'}
              </Text>
            )}
          </View>

          {/* Agency Memberships */}
          {agencyMemberships.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Building2 size={20} color="#6C5CE7" />
                <Text className="text-gray-300 text-sm font-medium ml-2">Agency Memberships</Text>
              </View>
              
              <View className="flex-row flex-wrap gap-2">
                {agencyMemberships.map((membership) => (
                  <View
                    key={membership.agency_id}
                    className="bg-gray-800 px-3 py-2 rounded-full border border-gray-700"
                  >
                    <Text className="text-white text-sm font-medium">
                      {membership.agency_name}
                    </Text>
                    <Text className="text-gray-400 text-xs capitalize">
                      {membership.role}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* VIP Status */}
          {vipInfo && (
            <View className="mb-6">
              <View className="flex-row items-center mb-3">
                <Crown size={20} color="#FFD700" />
                <Text className="text-gray-300 text-sm font-medium ml-2">VIP Status</Text>
              </View>
              
              <View 
                className="px-4 py-3 rounded-xl"
                style={{ backgroundColor: vipInfo.badge_color }}
              >
                <Text className="text-black text-lg font-bold text-center">
                  {vipInfo.vip_name}
                </Text>
                <Text className="text-black text-sm text-center opacity-80">
                  Priority Level {vipInfo.priority}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View className="px-4 py-6">
          {editing ? (
            <View className="flex-row gap-3">
              <Pressable
                onPress={toggleEditing}
                className="flex-1 bg-gray-700 px-6 py-3 rounded-xl"
                disabled={saving}
              >
                <Text className="text-white font-semibold text-center">Cancel</Text>
              </Pressable>
              
              <Pressable
                onPress={handleSave}
                className="flex-1 bg-blue-600 px-6 py-3 rounded-xl flex-row items-center justify-center"
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Save size={20} color="white" />
                )}
                <Text className="text-white font-semibold ml-2">
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={toggleEditing}
              className="bg-blue-600 px-6 py-3 rounded-xl flex-row items-center justify-center"
            >
              <User size={20} color="white" />
              <Text className="text-white font-semibold ml-2">Edit Profile</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}


