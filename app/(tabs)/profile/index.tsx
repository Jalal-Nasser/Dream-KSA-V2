import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../../lib/supabase';
import { Camera, Save, User, Building, Crown } from 'lucide-react-native';

// Types
interface Profile {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  bio: string;
  created_at: string;
  updated_at: string;
}

interface VipLevel {
  name: string;
  color: string;
}

interface AgencyMembership {
  agency_name: string;
  role: string;
}

interface User {
  id: string;
  email?: string;
}

export default function ProfileScreen() {
  // State
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [vipLevel, setVipLevel] = useState<VipLevel | null>(null);
  const [memberships, setMemberships] = useState<AgencyMembership[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Validation
  const [nameError, setNameError] = useState<string | null>(null);
  const [bioError, setBioError] = useState<string | null>(null);
  
  // Load user data on mount
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Get current user session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      const currentUser = session.user;
      setUser(currentUser);
      
      // Fetch profile data
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, avatar_url, bio, created_at, updated_at')
        .eq('user_id', currentUser.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        // PGRST116 = no rows returned, which is fine for new users
        throw profileError;
      }
      
      let profile: Profile;
      if (profileData) {
        profile = {
          user_id: currentUser.id,
          ...profileData
        };
      } else {
        // Create blank profile for new user
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: currentUser.id,
            display_name: '',
            avatar_url: null,
            bio: ''
          })
          .select()
          .single();
          
        if (insertError) throw insertError;
        profile = newProfile;
      }
      
      setProfile(profile);
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
      setAvatarUrl(profile.avatar_url);
      
      // Fetch VIP level
      const { data: vipData, error: vipError } = await supabase
        .from('user_vip')
        .select(`
          vip_levels(name, color)
        `)
        .eq('user_id', currentUser.id)
        .single();
      
      if (vipData?.vip_levels) {
        // vip_levels is an array, take the first one
        const vipLevelData = Array.isArray(vipData.vip_levels) 
          ? vipData.vip_levels[0] 
          : vipData.vip_levels;
        if (vipLevelData) {
          setVipLevel(vipLevelData as VipLevel);
        }
      }
      
      // Fetch agency memberships
      const { data: membershipData, error: membershipError } = await supabase
        .from('agency_members')
        .select(`
          role,
          agencies(name)
        `)
        .eq('user_id', currentUser.id);
      
      if (membershipData) {
        const agencyMemberships = membershipData
          .filter(m => m.agencies && Array.isArray(m.agencies) && m.agencies[0]?.name)
          .map(m => ({
            agency_name: m.agencies[0].name,
            role: m.role
          }));
        setMemberships(agencyMemberships);
      }
      
    } catch (error) {
      console.error('Failed to load user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };
  
  // Validation helpers
  const validateDisplayName = (name: string): string | null => {
    if (!name.trim()) return 'Display name is required';
    if (name.length < 2) return 'Display name must be at least 2 characters';
    if (name.length > 40) return 'Display name must be 40 characters or less';
    return null;
  };
  
  const validateBio = (bio: string): string | null => {
    if (bio.length > 200) return 'Bio must be 200 characters or less';
    return null;
  };
  
  // Handle form changes
  const handleDisplayNameChange = (text: string) => {
    setDisplayName(text);
    setNameError(validateDisplayName(text));
    setIsDirty(true);
  };
  
  const handleBioChange = (text: string) => {
    setBio(text);
    setBioError(validateBio(text));
    setIsDirty(true);
  };
  
  // Avatar upload handler
  const handleAvatarUpload = async () => {
    if (!user) return;
    
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access to change your avatar');
        return;
      }
      
      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
        aspect: [1, 1], // Square for avatar
      });
      
      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        // Upload to Supabase storage
        const path = `${user.id}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(path, blob, { 
            upsert: true, 
            contentType: 'image/jpeg' 
          });
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(path);
          
        // Update local state for preview
        setAvatarUrl(urlData.publicUrl);
        setIsDirty(true);
        
        Alert.alert('Success', 'Avatar updated successfully. Save changes to apply.');
      }
      
    } catch (error) {
      console.error('Failed to upload avatar:', error);
      Alert.alert('Error', 'Failed to upload avatar image');
    } finally {
      setUploading(false);
    }
  };
  
  // Save profile handler
  const handleSave = async () => {
    if (!user || !isDirty) return;
    
    // Validate before saving
    const nameValidation = validateDisplayName(displayName);
    const bioValidation = validateBio(bio);
    
    if (nameValidation) {
      setNameError(nameValidation);
      return;
    }
    
    if (bioValidation) {
      setBioError(bioValidation);
      return;
    }
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim(),
          bio: bio.trim(),
          avatar_url: avatarUrl
        })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local state
      setProfile(prev => prev ? { ...prev, display_name: displayName.trim(), bio: bio.trim(), avatar_url: avatarUrl } : null);
      setIsDirty(false);
      
      Alert.alert('Success', 'Profile updated successfully');
      
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </View>
    );
  }
  
  if (!user || !profile) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorMessage}>Failed to load profile</Text>
        </View>
      </View>
    );
  }
  
  const canSave = isDirty && !nameError && !bioError && !saving && !uploading;
  
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Hero Card */}
        <View style={styles.heroCard}>
          <View style={styles.heroContent}>
            {/* Avatar Section */}
            <View style={styles.avatarSection}>
              <View style={styles.avatarContainer}>
                {avatarUrl ? (
                  <Image 
                    source={{ uri: avatarUrl }}
                    style={styles.avatar}
                    contentFit="cover"
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <User size={32} color="#6B7280" />
                  </View>
                )}
              </View>
              
              {/* Upload Button */}
              <Pressable
                onPress={handleAvatarUpload}
                disabled={uploading}
                style={styles.uploadButton}
                accessibilityLabel="Change avatar"
              >
                {uploading ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Camera size={16} color="white" />
                )}
              </Pressable>
            </View>
            
            {/* Display Name */}
            <View style={styles.nameSection}>
              <TextInput
                value={displayName}
                onChangeText={handleDisplayNameChange}
                placeholder="Enter display name"
                placeholderTextColor="#6B7280"
                style={[
                  styles.nameInput,
                  nameError ? styles.inputError : styles.inputNormal
                ]}
                maxLength={40}
                accessibilityLabel="Display name input"
              />
              {nameError && (
                <Text style={styles.errorText}>{nameError}</Text>
              )}
            </View>
            
            {/* VIP Badge */}
            {vipLevel && (
              <View 
                style={[styles.vipBadge, { backgroundColor: vipLevel.color }]}
              >
                <View style={styles.vipContent}>
                  <Crown size={14} color="white" />
                  <Text style={styles.vipText}>
                    {vipLevel.name}
                  </Text>
                </View>
              </View>
            )}
            
            {/* Email */}
            <Text style={styles.emailText}>{user.email}</Text>
          </View>
        </View>
        
        {/* Bio Section */}
        <View style={styles.bioCard}>
          <Text style={styles.sectionTitle}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={handleBioChange}
            placeholder="Tell us about yourself..."
            placeholderTextColor="#6B7280"
            style={[
              styles.bioInput,
              bioError ? styles.inputError : styles.inputNormal
            ]}
            multiline
            textAlignVertical="top"
            maxLength={200}
            accessibilityLabel="Bio input"
          />
          <View style={styles.bioFooter}>
            {bioError && (
              <Text style={styles.errorText}>{bioError}</Text>
            )}
            <Text style={styles.charCount}>
              {bio.length}/200
            </Text>
          </View>
        </View>
        
        {/* Agency Memberships */}
        {memberships.length > 0 && (
          <View style={styles.membershipsCard}>
            <Text style={styles.sectionTitle}>Agency Memberships</Text>
            <View style={styles.membershipsList}>
              {memberships.map((membership, index) => (
                <View 
                  key={`membership-${index}`}
                  style={styles.membershipChip}
                >
                  <View style={styles.membershipContent}>
                    <Building size={12} color="#9CA3AF" />
                    <Text style={styles.agencyName}>
                      {membership.agency_name}
                    </Text>
                    <Text style={styles.agencyRole}>
                      {membership.role}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* Save Button */}
        <Pressable
          onPress={handleSave}
          disabled={!canSave}
          style={[
            styles.saveButton,
            canSave ? styles.saveButtonActive : styles.saveButtonDisabled
          ]}
          accessibilityLabel="Save profile changes"
        >
          {saving ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Save size={20} color="white" />
          )}
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Text>
        </Pressable>
        
        {/* Status Messages */}
        {!isDirty && (
          <Text style={styles.statusText}>
            All changes saved
          </Text>
        )}
        
        {isDirty && (
          <Text style={styles.dirtyText}>
            You have unsaved changes
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // bg-black
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  heroCard: {
    backgroundColor: '#171717', // bg-neutral-900
    borderRadius: 16, // rounded-2xl
    padding: 24, // p-6
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24, // mb-6
  },
  heroContent: {
    alignItems: 'center',
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 16, // mb-4
  },
  avatarContainer: {
    width: 96, // w-24
    height: 96, // h-24
    borderRadius: 48, // rounded-full
    overflow: 'hidden',
    backgroundColor: '#262626', // bg-neutral-800
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#404040', // bg-neutral-700
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadButton: {
    position: 'absolute',
    bottom: -8, // -bottom-2
    right: -8, // -right-2
    backgroundColor: '#2563EB', // bg-blue-600
    width: 32, // w-8
    height: 32, // h-8
    borderRadius: 16, // rounded-full
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameSection: {
    width: '100%',
    marginBottom: 12, // mb-3
  },
  nameInput: {
    textAlign: 'center',
    fontSize: 20, // text-xl
    fontWeight: '600', // font-semibold
    color: 'white',
    backgroundColor: '#262626', // bg-neutral-800
    borderWidth: 1,
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
  },
  inputNormal: {
    borderColor: '#404040', // border-neutral-700
  },
  inputError: {
    borderColor: '#EF4444', // border-red-500
  },
  errorText: {
    color: '#F87171', // text-red-400
    fontSize: 12, // text-xs
    marginTop: 4, // mt-1
    textAlign: 'center',
  },
  vipBadge: {
    paddingHorizontal: 12, // px-3
    paddingVertical: 4, // py-1
    borderRadius: 16, // rounded-full
    marginBottom: 12, // mb-3
  },
  vipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vipText: {
    color: 'white',
    fontWeight: '600', // font-semibold
    fontSize: 14, // text-sm
    marginLeft: 4, // ml-1
  },
  emailText: {
    color: '#9CA3AF', // text-neutral-400
    fontSize: 14, // text-sm
  },
  bioCard: {
    backgroundColor: '#171717', // bg-neutral-900
    borderRadius: 16, // rounded-2xl
    padding: 16, // p-4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24, // mb-6
  },
  sectionTitle: {
    color: 'white',
    fontWeight: '600', // font-semibold
    marginBottom: 12, // mb-3
  },
  bioInput: {
    backgroundColor: '#262626', // bg-neutral-800
    borderWidth: 1,
    borderRadius: 8, // rounded-lg
    paddingHorizontal: 12, // px-3
    paddingVertical: 12, // py-3
    color: 'white',
    minHeight: 100, // min-h-[100]
  },
  bioFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8, // mt-2
  },
  charCount: {
    color: '#9CA3AF', // text-neutral-400
    fontSize: 12, // text-xs
    marginLeft: 'auto', // ml-auto
  },
  membershipsCard: {
    backgroundColor: '#171717', // bg-neutral-900
    borderRadius: 16, // rounded-2xl
    padding: 16, // p-4
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 24, // mb-6
  },
  membershipsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  membershipChip: {
    paddingHorizontal: 12, // px-3
    paddingVertical: 8, // py-2
    borderRadius: 16, // rounded-full
    borderWidth: 1,
    borderColor: '#525252', // border-neutral-600
    backgroundColor: '#262626', // bg-neutral-800
    marginRight: 8, // mr-2
    marginBottom: 8, // mb-2
  },
  membershipContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  agencyName: {
    color: '#D1D5DB', // text-neutral-300
    fontSize: 14, // text-sm
    marginLeft: 4, // ml-1
    fontWeight: '500', // font-medium
  },
  agencyRole: {
    color: '#6B7280', // text-neutral-500
    fontSize: 12, // text-xs
    marginLeft: 8, // ml-2
    textTransform: 'capitalize',
  },
  saveButton: {
    paddingVertical: 16, // py-4
    paddingHorizontal: 24, // px-6
    borderRadius: 8, // rounded-lg
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonActive: {
    backgroundColor: '#2563EB', // bg-blue-600
  },
  saveButtonDisabled: {
    backgroundColor: '#404040', // bg-neutral-700
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600', // font-semibold
    marginLeft: 8, // ml-2
  },
  statusText: {
    color: '#6B7280', // text-neutral-500
    textAlign: 'center',
    marginTop: 16, // mt-4
    fontSize: 14, // text-sm
  },
  dirtyText: {
    color: '#60A5FA', // text-blue-400
    textAlign: 'center',
    marginTop: 16, // mt-4
    fontSize: 14, // text-sm
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#9CA3AF', // text-neutral-400
    marginTop: 16, // mt-4
    fontSize: 14, // text-sm
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorMessage: {
    color: '#9CA3AF', // text-neutral-400
    textAlign: 'center',
    fontSize: 14, // text-sm
  },
});


