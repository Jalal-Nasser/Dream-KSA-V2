import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { RealtimeChannel } from '@supabase/supabase-js'

export interface RoomParticipant {
  id: string
  room_id: string
  user_id: string
  role: 'room_admin' | 'speaker' | 'listener'
  hand_raised: boolean
  mic_granted: boolean
  joined_at: string
  left_at?: string
  profiles: {
    display_name: string
    avatar_url?: string
    role: string
  }
}

export interface Room {
  id: string
  name: string
  description?: string
  owner_id: string
  agency_id?: string
  hms_room_id?: string
  is_live: boolean
  is_active: boolean
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
  const [participants, setParticipants] = useState<RoomParticipant[]>([])
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
        .select('*')
        .eq('id', roomId)
        .eq('is_active', true)
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
      const { data, error } = await supabase
        .from('room_participants')
        .select(`
          *,
          profiles (
            display_name,
            avatar_url,
            role
          )
        `)
        .eq('room_id', roomId)
        .is('left_at', null)
        .order('joined_at', { ascending: true })

      if (error) throw error

      setParticipants(data || [])
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
          
          if (payload.eventType === 'INSERT') {
            // New participant joined
            setParticipants(prev => [...prev, payload.new as RoomParticipant])
          } else if (payload.eventType === 'UPDATE') {
            // Participant updated (role change, mic granted, etc.)
            setParticipants(prev => 
              prev.map(p => 
                p.id === payload.new.id ? payload.new as RoomParticipant : p
              )
            )
          } else if (payload.eventType === 'DELETE') {
            // Participant left
            setParticipants(prev => 
              prev.filter(p => p.id !== payload.old.id)
            )
          }
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

  async function joinRoom(userId: string, role: 'room_admin' | 'speaker' | 'listener' = 'listener') {
    try {
      const { data, error } = await supabase
        .from('room_participants')
        .upsert({
          room_id: roomId,
          user_id: userId,
          role,
          hand_raised: false,
          mic_granted: role === 'room_admin' || role === 'speaker',
          joined_at: new Date().toISOString()
        }, {
          onConflict: 'room_id,user_id'
        })
        .select()
        .single()

      if (error) throw error

      return { data, error: null }
    } catch (err) {
      console.error('Error joining room:', err)
      return { data: null, error: err }
    }
  }

  async function leaveRoom(userId: string) {
    try {
      const { error } = await supabase
        .from('room_participants')
        .update({
          left_at: new Date().toISOString()
        })
        .eq('room_id', roomId)
        .eq('user_id', userId)

      if (error) throw error

      return { error: null }
    } catch (err) {
      console.error('Error leaving room:', err)
      return { error: err }
    }
  }

  async function raiseHand(userId: string) {
    try {
      const { error } = await supabase
        .from('room_participants')
        .update({
          hand_raised: true
        })
        .eq('room_id', roomId)
        .eq('user_id', userId)

      if (error) throw error

      return { error: null }
    } catch (err) {
      console.error('Error raising hand:', err)
      return { error: err }
    }
  }

  async function lowerHand(userId: string) {
    try {
      const { error } = await supabase
        .from('room_participants')
        .update({
          hand_raised: false
        })
        .eq('room_id', roomId)
        .eq('user_id', userId)

      if (error) throw error

      return { error: null }
    } catch (err) {
      console.error('Error lowering hand:', err)
      return { error: err }
    }
  }

  const speakers = participants.filter(p => p.role === 'speaker' || p.role === 'room_admin')
  const listeners = participants.filter(p => p.role === 'listener')
  const handRaised = participants.filter(p => p.hand_raised)

  return {
    room,
    participants,
    speakers,
    listeners,
    handRaised,
    loading,
    error,
    joinRoom,
    leaveRoom,
    raiseHand,
    lowerHand,
    refreshRoom: getRoom,
    refreshParticipants: getParticipants
  }
}




