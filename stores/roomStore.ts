import { create } from 'zustand';
import { switchToListener, switchToSpeaker, joinHms } from '@/lib/hms';
import { cancelHand, grantMic, raiseHand, revokeMic, watchMicRequests } from '@/lib/db';

type MicStatus = 'none' | 'requested' | 'granted';

type QueueRow = {
  id: string;
  user_id: string;
  status: string;
  created_at: string;
  users?: { username?: string | null; avatar_url?: string | null };
};

type RoomState = {
  roomId: string | null;
  currentUserId: string | null;
  isHost: boolean;
  micStatus: MicStatus;
  queue: QueueRow[];
  setMicStatus: (s: MicStatus) => void;
  setQueue: (q: QueueRow[]) => void;
  setRoom: (roomId: string, currentUserId: string, isHost: boolean) => void;
  joinAs: (role: 'listener'|'speaker', userName: string) => Promise<void>;
  raiseHand: () => Promise<void>;
  cancelHand: () => Promise<void>;
  grant: (userId: string) => Promise<void>;
  revoke: (userId: string) => Promise<void>;
  subscribeQueue: () => () => void;
};

export const useRoomStore = create<RoomState>((set, get) => ({
  roomId: null,
  currentUserId: null,
  isHost: false,
  micStatus: 'none',
  queue: [],
  setMicStatus: (s) => {
    set({ micStatus: s });
    if (s === 'granted') switchToSpeaker();
    if (s === 'none') switchToListener();
  },
  setQueue: (q) => set({ queue: q }),
  setRoom: (roomId, currentUserId, isHost) => set({ roomId, currentUserId, isHost }),
  joinAs: async (role, userName) => {
    const { roomId, currentUserId } = get();
    if (!roomId) throw new Error('Missing roomId');
    await joinHms({ roomId, userName, role, userId: currentUserId || undefined });
  },
  raiseHand: async () => {
    const { roomId } = get();
    if (!roomId) throw new Error('Missing roomId');
    await raiseHand(roomId);
    set({ micStatus: 'requested' });
  },
  cancelHand: async () => {
    const { roomId } = get();
    if (!roomId) throw new Error('Missing roomId');
    await cancelHand(roomId);
    set({ micStatus: 'none' });
  },
  grant: async (userId: string) => {
    const { roomId } = get();
    if (!roomId) throw new Error('Missing roomId');
    await grantMic(roomId, userId);
  },
  revoke: async (userId: string) => {
    const { roomId } = get();
    if (!roomId) throw new Error('Missing roomId');
    await revokeMic(roomId, userId);
  },
  subscribeQueue: () => {
    const { roomId } = get();
    if (!roomId) return () => {};
    return watchMicRequests(roomId, (rows) => set({ queue: rows }));
  },
}));


