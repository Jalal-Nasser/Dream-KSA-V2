import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Users, Mic, MicOff, UserMinus, UserCheck } from 'lucide-react-native';

interface RosterItem {
  peerId: string;
  name: string;
  role: 'listener' | 'speaker' | 'moderator';
  vip?: {
    name: string;
    color: string;
  };
}

interface RosterSheetProps {
  items: RosterItem[];
  visible: boolean;
  onClose: () => void;
  canAdmin: boolean;
  onMute: (peerId: string) => void;
  onKick: (peerId: string) => void;
  onMakeListener: (peerId: string) => void;
}

export default function RosterSheet({
  items,
  visible,
  onClose,
  canAdmin,
  onMute,
  onKick,
  onMakeListener,
}: RosterSheetProps) {
  
  // QA: Non-admin opens roster: no admin buttons rendered
  // QA: Admin sees actions and they work across devices
  
  const renderRoleChip = (role: string) => {
    const roleColors = {
      listener: 'bg-gray-600',
      speaker: 'bg-green-600',
      moderator: 'bg-blue-600',
    };
    
    return (
      <View className={`px-2 py-1 rounded-full ${roleColors[role as keyof typeof roleColors] || 'bg-gray-600'}`}>
        <Text className="text-white text-xs font-semibold uppercase">
          {role}
        </Text>
      </View>
    );
  };

  const renderVipChip = (vip: { name: string; color: string }) => (
    <View 
      className="px-2 py-1 rounded-full border border-yellow-400"
      style={{ backgroundColor: vip.color }}
    >
      <Text className="text-white text-xs font-semibold">
        {vip.name}
      </Text>
    </View>
  );

  const renderAdminActions = (item: RosterItem) => {
    if (!canAdmin) return null;

    return (
      <View className="flex-row gap-2">
        {/* Mute Button */}
        <Pressable
          onPress={() => onMute(item.peerId)}
          className="bg-orange-600 px-3 py-1 rounded-lg"
        >
          <MicOff size={14} color="white" />
        </Pressable>
        
        {/* Make Listener Button */}
        <Pressable
          onPress={() => onMakeListener(item.peerId)}
          className="bg-blue-600 px-3 py-1 rounded-lg"
        >
          <UserCheck size={14} color="white" />
        </Pressable>
        
        {/* Kick Button */}
        <Pressable
          onPress={() => onKick(item.peerId)}
          className="bg-red-600 px-3 py-1 rounded-lg"
        >
          <UserMinus size={14} color="white" />
        </Pressable>
      </View>
    );
  };

  return (
    <BottomSheetModal
      index={visible ? 0 : -1}
      snapPoints={['60%', '90%']}
      onDismiss={onClose}
      enablePanDownToClose
      backgroundStyle={{ backgroundColor: '#1f2937' }}
      handleIndicatorStyle={{ backgroundColor: '#6b7280' }}
    >
      <BottomSheetView className="flex-1">
        {/* Header */}
        <View className="px-4 py-4 border-b border-gray-700">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <Users size={20} color="#6b5ce7" />
              <Text className="text-white text-lg font-semibold ml-2">
                Participants ({items.length})
              </Text>
            </View>
            
            <Pressable
              onPress={onClose}
              className="bg-gray-700 px-3 py-1 rounded-lg"
            >
              <Text className="text-white text-sm">Close</Text>
            </Pressable>
          </View>
        </View>

        {/* Roster List */}
        <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <View className="py-8 items-center">
              <Text className="text-gray-400 text-center">
                No participants in room
              </Text>
            </View>
          ) : (
            items.map((item, index) => (
              <View
                key={item.peerId}
                className={`py-3 flex-row items-center justify-between ${
                  index < items.length - 1 ? 'border-b border-gray-700' : ''
                }`}
              >
                {/* Participant Info */}
                <View className="flex-1 mr-3">
                  <View className="flex-row items-center mb-2">
                    <Text className="text-white font-semibold text-base mr-2">
                      {item.name}
                    </Text>
                    {renderRoleChip(item.role)}
                    {item.vip && renderVipChip(item.vip)}
                  </View>
                  
                  <Text className="text-gray-400 text-sm">
                    Peer ID: {item.peerId.slice(0, 8)}...
                  </Text>
                </View>

                {/* Admin Actions */}
                {renderAdminActions(item)}
              </View>
            ))
          )}
        </ScrollView>

        {/* Footer Info */}
        {canAdmin && (
          <View className="px-4 py-3 border-t border-gray-700 bg-gray-800">
            <Text className="text-gray-400 text-xs text-center">
              Admin controls enabled • Use with caution
            </Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}
