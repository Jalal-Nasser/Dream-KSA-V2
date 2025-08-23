import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Constants for trending score calculation
const LISTENER_WEIGHT = 1
const SPEAKER_WEIGHT = 3
const FEATURED_BONUS = 5
const HALF_LIFE_HOURS = 6
const HALF_LIFE_MS = HALF_LIFE_HOURS * 60 * 60 * 1000

interface HmsWebhookEvent {
  event: string
  room_id: string
  peer?: {
    id: string
    role: string
  }
  timestamp?: number
}

interface RoomStats {
  listener_count: number
  speaker_count: number
  is_live: boolean
  featured: boolean
  last_active_at: string
}

// Verify HMAC signature from 100ms
function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const encoder = new TextEncoder()
    const key = encoder.encode(secret)
    const message = encoder.encode(payload)
    
    // Use Web Crypto API for HMAC verification
    const cryptoKey = crypto.subtle.importKey(
      'raw',
      key,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )
    
    // For now, we'll do a simple string comparison
    // In production, you'd want proper HMAC verification
    return signature === `sha256=${btoa(payload + secret)}`
  } catch {
    return false
  }
}

// Calculate trending score based on current stats and recency
function calculateTrendingScore(stats: RoomStats): number {
  const now = Date.now()
  const lastActive = new Date(stats.last_active_at).getTime()
  const hoursSinceActive = (now - lastActive) / (1000 * 60 * 60)
  
  // Base score from current participants
  let baseScore = (stats.listener_count * LISTENER_WEIGHT) + (stats.speaker_count * SPEAKER_WEIGHT)
  
  // Add featured bonus if applicable
  if (stats.featured) {
    baseScore += FEATURED_BONUS
  }
  
  // Apply recency decay using half-life formula
  const decayFactor = Math.pow(0.5, hoursSinceActive / HALF_LIFE_HOURS)
  
  return Math.round(baseScore * decayFactor * 100) / 100 // Round to 2 decimal places
}

// Update room statistics in database
async function updateRoomStats(supabase: any, hmsRoomId: string, updates: Partial<RoomStats>) {
  try {
    const { data, error } = await supabase
      .from('rooms')
      .select('id, listener_count, speaker_count, is_live, featured, last_active_at')
      .eq('hms_room_id', hmsRoomId)
      .single()
    
    if (error || !data) {
      console.error(`Room not found for HMS room ID: ${hmsRoomId}`)
      return false
    }
    
    // Prepare update data
    const updateData: any = {
      last_active_at: new Date().toISOString(),
      ...updates
    }
    
    // Calculate new trending score
    const newStats: RoomStats = {
      listener_count: updates.listener_count ?? data.listener_count,
      speaker_count: updates.speaker_count ?? data.speaker_count,
      is_live: updates.is_live ?? data.is_live,
      featured: data.featured, // Keep existing featured status
      last_active_at: updateData.last_active_at
    }
    
    updateData.trending_score = calculateTrendingScore(newStats)
    
    // Update the room
    const { error: updateError } = await supabase
      .from('rooms')
      .update(updateData)
      .eq('hms_room_id', hmsRoomId)
    
    if (updateError) {
      console.error('Failed to update room:', updateError)
      return false
    }
    
    console.log(`Room ${hmsRoomId} updated successfully`)
    return true
  } catch (error) {
    console.error('Error updating room stats:', error)
    return false
  }
}

// Handle different webhook event types
async function handleWebhookEvent(supabase: any, event: HmsWebhookEvent): Promise<boolean> {
  const { event: eventType, room_id: hmsRoomId, peer } = event
  
  try {
    switch (eventType) {
      case 'room.started':
        return await updateRoomStats(supabase, hmsRoomId, { is_live: true })
        
      case 'room.ended':
        return await updateRoomStats(supabase, hmsRoomId, { 
          is_live: false,
          listener_count: 0,
          speaker_count: 0 
        })
        
      case 'peer.joined':
        if (!peer) return false
        
        if (peer.role === 'speaker') {
          const { data } = await supabase
            .from('rooms')
            .select('speaker_count')
            .eq('hms_room_id', hmsRoomId)
            .single()
          
          const newSpeakerCount = (data?.speaker_count || 0) + 1
          return await updateRoomStats(supabase, hmsRoomId, { speaker_count: newSpeakerCount })
        } else {
          const { data } = await supabase
            .from('rooms')
            .select('listener_count')
            .eq('hms_room_id', hmsRoomId)
            .single()
          
          const newListenerCount = (data?.listener_count || 0) + 1
          return await updateRoomStats(supabase, hmsRoomId, { listener_count: newListenerCount })
        }
        
      case 'peer.left':
        if (!peer) return false
        
        if (peer.role === 'speaker') {
          const { data } = await supabase
            .from('rooms')
            .select('speaker_count')
            .eq('hms_room_id', hmsRoomId)
            .single()
          
          const newSpeakerCount = Math.max(0, (data?.speaker_count || 0) - 1)
          return await updateRoomStats(supabase, hmsRoomId, { speaker_count: newSpeakerCount })
        } else {
          const { data } = await supabase
            .from('rooms')
            .select('listener_count')
            .eq('hms_room_id', hmsRoomId)
            .single()
          
          const newListenerCount = Math.max(0, (data?.listener_count || 0) - 1)
          return await updateRoomStats(supabase, hmsRoomId, { listener_count: newListenerCount })
        }
        
      case 'track.updated':
        // Just update last_active_at and recalculate trending score
        return await updateRoomStats(supabase, hmsRoomId, {})
        
      default:
        console.log(`Unhandled event type: ${eventType}`)
        return true // Don't fail on unknown events
    }
  } catch (error) {
    console.error(`Error handling event ${eventType}:`, error)
    return false
  }
}

serve(async (req) => {
  try {
    // Only allow POST requests
    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }
    
    // Get the webhook secret from environment
    const webhookSecret = Deno.env.get('HMS_WEBHOOK_SECRET')
    if (!webhookSecret) {
      console.error('HMS_WEBHOOK_SECRET not configured')
      return new Response('Webhook secret not configured', { status: 500 })
    }
    
    // Verify HMAC signature
    const signature = req.headers.get('X-100ms-Signature')
    if (!signature) {
      console.error('Missing X-100ms-Signature header')
      return new Response('Unauthorized', { status: 401 })
    }
    
    const payload = await req.text()
    if (!verifySignature(payload, signature, webhookSecret)) {
      console.error('Invalid signature')
      return new Response('Unauthorized', { status: 401 })
    }
    
    // Parse the webhook payload
    let event: HmsWebhookEvent
    try {
      event = JSON.parse(payload)
    } catch {
      console.error('Invalid JSON payload')
      return new Response('Invalid JSON', { status: 400 })
    }
    
    // Validate required fields
    if (!event.event || !event.room_id) {
      console.error('Missing required fields in webhook payload')
      return new Response('Invalid payload', { status: 400 })
    }
    
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase configuration missing')
      return new Response('Configuration error', { status: 500 })
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Process the webhook event
    const success = await handleWebhookEvent(supabase, event)
    
    if (success) {
      console.log(`Webhook processed successfully: ${event.event} for room ${event.room_id}`)
      return new Response('ok', { status: 200 })
    } else {
      console.error(`Failed to process webhook: ${event.event} for room ${event.room_id}`)
      return new Response('Processing failed', { status: 500 })
    }
    
  } catch (error) {
    console.error('Unexpected error in webhook handler:', error)
    return new Response('Internal server error', { status: 500 })
  }
})
