import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
// No useAuth hook - using supabase.auth.getUser() directly
import ColorSwatchRow from '@/src/components/ColorSwatchRow';
import { ChevronLeft, Upload, Save, RotateCcw, Lock } from 'lucide-react-native';

// QA: Loads agency and shows current banner + theme color in preview
interface Agency {
  id: string;
  name: string;
  theme_color: string;
  banner_url: string | null;
}

interface UserRole {
  role: 'owner' | 'manager' | 'member';
}

const COLOR_PRESETS = [
  '#4F46E5', // Indigo
  '#3B82F6', // Blue  
  '#10B981', // Emerald
  '#22C55E', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
];

const isValidHex = (s: string) => /^#[0-9A-Fa-f]{6}$/.test(s);

export default function AgencySettingsScreen() {
  const { agencyId } = useLocalSearchParams<{ agencyId: string }>();
  const router = useRouter();
  
  // State
  const [agency, setAgency] = useState<Agency | null>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state (optimistic updates for preview)
  const [themeColor, setThemeColor] = useState('');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  
  // Load agency data and user role
  useEffect(() => {
    loadAgencyData();
  }, [agencyId]);
  
  const loadAgencyData = async () => {
    if (!agencyId) return;
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      
      try {
      setLoading(true);
      
      // Load agency data
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('id, name, theme_color, banner_url')
        .eq('id', agencyId)
        .single();
        
      if (agencyError) throw agencyError;
      
      // Load user role in agency
      const { data: roleData, error: roleError } = await supabase
        .from('agency_members')
        .select('role')
        .eq('agency_id', agencyId)
        .eq('user_id', user.id)
        .single();
        
      if (roleError) throw roleError;
      
      setAgency(agencyData);
      setUserRole(roleData);
      
      // Initialize form state
      setThemeColor(agencyData.theme_color || '#4F46E5');
      setBannerUrl(agencyData.banner_url);
      setIsDirty(false);
      
    } catch (error) {
      console.error('Failed to load agency data:', error);
      Alert.alert('Error', 'Failed to load agency settings');
          } finally {
        setLoading(false);
      }
    }
  };
  
  // Check if user can edit
  const canEdit = userRole?.role === 'owner' || userRole?.role === 'manager';
  
  // Handle theme color change (optimistic preview)
  const handleThemeColorChange = (color: string) => {
    setThemeColor(color);
    setIsDirty(true);
  };
  
  // Handle manual hex input
  const handleHexInput = (text: string) => {
    // Auto-add # if missing
    const hex = text.startsWith('#') ? text : `#${text}`;
    setThemeColor(hex);
    setIsDirty(true);
  };
  
  // QA: Changing color updates preview immediately; Save writes to DB; Reset reverts
  const handleSave = async () => {
    if (!agency || !canEdit || !isDirty) return;
    
    try {
      setSaving(true);
      
      const { error } = await supabase
        .from('agencies')
        .update({ 
          theme_color: themeColor,
          banner_url: bannerUrl 
        })
        .eq('id', agencyId);
        
      if (error) throw error;
      
      // Update local state
      setAgency(prev => prev ? { ...prev, theme_color: themeColor, banner_url: bannerUrl } : null);
      setIsDirty(false);
      
      Alert.alert('Success', 'Agency settings updated successfully');
      
    } catch (error) {
      console.error('Failed to save settings:', error);
      Alert.alert('Error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };
  
  const handleReset = () => {
    if (!agency) return;
    
    setThemeColor(agency.theme_color || '#4F46E5');
    setBannerUrl(agency.banner_url);
    setIsDirty(false);
  };
  
  // QA: Upload banner: Picks image → uploads to agency-banners/<agencyId>/banner.jpg with upsert: true
  const handleBannerUpload = async () => {
    if (!canEdit || !agencyId) return;
    
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant photo library access to change the banner');
        return;
      }
      
      // Pick image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.9,
        allowsEditing: true,
        aspect: [16, 9],
      });
      
      if (!result.canceled && result.assets[0]) {
        setUploading(true);
        
        const asset = result.assets[0];
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        
        // Upload to Supabase storage
        const path = `${agencyId}/banner.jpg`;
        const { error: uploadError } = await supabase.storage
          .from('agency-banners')
          .upload(path, blob, { 
            upsert: true, 
            contentType: 'image/jpeg' 
          });
          
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: urlData } = supabase.storage
          .from('agency-banners')
          .getPublicUrl(path);
          
        // Update local state for preview
        setBannerUrl(urlData.publicUrl);
        setIsDirty(true);
        
        Alert.alert('Success', 'Banner uploaded successfully. Save changes to apply.');
      }
      
    } catch (error) {
      console.error('Failed to upload banner:', error);
      Alert.alert('Error', 'Failed to upload banner image');
    } finally {
      setUploading(false);
    }
  };
  
  if (loading) {
    return (
      <View className="flex-1 bg-black">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="text-neutral-400 mt-4">Loading agency settings...</Text>
        </View>
      </View>
    );
  }
  
  if (!agency || !userRole) {
    return (
      <View className="flex-1 bg-black justify-center items-center">
        <Text className="text-neutral-400 text-center">Agency not found or access denied</Text>
        <Pressable 
          onPress={() => router.back()}
          className="mt-4 bg-neutral-800 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Go Back</Text>
        </Pressable>
      </View>
    );
  }
  
  return (
    <View className="flex-1 bg-black">
      {/* Header */}
      <View className="bg-neutral-900 border-b border-neutral-800 px-4 py-3 flex-row items-center">
        <Pressable 
          onPress={() => router.back()}
          className="mr-3 p-1"
        >
          <ChevronLeft size={24} color="white" />
        </Pressable>
        <Text className="text-white text-lg font-semibold">Agency Settings</Text>
      </View>
      
      <ScrollView className="flex-1 px-4 py-6" showsVerticalScrollIndicator={false}>
        
        {/* Live Preview Hero */}
        <View className="bg-neutral-900 rounded-2xl p-4 shadow-lg mb-6">
          <Text className="text-white font-semibold mb-3">Live Preview</Text>
          
          <View className="relative h-48 rounded-xl overflow-hidden">
            {/* Banner Image or Theme Color Fallback */}
            {bannerUrl ? (
              <Image 
                source={{ uri: bannerUrl }}
                className="w-full h-full"
                contentFit="cover"
              />
            ) : (
              <View 
                className="w-full h-full"
                style={{ backgroundColor: themeColor }}
              />
            )}
            
            {/* Gradient Overlay for Text Contrast */}
            <View className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            {/* Agency Name Overlay */}
            <View className="absolute bottom-4 left-4">
              <Text className="text-white text-2xl font-semibold mb-1">
                {agency.name}
              </Text>
              <Text className="text-neutral-300 text-sm">Preview</Text>
            </View>
          </View>
        </View>
        
        {/* Theme Color Section */}
        <View className="bg-neutral-900 rounded-2xl p-4 shadow-lg mb-6">
          <Text className="text-white font-semibold mb-3">Theme Color</Text>
          
          {/* Color Presets */}
          <View className="mb-4">
            <Text className="text-neutral-400 text-sm mb-2">Quick Pick</Text>
            <ColorSwatchRow 
              presets={COLOR_PRESETS}
              value={themeColor}
              onPick={handleThemeColorChange}
            />
          </View>
          
          {/* Manual Hex Input */}
          <View>
            <Text className="text-neutral-400 text-sm mb-2">Custom Color</Text>
            <TextInput
              value={themeColor}
              onChangeText={handleHexInput}
              placeholder="#4F46E5"
              placeholderTextColor="#6B7280"
              className={`bg-neutral-800 border rounded-lg px-3 py-2 text-white ${
                isValidHex(themeColor) ? 'border-neutral-600' : 'border-red-500'
              }`}
              editable={canEdit}
            />
            {!isValidHex(themeColor) && (
              <Text className="text-red-400 text-xs mt-1">
                Use 7 characters, e.g. #4F46E5
              </Text>
            )}
          </View>
        </View>
        
        {/* Banner Image Section */}
        <View className="bg-neutral-900 rounded-2xl p-4 shadow-lg mb-6">
          <Text className="text-white font-semibold mb-3">Banner Image</Text>
          
          <Pressable
            onPress={handleBannerUpload}
            disabled={!canEdit || uploading}
            className={`flex-row items-center justify-center py-3 px-4 rounded-lg border-2 border-dashed ${
              canEdit 
                ? 'border-neutral-600 border-neutral-500' 
                : 'border-neutral-700 border-neutral-600'
            }`}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Upload size={20} color={canEdit ? "#6B7280" : "#4B5563"} />
            )}
            <Text className={`ml-2 ${canEdit ? 'text-neutral-400' : 'text-neutral-500'}`}>
              {uploading ? 'Uploading...' : 'Change Banner'}
            </Text>
          </Pressable>
          
          {bannerUrl && (
            <Text className="text-neutral-400 text-xs mt-2 text-center">
              Current: {bannerUrl.split('/').pop()}
            </Text>
          )}
        </View>
        
        {/* Non-admin Notice */}
        {!canEdit && (
          <View className="bg-neutral-800 rounded-lg p-4 mb-6 flex-row items-center">
            <Lock size={16} color="#6B7280" />
            <Text className="text-neutral-400 ml-2 flex-1">
              Only owners and managers can edit branding.
            </Text>
          </View>
        )}
        
        {/* Action Buttons */}
        {canEdit && (
          <View className="flex-row gap-3 mb-8">
            <Pressable
              onPress={handleSave}
              disabled={!isDirty || !isValidHex(themeColor) || saving}
              className={`flex-1 py-3 px-6 rounded-lg flex-row items-center justify-center ${
                isDirty && isValidHex(themeColor) && !saving
                  ? 'bg-blue-600' 
                  : 'bg-neutral-700'
              }`}
            >
              {saving ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Save size={20} color="white" />
              )}
              <Text className="text-white font-semibold ml-2">
                {saving ? 'Saving...' : 'Save Changes'}
              </Text>
            </Pressable>
            
            <Pressable
              onPress={handleReset}
              disabled={!isDirty || saving}
              className="py-3 px-6 rounded-lg border border-neutral-600 flex-row items-center"
            >
              <RotateCcw size={20} color="#9CA3AF" />
              <Text className="text-neutral-400 font-semibold ml-2">Reset</Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
