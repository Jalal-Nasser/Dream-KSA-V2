import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, Alert, Switch } from 'react-native';
import { supabase } from '@/supabase';
import { createRoom } from '@/src/db/rooms';

export function RoomCreateModal({
  visible,
  onClose,
  onCreated,
  agencyId,
}: {
  visible: boolean;
  onClose: () => void;
  onCreated?: (roomId: string) => void;
  agencyId: string | null; 
}) {
  const [roomName, setRoomName] = useState('');
  const [startAsFeatured, setStartAsFeatured] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errorText, setErrorText] = useState('');

  // Reset state when modal becomes visible
  useEffect(() => {
    if (visible) {
      setRoomName('');
      setStartAsFeatured(false);
      setErrorText('');
      setBusy(false);
    }
  }, [visible]);

  async function submit() {
    if (roomName.trim().length < 2 || roomName.trim().length > 50) {
      setErrorText('Title must be between 2 and 50 characters.');
      return;
    }
    setErrorText('');
    setBusy(true);
    try {
      const room = await createRoom({
        name: roomName.trim(),
        agency_id: agencyId,
        featured: startAsFeatured,
      });
      onCreated?.(room.id);
      onClose();
    } catch (e: any) {
      setErrorText(e?.message || 'An unknown error occurred.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Create Room</Text>

          <TextInput
            value={roomName}
            onChangeText={setRoomName}
            placeholder="Room title"
            placeholderTextColor="#6b7280"
            style={styles.input}
          />
          
          <View style={styles.switchContainer}>
            <Text style={styles.label}>Start as Featured</Text>
            <Switch
              value={startAsFeatured}
              onValueChange={setStartAsFeatured}
              trackColor={{ false: '#1f2937', true: '#6C5CE7' }}
              thumbColor={startAsFeatured ? 'white' : '#9CA3AF'}
            />
          </View>

          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          <View style={styles.buttonRow}>
            <Pressable onPress={onClose} disabled={busy} style={[styles.button, styles.cancelButton]}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
            <Pressable onPress={submit} disabled={busy} style={[styles.button, styles.createButton]}>
              <Text style={styles.buttonText}>{busy ? 'Creating…' : 'Create Room'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: '#0B1220',
    padding: 20,
    borderRadius: 16,
    width: '100%',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    color: 'white',
    borderWidth: 1,
    borderColor: '#1f2937',
    borderRadius: 12,
    padding: 12,
    marginTop: 6,
    backgroundColor: '#1f2937',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 16,
  },
  label: {
    color: '#9BA7B4',
    fontSize: 16,
  },
  errorText: {
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  button: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#334155',
  },
  createButton: {
    backgroundColor: '#6C5CE7',
  },
  buttonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  }
});

export default RoomCreateModal;




