import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Pressable, 
  RefreshControl, 
  ActivityIndicator, 
  Image,
  Alert 
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Types for the explore API response
interface Room {
  id: string;
  hms_room_id: string;
  title: string;
  is_live: boolean;
  listener_count: number;
  speaker_count: number;
  featured: boolean;
  trending_score: number;
  last_active_at: string;
  agency_id: string;
  agency_name: string;
  theme_color: string;
  banner_url: string;
}

interface ExploreResponse {
  data: Room[];
  error: string | null;
}

type SortOption = 'featured' | 'trending' | 'active';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  // Local state for rooms, loading, and UI
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<SortOption>('featured');
  
  // Abort controller for canceling in-flight requests
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Fetch rooms from the explore edge function
  const fetchRooms = useCallback(async (sortOption: SortOption, isRefresh = false) => {
    // Cancel any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setError(null);
      if (!isRefresh) setLoading(true);
      
      const baseUrl = process.env.EXPO_PUBLIC_FUNCTIONS_BASE_URL;
      if (!baseUrl) {
        throw new Error('Functions base URL not configured');
      }
      
      const response = await fetch(
        `${baseUrl}/explore?sort=${sortOption}`,
        { 
          signal: abortControllerRef.current.signal,
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result: ExploreResponse = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      // QA: Ensure data is properly shaped with fallbacks
      const processedRooms = result.data.map(room => ({
        ...room,
        title: room.title || room.agency_name || 'Untitled Room',
        listener_count: room.listener_count || 0,
        speaker_count: room.speaker_count || 0,
        featured: Boolean(room.featured),
        theme_color: room.theme_color || '#4F46E5'
      }));
      
      setRooms(processedRooms);
      
    } catch (err: any) {
      // Don't show error if request was aborted
      if (err.name === 'AbortError') return;
      
      console.error('Explore fetch error:', err);
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);
  
  // Fetch on mount and when sort changes
  useEffect(() => {
    fetchRooms(sort);
    
    // Cleanup: abort any pending request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [sort, fetchRooms]);
  
  // Handle pull-to-refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms(sort, true);
  }, [sort, fetchRooms]);
  
  // Handle sort tab changes
  const handleSortChange = useCallback((newSort: SortOption) => {
    if (newSort !== sort) {
      setSort(newSort);
      // QA: Switching tabs re-fetches and cancels prior request
    }
  }, [sort]);
  
  // Navigate to voice chat
  const handleRoomPress = useCallback((room: Room) => {
    // QA: Voice navigation receives hmsRoomId
    router.push({
      pathname: '/voicechat',
      params: { hmsRoomId: room.hms_room_id }
    });
  }, [router]);
  
  // Render skeleton loading cards
  const renderSkeletonCards = () => {
    return Array.from({ length: 6 }).map((_, index) => (
      <View key={index} className="bg-neutral-900 rounded-2xl mb-3 overflow-hidden">
        {/* Banner skeleton */}
        <View className="h-40 bg-neutral-800" />
        {/* Stats skeleton */}
        <View className="p-3">
          <View className="flex-row justify-between items-center">
            <View className="h-4 bg-neutral-800 rounded w-24" />
            <View className="h-4 bg-neutral-800 rounded w-16" />
          </View>
        </View>
      </View>
    ));
  };
  
  // Render a single room card
  const renderRoomCard = (room: Room) => {
    const hasBanner = Boolean(room.banner_url);
    const backgroundColor = hasBanner ? undefined : (room.theme_color || '#4F46E5');
    
    return (
      <Pressable
        key={room.id}
        className="bg-neutral-900 rounded-2xl mb-3 overflow-hidden"
        onPress={() => handleRoomPress(room)}
        accessibilityLabel={`${room.title}, ${room.listener_count} listeners, ${room.speaker_count} speakers`}
        accessibilityRole="button"
      >
        {/* Banner area - 160px height with image or color block */}
        <View className="h-40 w-full relative">
          {hasBanner ? (
            <Image
              source={{ uri: room.banner_url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View 
              className="w-full h-full"
              style={{ backgroundColor }}
            />
          )}
          
          {/* Gradient overlay for text contrast */}
          <View className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          
          {/* Room title and agency name overlaid on banner */}
          <View className="absolute bottom-4 left-4 right-4">
            <Text className="text-white font-semibold text-xl mb-1 drop-shadow-lg">
              {room.title}
            </Text>
            <Text className="text-white text-sm opacity-80 drop-shadow-lg">
              {room.agency_name}
            </Text>
          </View>
        </View>
        
        {/* Stats row under banner */}
        <View className="flex-row justify-between items-center p-3">
          <View className="flex-row items-center">
            <Text className="text-white text-sm">
              👂 {room.listener_count} · 🎙 {room.speaker_count}
            </Text>
          </View>
          
          {/* Featured chip - only show when featured=true */}
          {room.featured && (
            <View className="px-2 py-1 border border-blue-500/30 rounded-full">
              <Text className="text-blue-400 text-xs font-bold uppercase">
                Featured
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    );
  };
  
  // Render error state
  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-red-400 text-lg font-semibold text-center mb-2">
        Failed to load rooms
      </Text>
      <Text className="text-gray-400 text-center mb-6">
        {error}
      </Text>
      <Pressable
        className="bg-blue-600 px-6 py-3 rounded-xl"
        onPress={() => fetchRooms(sort)}
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </Pressable>
    </View>
  );
  
  // Render empty state
  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6">
      <Text className="text-white text-xl font-semibold text-center mb-2">
        No live rooms yet
      </Text>
      <Text className="text-gray-400 text-center">
        Check other tabs or come back later
      </Text>
    </View>
  );
  
  // Render tabs header
  const renderTabs = () => (
    <View className="flex-row gap-2 p-3">
      {(['featured', 'trending', 'active'] as const).map((sortOption) => (
        <Pressable
          key={sortOption}
          className={`px-4 py-2 rounded-full ${
            sort === sortOption 
              ? 'bg-white' 
              : 'bg-neutral-800'
          }`}
          onPress={() => handleSortChange(sortOption)}
          accessibilityLabel={`${sortOption} rooms`}
          accessibilityRole="tab"
          accessibilityState={{ selected: sort === sortOption }}
        >
          <Text 
            className={`font-semibold capitalize ${
              sort === sortOption ? 'text-black' : 'text-white'
            }`}
          >
            {sortOption}
          </Text>
        </Pressable>
      ))}
    </View>
  );
  
  return (
    <View 
      className="flex-1 bg-black"
      style={{ paddingTop: insets.top }}
    >
      {/* Tabs header */}
      {renderTabs()}
      
      {/* Content area */}
      {loading && !refreshing ? (
        // QA: Skeleton shimmer while loading
        <ScrollView className="flex-1 px-4">
          {renderSkeletonCards()}
        </ScrollView>
      ) : error ? (
        // QA: Error state renders correctly
        renderErrorState()
      ) : rooms.length === 0 ? (
        // QA: Empty state renders correctly
        renderEmptyState()
      ) : (
        // Main content with pull-to-refresh
        <ScrollView 
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#6C5CE7"
              colors={['#6C5CE7']}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* QA: Pull-to-refresh works on all tabs */}
          {rooms.map(renderRoomCard)}
        </ScrollView>
      )}
    </View>
  );
}
