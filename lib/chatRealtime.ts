import { RealtimeChannel } from '@supabase/supabase-js';
import { getSupabase } from './supabase';

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
  author_name?: string; // denormalized for UI
}

export interface BroadcastMessage extends ChatMessage {
  type: 'broadcast';
  event: 'chat';
}

/**
 * Get a chat channel for a room with broadcast configuration
 */
export function getChatChannel(roomId: string): RealtimeChannel {
  const supabase = getSupabase();
  return supabase.channel(`room:${roomId}:chat`, {
    config: {
      broadcast: { self: true }
    }
  });
}

/**
 * Subscribe to chat events for a room
 * @param roomId - The room ID
 * @param onBroadcastMessage - Callback for instant broadcast messages
 * @param onDbInsert - Callback for database insert events (authoritative)
 * @returns Object with channel and unsubscribe function
 */
export function subscribeChat(
  roomId: string,
  onBroadcastMessage: (message: ChatMessage) => void,
  onDbInsert: (message: ChatMessage) => void
) {
  const channel = getChatChannel(roomId);
  
  // Subscribe to broadcast events for instant peer messages
  channel.on('broadcast', { event: 'chat' }, (payload) => {
    const message = payload.payload as ChatMessage;
    onBroadcastMessage(message);
  });

  // Subscribe to database changes for authoritative history
  channel.on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `room_id=eq.${roomId}`
  }, (payload) => {
    const message = payload.new as ChatMessage;
    onDbInsert(message);
  });

  // Subscribe to the channel
  channel.subscribe();

  return {
    channel,
    unsubscribe: () => {
      channel.unsubscribe();
    }
  };
}

/**
 * Broadcast a chat message to all room participants
 * @param channel - The chat channel
 * @param message - The message to broadcast
 */
export function broadcastChat(channel: RealtimeChannel, message: ChatMessage) {
  const broadcastMessage: BroadcastMessage = {
    ...message,
    type: 'broadcast',
    event: 'chat'
  };
  
  channel.send({
    type: 'broadcast',
    event: 'chat',
    payload: broadcastMessage
  });
}
