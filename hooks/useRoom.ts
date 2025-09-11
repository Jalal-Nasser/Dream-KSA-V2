import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
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
      console.log('[participants] fetching for room', roomId)

      // 1) Get room participants
      const { data: members, error: memErr } = await supabase
        .from('room_participants')
        .select('user_id, role, joined_at')
        .eq('room_id', roomId)

      if (memErr) {
        console.log('[participants] room_participants error:', memErr)
        throw memErr
      }

      // 2) Fetch profiles for those user_ids
      const userIds = (members ?? []).map(m => m.user_id)
      let profiles: Array<{ id: string; username: string | null; avatar_url: string | null }> = []
      if (userIds.length) {
        const { data: profs, error: profErr } = await supabase
          .from('profiles')
          .select('id, username, avatar_url')
          .in('id', userIds)

        if (profErr) {
          console.log('[participants] profiles error:', profErr)
          // non-fatal; proceed with empty profiles
        } else {
          profiles = profs ?? []
        }
      }

      // 3) Join in JS
      const participants = (members ?? []).map(m => ({
        user_id: m.user_id,
        role: m.role as 'host' | 'speaker' | 'listener',
        joined_at: m.joined_at ?? null,
        profile: profiles.find(p => p.id === m.user_id) ?? null,
        speakingEnabled: m.role === 'host' || m.role === 'speaker',
      }))

      console.log('[participants] fetched', participants.length)
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
      console.log('[join] upserting membership', { roomId, userId, role })
      
      // Try INSERT first
      const { error: insErr } = await supabase.from('room_participants').insert({
        room_id: roomId,
        user_id: userId,
        role,
        joined_at: new Date().toISOString(),
      })
      if (!insErr) return { data: { success: true }, error: null }

      console.log('[join] insert failed, trying update:', insErr)
      // Fallback: update existing row for this (room_id, user_id)
      const { error: updErr } = await supabase
        .from('room_participants')
        .update({ role })
        .eq('room_id', roomId)
        .eq('user_id', userId)

      if (updErr) {
        console.log('[join] update failed:', updErr)
        throw updErr
      }
      return { data: { success: true }, error: null }
    } catch (err) {
      console.error('Error joining room:', err)
      return { data: null, error: err }
    }
  }

  async function leaveRoom(userId: string) {
    try {
      const { error } = await supabase
        .from('room_participants')
        .delete()
        .eq('room_id', roomId)
        .eq('user_id', userId)

      if (error) throw error

      return { error: null }
    } catch (err) {
      console.error('Error leaving room:', err)
      return { error: err }
    }
  }

  async function setMicRole(roomId: string, userId: string, enable: boolean) {
    const role = enable ? 'speaker' : 'listener'
    console.log('[mic] set role', { roomId, userId, role })
    try {
      const { error } = await supabase
        .from('room_participants')
        .update({ role })
        .eq('room_id', roomId)
        .eq('user_id', userId)

      if (error) {
        console.log('[mic] update error:', error)
        throw error
      }

      return { error: null }
    } catch (err) {
      console.error('Error setting mic role:', err)
      return { error: err }
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
    refreshRoom: getRoom,
    refreshParticipants: getParticipants
  }
}




