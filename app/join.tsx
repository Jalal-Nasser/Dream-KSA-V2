import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  StyleSheet,
  SafeAreaView,
  Clipboard,
  ToastAndroid,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../lib/supabase';
import Constants from 'expo-constants';
import { Copy, Mic } from 'lucide-react-native';

export default function Join() {
  const [roomId, setRoomId] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Get functions base URL from app config
  const functionsBaseUrl = Constants.expoConfig?.extra?.FUNCTIONS_BASE_URL ||
    'https://kgcpeoidouajwytndtqi.functions.supabase.co';

  useEffect(() => {
    // Prefill display name from user profile
    const getUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try to get profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, phone')
            .eq('id', user.id)
            .single();

          if (profile?.display_name) {
            setDisplayName(profile.display_name);
          } else if (profile?.phone) {
            // Use last 4 digits of phone as fallback
            const phoneTail = profile.phone.slice(-4);
            setDisplayName(`User${phoneTail}`);
          } else {
            setDisplayName('Guest');
          }
        }
      } catch (error) {
        console.log('Could not fetch user profile:', error);
        setDisplayName('Guest');
      }
    };

    getUserProfile();
  }, []);

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (text) {
        setRoomId(text.trim());
        if (Platform.OS === 'android') {
          ToastAndroid.show('Room ID pasted', ToastAndroid.SHORT);
        }
      }
    } catch (error) {
      console.log('Failed to read clipboard:', error);
    }
  };

  const validateInputs = () => {
    if (!roomId.trim()) {
      setError('Room ID is required');
      return false;
    }

    // Basic UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(roomId.trim())) {
      setError('Please enter a valid Room ID (UUID format)');
      return false;
    }

    if (!displayName.trim()) {
      setError('Display name is required');
      return false;
    }

    setError('');
    return true;
  };

  const handleJoin = async () => {
    if (!validateInputs()) return;

    try {
      setLoading(true);
      setError('');

      // Get current session and access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session?.access_token) {
        throw new Error('Authentication required. Please log in again.');
      }

      // Call hms-token Edge Function
      const response = await fetch(`${functionsBaseUrl}/hms-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: session.user.id,
          user_name: displayName.trim(),
          role: 'listener',
          room_id: roomId.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to get token (${response.status})`);
      }

      const { token, room_id } = await response.json();

      if (!token) {
        throw new Error('No token received from server');
      }

      // Navigate to voicechat with params
      router.push({
        pathname: '/voicechat',
        params: {
          roomId: room_id || roomId.trim(),
          token,
          userName: displayName.trim(),
        },
      });

    } catch (error: any) {
      console.error('Join room error:', error);
      setError(error.message || 'Failed to join room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Mic size={32} color="#3B82F6" />
          <Text style={styles.title}>Join a Voice Room</Text>
          <Text style={styles.subtitle}>Enter the Room ID and your display name to join</Text>
        </View>

        <View style={styles.form}>
          {/* Room ID Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Room ID</Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                placeholder="Enter Room ID (UUID)"
                value={roomId}
                onChangeText={(text) => {
                  setRoomId(text);
                  setError(''); // Clear error when typing
                }}
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
              />
              <Pressable
                style={styles.pasteButton}
                onPress={pasteFromClipboard}
              >
                <Copy size={20} color="#6B7280" />
              </Pressable>
            </View>
          </View>

          {/* Display Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Display Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your display name"
              value={displayName}
              onChangeText={(text) => {
                setDisplayName(text);
                setError(''); // Clear error when typing
              }}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Join Button */}
          <Pressable
            style={[styles.joinButton, loading && styles.joinButtonDisabled]}
            onPress={handleJoin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.joinButtonText}>Join Room</Text>
            )}
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    gap: 24,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#1F2937',
  },
  pasteButton: {
    padding: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  errorContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  joinButtonDisabled: {
    backgroundColor: '#9CA3AF',
    shadowOpacity: 0.1,
  },
  joinButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});
