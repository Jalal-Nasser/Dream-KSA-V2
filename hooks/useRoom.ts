import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { api } from '@/lib/api'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RoomMember {
  user_id: string
  role: 'host' | 'speaker' | 'listener'
  joined_at: string
}

export interface Profile {
  id: string
  display_name: string | null
  avatar_url: string | null
}

export interface Participant {
  user_id: string
  role: 'host' | 'speaker' | 'listener'
  joined_at: string
  profile: Profile | null
  speakingEnabled: boolean
}

export interface Room {
  id: string
  title?: string
  name?: string
  description?: string
  owner_id: string
  host_id: string
  agency_id?: string
  hms_room_id?: string
  is_live: boolean
  max_speakers: number
  current_speakers: number
  country: string
  theme: string
  banner_image?: string
  background_image?: string
  created_at: string
  updated_at: string
}

export function useRoom(roomId: string) {
  const [room, setRoom] = useState<Room | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!roomId) return

    getRoom()
    getParticipants()
    subscribeToRoomUpdates()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [roomId])

  async function getRoom() {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('rooms')
        .select('id, title, host_id, owner_id')
        .eq('id', roomId)
        .single()

      if (error) throw error

      setRoom(data)
    } catch (err) {
      console.error('Error fetching room:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch room')
    } finally {
      setLoading(false)
    }
  }

  async function getParticipants() {
    try {
      console.log('[participants] (backend) fetching', roomId)
      const rows = await api.getParticipants(roomId)
      // normalize to UI model
      const participants = (rows as any[]).map(r => {
        const p = r?.profile || {}
        const display = r?.profile?.display ?? r?.profile?.username ?? "ضيف"

        return {
          user_id: r.user_id,
          role: r.role as 'host' | 'speaker' | 'listener',
          joined_at: r.joined_at || null,
          profile: {
            id: p.id,
            name: display,
            avatar_url: p.avatar_url || null,
          },
          speakingEnabled: r.role === 'host' || r.role === 'speaker',
        }
      })
      console.log('[participants] (backend) fetched', participants.length)
      setParticipants(participants)
    } catch (err) {
      console.error('Error fetching participants:', err)
    }
  }

  function subscribeToRoomUpdates() {
    const newChannel = supabase
      .channel(`room:${roomId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'room_participants',
          filter: `room_id=eq.${roomId}`
        },
        (payload) => {
          console.log('Room participant change:', payload)
          // Refresh participants when room_participants changes
          getParticipants()
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'rooms',
          filter: `id=eq.${roomId}`
        },
        (payload) => {
          console.log('Room change:', payload)
          
          if (payload.eventType === 'UPDATE') {
            setRoom(prev => prev ? { ...prev, ...payload.new } : null)
          }
        }
      )
      .subscribe()

    setChannel(newChannel)
  }

  async function joinRoom(userId: string, role: 'host' | 'speaker' | 'listener' = 'listener') {
    try {
      console.log('[join] (backend) membership', { roomId, userId, role })
      await api.joinRoom(roomId, userId, role)
      return { data: { success: true }, error: null }
    } catch (err) {
      console.error('Error joining room:', err)
      return { data: null, error: err }
    }
  }

  async function leaveRoom(userId: string) {
    try {
      console.log('[leave] (backend) leaving', { roomId, userId });
      await api.leaveRoom(roomId, userId);
      return { error: null };
    } catch (err) {
      console.log('[leave] backend error (ignored)', String((err as any)?.message || err));
      return { error: err };
    }
  }

  async function setMicRole(roomId: string, userId: string, enable: boolean) {
    console.log('[mic] (backend) set role', { roomId, userId, enable })
    try {
      await api.setMicRole(roomId, userId, enable)
      return { error: null }
    } catch (err) {
      console.error('Error setting mic role:', err)
      return { error: err }
    }
  }

  async function raiseHand(userId: string) {
    try {
      console.log('[hand] (backend) raising', { roomId, userId });
      await api.raiseHand(roomId, userId);
      return { error: null };
    } catch (err) {
      console.log('[hand] raise error', String((err as any)?.message || err));
      return { error: err };
    }
  }

  async function lowerHand(userId: string) {
    try {
      console.log('[hand] (backend) lowering', { roomId, userId });
      await api.lowerHand(roomId, userId);
      return { error: null };
    } catch (err) {
      console.log('[hand] lower error', String((err as any)?.message || err));
      return { error: err };
    }
  }

  const speakers = participants.filter(p => p.role === 'speaker' || p.role === 'host')
  const listeners = participants.filter(p => p.role === 'listener')

  return {
    room,
    participants,
    speakers,
    listeners,
    loading,
    error,
    joinRoom,
    leaveRoom,
    setMicRole,
    raiseHand,
    lowerHand,
    refreshRoom: getRoom,
    refreshParticipants: getParticipants
  }
}




