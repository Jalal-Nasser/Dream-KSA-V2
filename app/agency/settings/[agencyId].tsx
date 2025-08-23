import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, Alert, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';
import { Camera, Save, RotateCcw, ArrowLeft } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import ColorSwatchRow from '@/src/components/ColorSwatchRow';
import { isValidHex, normalizeHex } from '@/src/lib/validateColor';

interface Agency {
  id: string;
  name: string;
  theme_color: string;
  banner_url: string | null;
}

interface AgencyMember {
  role: 'owner' | 'manager' | 'host' | 'member';
}

export default function AgencySettingsScreen() {
  const { agencyId } = useLocalSearchParams<{ agencyId: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // State
  const [agency, setAgency] = useState<Agency | null>(null);
  const [userRole, setUserRole] = useState<AgencyMember['role'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Form state
  const [themeColor, setThemeColor] = useState('');
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [originalThemeColor, setOriginalThemeColor] = useState('');
  const [originalBannerUrl, setOriginalBannerUrl] = useState<string | null>(null);
  
  // Validation
  const [colorError, setColorError] = useState<string | null>(null);
  const isDirty = themeColor !== originalThemeColor || bannerUrl !== originalBannerUrl;
  const canSave = isDirty && !colorError && !saving && !uploading;

  // Fetch agency data and check user permissions
  const fetchAgencyData = useCallback(async () => {
    if (!agencyId) return;

    try {
      setLoading(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      // Fetch agency data
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('id, name, theme_color, banner_url')
        .eq('id', agencyId)
        .single();

      if (agencyError) {
        console.error('Agency fetch error:', agencyError);
        Alert.alert('Error', 'Failed to fetch agency data');
        return;
      }

      if (!agencyData) {
        Alert.alert('Error', 'Agency not found');
        return;
      }

      // Fetch user's role in this agency
      const { data: memberData, error: memberError } = await supabase
        .from('agency_members')
        .select('role')
        .eq('agency_id', agencyId)
        .eq('user_id', user.id)
        .single();

      if (memberError) {
        console.error('Member fetch error:', memberError);
        Alert.alert('Error', 'Failed to fetch membership data');
        return;
      }

      // Set state
      setAgency(agencyData);
      setUserRole(memberData.role);
      setThemeColor(agencyData.theme_color || '#4F46E5');
      setBannerUrl(agencyData.banner_url);
      setOriginalThemeColor(agencyData.theme_color || '#4F46E5');
      setOriginalBannerUrl(agencyData.banner_url);

    } catch (error) {
      console.error('Fetch error:', error);
      Alert.alert('Error', 'Failed to load agency data');
    } finally {
      setLoading(false);
    }
  }, [agencyId]);

  useEffect(() => {
    fetchAgencyData();
  }, [fetchAgencyData]);

  // Handle theme color changes
  const handleThemeColorChange = useCallback((color: string) => {
    setThemeColor(color);
    
    if (!isValidHex(color)) {
      setColorError('Invalid hex color format');
    } else {
      setColorError(null);
    }
  }, []);

  // Handle banner image selection and upload
  const handleBannerChange = useCallback(async () => {
    if (!agencyId || uploading) return;

    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to select a banner image.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9], // Banner aspect ratio
        quality: 0.8,
        maxWidth: 1200,
        maxHeight: 675,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadBanner(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Banner selection error:', error);
      Alert.alert('Error', 'Failed to select banner image');
    }
  }, [agencyId, uploading]);

  // Upload banner to Supabase Storage
  const uploadBanner = useCallback(async (uri: string) => {
    if (!agencyId) return;

    try {
      setUploading(true);

      // Convert image to blob
      const response = await fetch(uri);
      const blob = await response.blob();

      // Upload to Supabase Storage
      const filePath = `${agencyId}/banner.jpg`;
      const { data, error } = await supabase.storage
        .from('agency-banners')
        .upload(filePath, blob, {
          upsert: true,
          contentType: 'image/jpeg'
        });

      if (error) {
        console.error('Banner upload error:', error);
        Alert.alert('Error', 'Failed to upload banner image');
        return;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('agency-banners')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;
      
      // Update local state immediately for UI preview
      setBannerUrl(publicUrl);
      
      // Update database with new banner URL
      const { error: updateError } = await supabase
        .from('agencies')
        .update({ banner_url: publicUrl })
        .eq('id', agencyId);

      if (updateError) {
        console.error('Database update error:', updateError);
        Alert.alert('Warning', 'Banner uploaded but failed to save URL. Please try saving again.');
        return;
      }

      // Update original state to reflect successful save
      setOriginalBannerUrl(publicUrl);
      
      Alert.alert('Success', 'Banner uploaded and saved successfully');

    } catch (error) {
      console.error('Banner upload error:', error);
      Alert.alert('Error', 'Failed to upload banner image');
    } finally {
      setUploading(false);
    }
  }, [agencyId]);

  // Save changes to database
  const handleSave = useCallback(async () => {
    if (!agencyId || !canSave) return;

    try {
      setSaving(true);

      const normalizedColor = normalizeHex(themeColor);
      if (!normalizedColor) {
        Alert.alert('Error', 'Invalid theme color');
        return;
      }

      const { error } = await supabase
        .from('agencies')
        .update({
          theme_color: normalizedColor,
          banner_url: bannerUrl
        })
        .eq('id', agencyId);

      if (error) {
        console.error('Save error:', error);
        Alert.alert('Error', 'Failed to save changes');
        return;
      }

      // Update local state
      setOriginalThemeColor(normalizedColor);
      setOriginalBannerUrl(bannerUrl);
      setThemeColor(normalizedColor);
      
      Alert.alert('Success', 'Agency branding updated successfully');

    } catch (error) {
      console.error('Save error:', error);
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  }, [agencyId, canSave, themeColor, bannerUrl]);

  // Reset to original values
  const handleReset = useCallback(() => {
    setThemeColor(originalThemeColor);
    setBannerUrl(originalBannerUrl);
    setColorError(null);
  }, [originalThemeColor, originalBannerUrl]);

  // Loading state
  if (loading) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <ActivityIndicator size="large" color="#6C5CE7" />
        <Text className="text-gray-400 mt-4">Loading agency settings...</Text>
      </View>
    );
  }

  // Agency not found
  if (!agency) {
    return (
      <View className="flex-1 bg-gray-900 justify-center items-center">
        <Text className="text-red-400 text-lg">Agency not found</Text>
        <Pressable
          onPress={() => router.back()}
          className="bg-blue-600 px-6 py-3 rounded-xl mt-4"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  // Check if user can edit
  const canEdit = userRole === 'owner' || userRole === 'manager';

  return (
    <View 
      className="flex-1 bg-gray-900"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-800">
        <View className="flex-row items-center justify-between">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center"
          >
            <ArrowLeft size={20} color="#6C5CE7" />
            <Text className="text-white font-semibold ml-2">Back</Text>
          </Pressable>
          
          <Text className="text-white text-lg font-bold">Agency Settings</Text>
          
          <View className="w-16" /> {/* Spacer for centering */}
        </View>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        {/* Agency Banner Header */}
        <View className="mb-6">
          <View className="h-40 w-full rounded-2xl overflow-hidden relative">
            {bannerUrl ? (
              <Image
                source={{ uri: bannerUrl }}
                className="w-full h-full"
                resizeMode="cover"
              />
            ) : (
              <View 
                className="w-full h-full"
                style={{ backgroundColor: isValidHex(themeColor) ? themeColor : '#4F46E5' }}
              />
            )}
            
            {/* Gradient overlay for text readability */}
            <View className="absolute inset-0 bg-black/40" />
            
            {/* Agency name over banner */}
            <View className="absolute bottom-4 left-4 right-4">
              <Text className="text-white font-bold text-2xl mb-1 drop-shadow-lg">
                {agency.name}
              </Text>
              <Text className="text-white text-sm opacity-90 drop-shadow-lg">
                Customize your agency's branding
              </Text>
            </View>
            
            {/* Banner Action Buttons - Only for admins */}
            {canEdit && (
              <View className="absolute top-4 right-4 flex-row gap-2">
                {/* Change Banner Button */}
                <Pressable
                  onPress={handleBannerChange}
                  className="bg-blue-600 px-4 py-2 rounded-full flex-row items-center"
                  disabled={uploading}
                >
                  {uploading ? (
                    <ActivityIndicator size="small" color="white" />
                  ) : (
                    <Camera size={16} color="white" />
                  )}
                  <Text className="text-white font-semibold ml-2 text-sm">
                    {uploading ? 'Uploading...' : 'Change'}
                  </Text>
                </Pressable>
                
                {/* Remove Banner Button - Only show if banner exists */}
                {bannerUrl && (
                  <Pressable
                    onPress={() => {
                      Alert.alert(
                        'Remove Banner',
                        'Are you sure you want to remove the current banner?',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          {
                            text: 'Remove',
                            style: 'destructive',
                            onPress: async () => {
                              try {
                                // Remove from storage
                                const filePath = `${agencyId}/banner.jpg`;
                                await supabase.storage
                                  .from('agency-banners')
                                  .remove([filePath]);
                                
                                // Update database
                                await supabase
                                  .from('agencies')
                                  .update({ banner_url: null })
                                  .eq('id', agencyId);
                                
                                // Update local state
                                setBannerUrl(null);
                                setOriginalBannerUrl(null);
                                
                                Alert.alert('Success', 'Banner removed successfully');
                              } catch (error) {
                                console.error('Banner removal error:', error);
                                Alert.alert('Error', 'Failed to remove banner');
                              }
                            }
                          }
                        ]
                      );
                    }}
                    className="bg-red-600 px-3 py-2 rounded-full"
                  >
                    <Text className="text-white font-semibold text-sm">×</Text>
                  </Pressable>
                )}
              </View>
            )}
          </View>
        </View>

        {/* Permission Notice */}
        {!canEdit && (
          <View className="bg-yellow-900/20 border border-yellow-600/30 rounded-xl p-4 mb-6">
            <Text className="text-yellow-400 text-center font-medium">
              Only agency owners and managers can edit branding settings.
            </Text>
          </View>
        )}

        {/* Theme Color Section */}
        <View className="mb-8">
          <Text className="text-white text-lg font-semibold mb-4">Theme Color</Text>
          
          {/* Color Input */}
          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-2">Hex Color Code</Text>
            <TextInput
              value={themeColor}
              onChangeText={handleThemeColorChange}
              className={`bg-gray-800 text-white px-4 py-3 rounded-xl border-2 ${
                colorError ? 'border-red-500' : 'border-gray-700'
              } focus:border-white`}
              placeholder="#4F46E5"
              placeholderTextColor="#6B7280"
              editable={canEdit}
              maxLength={7}
            />
            {colorError && (
              <Text className="text-red-400 text-sm mt-2">{colorError}</Text>
            )}
          </View>

          {/* Color Swatches */}
          <View className="mb-4">
            <Text className="text-gray-300 text-sm mb-3 text-center">Quick Presets</Text>
            <ColorSwatchRow
              onPick={handleThemeColorChange}
              selectedColor={themeColor}
            />
          </View>

          {/* Color Preview */}
          <View className="items-center">
            <Text className="text-gray-300 text-sm mb-2">Preview</Text>
            <View 
              className="w-20 h-20 rounded-xl border-2 border-gray-600"
              style={{ backgroundColor: isValidHex(themeColor) ? themeColor : '#4F46E5' }}
            />
          </View>
        </View>

        {/* Banner Section */}
        <View className="mb-8">
          <Text className="text-white text-lg font-semibold mb-4">Banner Image</Text>
          
          {/* Banner Picker */}
          {canEdit && (
            <Pressable
              onPress={handleBannerChange}
              className="bg-gray-800 border-2 border-gray-700 border-dashed rounded-xl p-6 mb-4 items-center"
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator size="large" color="#6C5CE7" />
              ) : (
                <>
                  <Camera size={32} color="#6C5CE7" />
                  <Text className="text-gray-400 mt-2 text-center">
                    Tap to select banner image
                  </Text>
                  <Text className="text-gray-500 text-sm mt-1 text-center">
                    Recommended: 1200x675 (16:9 ratio)
                  </Text>
                </>
              )}
            </Pressable>
          )}

          {/* Current Banner Display */}
          {bannerUrl && (
            <View className="mb-4">
              <Text className="text-gray-300 text-sm mb-2">Current Banner</Text>
              <Image
                source={{ uri: bannerUrl }}
                className="w-full h-32 rounded-xl"
                resizeMode="cover"
              />
            </View>
          )}
        </View>

        {/* Live Preview Card */}
        <View className="mb-8">
          <Text className="text-white text-lg font-semibold mb-4">Live Preview</Text>
          
          <View className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg">
            {/* Banner Area */}
            <View className="h-40 w-full relative">
              {bannerUrl ? (
                <Image
                  source={{ uri: bannerUrl }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              ) : (
                <View 
                  className="w-full h-full"
                  style={{ backgroundColor: isValidHex(themeColor) ? themeColor : '#4F46E5' }}
                />
              )}
              
              {/* Gradient Overlay for Text Contrast */}
              <View className="absolute inset-0 bg-black/30" />
              
              {/* Preview Content */}
              <View className="absolute bottom-4 left-4 right-4">
                <View className="flex-row items-center justify-between">
                  <Text className="text-white font-bold text-xl">
                    {agency.name}
                  </Text>
                  <View 
                    className="px-3 py-1 rounded-full"
                    style={{ backgroundColor: isValidHex(themeColor) ? themeColor : '#4F46E5' }}
                  >
                    <Text className="text-white text-xs font-bold">
                      LIVE preview
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* Card Content */}
            <View className="p-4">
              <Text className="text-gray-300 text-sm">
                This is how your agency will appear in room cards and explore screens.
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        {canEdit && (
          <View className="flex-row gap-3 mb-8">
            <Pressable
              onPress={handleReset}
              className="flex-1 bg-gray-700 px-6 py-3 rounded-xl border border-gray-600"
              disabled={!isDirty || saving}
            >
              <RotateCcw size={20} color="#9CA3AF" />
              <Text className="text-gray-300 font-semibold ml-2">Reset</Text>
            </Pressable>
            
            <Pressable
              onPress={handleSave}
              className="flex-1 bg-blue-600 px-6 py-3 rounded-xl flex-row items-center justify-center"
              disabled={!canSave}
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
          </View>
        )}
      </ScrollView>
    </View>
  );
}
