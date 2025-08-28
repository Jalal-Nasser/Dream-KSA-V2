import React, { useState } from 'react';
import { View, Text, Pressable, Image, Alert, ActivityIndicator } from 'react-native';
import { Camera, User } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

interface AvatarPickerProps {
  currentAvatarUrl: string | null;
  onAvatarChange: (uri: string) => void;
  loading?: boolean;
}

export default function AvatarPicker({ currentAvatarUrl, onAvatarChange, loading = false }: AvatarPickerProps) {
  const [uploading, setUploading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera roll permissions to select an avatar image.',
        [{ text: 'OK' }]
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    if (loading || uploading) return;

    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      setUploading(true);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        maxWidth: 400,
        maxHeight: 400,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        onAvatarChange(uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const takePhoto = async () => {
    if (loading || uploading) return;

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Please grant camera permissions to take a photo.',
        [{ text: 'OK' }]
      );
      return;
    }

    try {
      setUploading(true);

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        maxWidth: 400,
        maxHeight: 400,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const uri = result.assets[0].uri;
        onAvatarChange(uri);
      }
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    if (loading || uploading) return;

    Alert.alert(
      'Change Avatar',
      'Choose how you want to update your avatar',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Library', onPress: pickImage },
      ]
    );
  };

  return (
    <View className="items-center">
      {/* Avatar Display */}
      <View className="relative">
        <View className="w-24 h-24 rounded-full overflow-hidden bg-gray-700 border-2 border-gray-600">
          {currentAvatarUrl ? (
            <Image
              source={{ uri: currentAvatarUrl }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full items-center justify-center">
              <User size={32} color="#6B7280" />
            </View>
          )}
        </View>

        {/* Loading Overlay */}
        {(loading || uploading) && (
          <View className="absolute inset-0 bg-black/50 rounded-full items-center justify-center">
            <ActivityIndicator size="small" color="white" />
          </View>
        )}

        {/* Change Avatar Button */}
        <Pressable
          onPress={showImageOptions}
          className="absolute -bottom-2 -right-2 bg-blue-600 w-8 h-8 rounded-full items-center justify-center"
          disabled={loading || uploading}
        >
          <Camera size={16} color="white" />
        </Pressable>
      </View>

      {/* Status Text */}
      {uploading && (
        <Text className="text-gray-400 text-sm mt-2">Uploading...</Text>
      )}
      
      {loading && (
        <Text className="text-gray-400 text-sm mt-2">Processing...</Text>
      )}
    </View>
  );
}
