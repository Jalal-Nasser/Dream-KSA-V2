import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, RefreshControl, ActivityIndicator, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Room {
  id: string;
  name: string;
  description?: string;
  is_live: boolean;
  listener_count: number;
  speaker_count: number;
  trending_score: number;
  featured: boolean;
  last_active_at: string;
  agency_id?: string;
  agency_name?: string;
  agency_icon_url?: string;
  banner_url?: string; // Added for agency banner support
  theme_color?: string;
  hms_room_id: string;
}

interface ExploreResponse {
  data: Room[] | null;
  error: string | null;
}

type SortOption = 'featured' | 'trending' | 'active';

const SORT_OPTIONS: { key: SortOption; label: string }[] = [
  { key: 'featured', label: 'Featured' },
  { key: 'trending', label: 'Trending' },
  { key: 'active', label: 'Active' },
];

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<SortOption>('featured');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const functionsBaseUrl = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL;

  const fetchRooms = useCallback(async (sort: SortOption, isRefresh = false) => {
    if (!functionsBaseUrl) {
      setError('Functions base URL not configured');
      setLoading(false);
      return;
    }

    try {
      setError(null);
      if (!isRefresh) setLoading(true);

      const response = await fetch(`${functionsBaseUrl}/explore?sort=${sort}`);
      const result: ExploreResponse = await response.json();

      if (result.error) {
        setError(result.error);
        setRooms([]);
      } else {
        setRooms(result.data || []);
      }
    } catch (err) {
      setError('Failed to fetch rooms');
      setRooms([]);
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [functionsBaseUrl]);

  useEffect(() => {
    fetchRooms(activeTab);
  }, [activeTab, fetchRooms]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms(activeTab, true);
  }, [activeTab, fetchRooms]);

  const handleRoomPress = (room: Room) => {
    if (room.hms_room_id) {
      router.push(`/voicechat?hmsRoomId=${room.hms_room_id}`);
    }
  };

  const renderRoomCard = (room: Room) => (
    <Pressable
      key={room.id}
      onPress={() => handleRoomPress(room)}
      className="bg-gray-800 rounded-2xl mb-4 active:opacity-80 overflow-hidden"
    >
      {/* Banner Header */}
      {(room.banner_url || room.agency_icon_url || room.theme_color) && (
        <View 
          className="h-20 w-full"
          style={{
            backgroundColor: room.theme_color || '#6C5CE7'
          }}
        >
          {/* Priority: banner_url > agency_icon_url > theme_color fallback */}
          {room.banner_url ? (
            <Image
              source={{ uri: room.banner_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : room.agency_icon_url ? (
            <Image
              source={{ uri: room.agency_icon_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : null}
          
          {/* Gradient overlay for text readability */}
          <View className="absolute inset-0 bg-black/30" />
          
          {/* Agency name over banner */}
          {room.agency_name && (
            <View className="absolute bottom-2 left-3">
              <Text className="text-white font-bold text-sm drop-shadow-lg">
                {room.agency_name}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Content */}
      <View className="p-4">
        <View className="flex-row items-start justify-between mb-3">
          <View className="flex-1 mr-3">
            <Text className="text-white font-bold text-lg mb-1" numberOfLines={2}>
              {room.name}
            </Text>
            
            {/* Agency name (if no banner) */}
            {room.agency_name && !room.banner_url && !room.agency_icon_url && (
              <View className="flex-row items-center mb-2">
                {room.theme_color && (
                  <View 
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: room.theme_color }}
                  />
                )}
                <Text className="text-gray-400 text-sm">
                  {room.agency_name}
                </Text>
              </View>
            )}
            
            {room.description && (
              <Text className="text-gray-500 text-sm" numberOfLines={2}>
                {room.description}
              </Text>
            )}
          </View>
          
          {room.featured && (
            <View className="bg-yellow-500 px-2 py-1 rounded-full">
              <Text className="text-black text-xs font-bold">⭐</Text>
            </View>
          )}
        </View>

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center space-x-4">
            <View className="flex-row items-center">
              <Text className="text-gray-400 mr-1">👂</Text>
              <Text className="text-white font-semibold">{room.listener_count}</Text>
            </View>
            <View className="flex-row items-center">
              <Text className="text-gray-400 mr-1">🎙</Text>
              <Text className="text-white font-semibold">{room.speaker_count}</Text>
            </View>
          </View>
          
          <View className="flex-row items-center">
            <Text className="text-gray-400 text-xs mr-1">Score:</Text>
            <Text className="text-green-400 font-semibold text-sm">
              {room.trending_score.toFixed(1)}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );

  const renderContent = () => {
    if (loading && !refreshing) {
      return (
        <View className="flex-1 justify-center items-center py-20">
          <ActivityIndicator size="large" color="#6C5CE7" />
          <Text className="text-gray-400 mt-4">Loading live rooms...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Text className="text-red-400 text-lg font-semibold mb-2">Error</Text>
          <Text className="text-gray-400 text-center mb-4">{error}</Text>
          <Pressable
            onPress={() => fetchRooms(activeTab)}
            className="bg-blue-600 px-6 py-3 rounded-xl"
          >
            <Text className="text-white font-semibold">Try Again</Text>
          </Pressable>
        </View>
      );
    }

    if (rooms.length === 0) {
      return (
        <View className="flex-1 justify-center items-center py-20 px-6">
          <Text className="text-gray-400 text-lg font-semibold mb-2">No Live Rooms</Text>
          <Text className="text-gray-500 text-center">
            There are no live rooms available right now. Check back later!
          </Text>
        </View>
      );
    }

    return (
      <ScrollView
        className="flex-1 px-4"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="py-4">
          {rooms.map(renderRoomCard)}
        </View>
      </ScrollView>
    );
  };

  return (
    <View 
      className="flex-1 bg-gray-900"
      style={{ paddingTop: insets.top }}
    >
      {/* Header */}
      <View className="px-4 py-4 border-b border-gray-800">
        <Text className="text-white text-2xl font-bold mb-4">Explore</Text>
        
        {/* Tabs */}
        <View className="flex-row bg-gray-800 rounded-2xl p-1">
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option.key}
              onPress={() => setActiveTab(option.key)}
              className={`flex-1 py-3 px-4 rounded-xl ${
                activeTab === option.key
                  ? 'bg-blue-600'
                  : 'bg-transparent'
              }`}
            >
              <Text
                className={`text-center font-semibold ${
                  activeTab === option.key
                    ? 'text-white'
                    : 'text-gray-400'
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Content */}
      {renderContent()}
    </View>
  );
}
