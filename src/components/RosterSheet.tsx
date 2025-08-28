import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { BottomSheetModal, BottomSheetView } from '@gorhom/bottom-sheet';
import { Users, Mic, MicOff, UserMinus, UserCheck } from 'lucide-react-native';

interface RosterItem {
  peer: any; // HMSPeer type
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
  onMute: (peer: any) => void;
  onKick: (peer: any) => void;
  onMakeListener: (peer: any) => void;
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
      listener: styles.listenerChip,
      speaker: styles.speakerChip,
      moderator: styles.moderatorChip,
    };
    
    return (
      <View style={[styles.roleChip, roleColors[role as keyof typeof roleColors] || styles.listenerChip]}>
        <Text style={styles.roleChipText}>
          {role}
        </Text>
      </View>
    );
  };
  
  const renderVipChip = (vip: { name: string; color: string }) => (
    <View 
      style={[styles.vipChip, { backgroundColor: vip.color }]}
    >
      <Text style={styles.vipChipText}>
        {vip.name}
      </Text>
    </View>
  );
  
  const renderAdminActions = (item: RosterItem) => {
    if (!canAdmin) return null;

    return (
      <View style={styles.adminActions}>
        {/* Mute Button */}
        <Pressable
          onPress={() => onMute(item.peer)}
          style={styles.muteButton}
        >
          <MicOff size={14} color="white" />
        </Pressable>
        
        {/* Make Listener Button */}
        <Pressable
          onPress={() => onMakeListener(item.peer)}
          style={styles.makeListenerButton}
        >
          <UserCheck size={14} color="white" />
        </Pressable>
        
        {/* Kick Button */}
        <Pressable
          onPress={() => onKick(item.peer)}
          style={styles.kickButton}
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
      backgroundStyle={styles.bottomSheetBackground}
      handleIndicatorStyle={styles.handleIndicator}
    >
      <BottomSheetView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <Users size={20} color="#6b5ce7" />
              <Text style={styles.headerTitle}>
                Participants ({items.length})
              </Text>
            </View>
            
            <Pressable
              onPress={onClose}
              style={styles.closeButton}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </Pressable>
          </View>
        </View>

        {/* Roster List */}
        <ScrollView style={styles.rosterList} showsVerticalScrollIndicator={false}>
          {items.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No participants in room
              </Text>
            </View>
          ) : (
            items.map((item, index) => (
              <View
                key={item.peer.peerID || index}
                style={[styles.rosterItem, index < items.length - 1 && styles.rosterItemBorder]}
              >
                {/* Participant Info */}
                <View style={styles.participantInfo}>
                  <View style={styles.participantHeader}>
                    <Text style={styles.participantName}>
                      {item.name}
                    </Text>
                    {renderRoleChip(item.role)}
                    {item.vip && renderVipChip(item.vip)}
                  </View>
                  
                  <Text style={styles.peerId}>
                    Peer ID: {(item.peer.peerID || 'unknown').slice(0, 8)}...
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
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Admin controls enabled • Use with caution
            </Text>
          </View>
        )}
      </BottomSheetView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  bottomSheetBackground: {
    backgroundColor: '#1f2937',
  },
  handleIndicator: {
    backgroundColor: '#6b7280',
  },
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  closeButton: {
    backgroundColor: '#374151',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  rosterList: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#9CA3AF',
    textAlign: 'center',
  },
  rosterItem: {
    paddingVertical: 12,
  },
  rosterItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  participantInfo: {
    flex: 1,
    marginRight: 12,
  },
  participantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  participantName: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    marginRight: 8,
  },
  peerId: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  roleChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  listenerChip: {
    backgroundColor: '#4B5563',
  },
  speakerChip: {
    backgroundColor: '#059669',
  },
  moderatorChip: {
    backgroundColor: '#2563EB',
  },
  roleChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  vipChip: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  vipChipText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  adminActions: {
    flexDirection: 'row',
    gap: 8,
  },
  muteButton: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  makeListenerButton: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  kickButton: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    backgroundColor: '#1F2937',
  },
  footerText: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
});
