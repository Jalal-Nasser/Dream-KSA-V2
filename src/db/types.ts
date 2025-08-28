export type MicStatus = 'none' | 'requested' | 'granted';
export type MicRequestStatus = 'pending' | 'approved' | 'denied' | 'cancelled';

export interface RoomParticipant {
  room_id: string;
  user_id: string;
  mic_status: MicStatus;
  updated_at?: string | null;
}

export interface MicRequest {
  id?: string;
  room_id: string;
  user_id: string;
  status: MicRequestStatus;
  created_at?: string;
}

export interface Room {
  id: string;
  name: string;
  owner_id: string;
}





