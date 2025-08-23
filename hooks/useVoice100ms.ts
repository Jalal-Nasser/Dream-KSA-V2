import { useEffect, useState, useRef, useCallback } from 'react'
import { Platform } from 'react-native'

interface HMSConfig {
  authToken: string
  username: string
  roomId?: string
}

interface HMSInstance {
  join: (config: HMSConfig) => Promise<void>
  leave: () => Promise<void>
  addEventListener: (event: string, callback: (data: any) => void) => void
  removeEventListener: (event: string, callback: (data: any) => void) => void
  setLocalAudioEnabled: (enabled: boolean) => Promise<void>
  getLocalPeer: () => any
  getRemotePeers: () => any[]
}

export function useVoice100ms(roomId: string, role: 'room_admin' | 'speaker' | 'listener') {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [localAudioEnabled, setLocalAudioEnabled] = useState(false)
  const [peers, setPeers] = useState<any[]>([])
  const [localPeer, setLocalPeer] = useState<any>(null)
  
  const hmsInstance = useRef<HMSInstance | null>(null)
  const eventListeners = useRef<Map<string, (data: any) => void>>(new Map())

  // Dynamically import HMS SDK only on native platforms
  const importHMS = useCallback(async () => {
    if (Platform.OS === 'web') {
      throw new Error('HMS SDK is not supported on web platform')
    }

    try {
      const { HMSSDK } = await import('@100mslive/react-native-hms')
      return await HMSSDK.build()
    } catch (err) {
      console.error('Failed to import HMS SDK:', err)
      throw new Error('HMS SDK not available')
    }
  }, [])

  const setupEventListeners = useCallback((instance: HMSInstance) => {
    const events = [
      'ON_JOIN',
      'ON_PEER_UPDATE',
      'ON_TRACK_UPDATE',
      'ON_ROOM_UPDATE',
      'ON_ERROR',
      'ON_LEAVE'
    ]

    events.forEach(event => {
      const listener = (data: any) => {
        console.log(`HMS Event ${event}:`, data)
        
        switch (event) {
          case 'ON_JOIN':
            setIsConnected(true)
            setIsConnecting(false)
            setError(null)
            break
            
          case 'ON_PEER_UPDATE':
            // Update peers list
            const remotePeers = instance.getRemotePeers()
            setPeers(remotePeers)
            break
            
          case 'ON_TRACK_UPDATE':
            // Handle track updates
            break
            
          case 'ON_ROOM_UPDATE':
            // Handle room updates
            break
            
          case 'ON_ERROR':
            setError(data.description || data.message || 'HMS Error')
            setIsConnecting(false)
            break
            
          case 'ON_LEAVE':
            setIsConnected(false)
            setPeers([])
            setLocalPeer(null)
            break
        }
      }
      
      eventListeners.current.set(event, listener)
      instance.addEventListener(event, listener)
    })
  }, [])

  const cleanupEventListeners = useCallback((instance: HMSInstance) => {
    eventListeners.current.forEach((listener, event) => {
      instance.removeEventListener(event, listener)
    })
    eventListeners.current.clear()
  }, [])

  const joinRoom = useCallback(async (authToken: string, username: string) => {
    try {
      setIsConnecting(true)
      setError(null)

      // Import and build HMS instance
      const instance = await importHMS()
      hmsInstance.current = instance

      // Setup event listeners
      setupEventListeners(instance)

      // Get local peer info
      const localPeer = instance.getLocalPeer()
      setLocalPeer(localPeer)

      // Join the room
      await instance.join({
        authToken,
        username,
        roomId
      })

      // Enable audio based on role
      if (role === 'speaker' || role === 'room_admin') {
        await instance.setLocalAudioEnabled(true)
        setLocalAudioEnabled(true)
      }

    } catch (err) {
      console.error('Failed to join room:', err)
      setError(err instanceof Error ? err.message : 'Failed to join room')
      setIsConnecting(false)
    }
  }, [role, importHMS, setupEventListeners])

  const leaveRoom = useCallback(async () => {
    try {
      if (hmsInstance.current) {
        await hmsInstance.current.leave()
        
        // Cleanup event listeners
        cleanupEventListeners(hmsInstance.current)
        hmsInstance.current = null
        
        setIsConnected(false)
        setPeers([])
        setLocalPeer(null)
        setLocalAudioEnabled(false)
      }
    } catch (err) {
      console.error('Failed to leave room:', err)
      setError(err instanceof Error ? err.message : 'Failed to leave room')
    }
  }, [cleanupEventListeners])

  const toggleAudio = useCallback(async () => {
    try {
      if (!hmsInstance.current || !isConnected) return

      const newState = !localAudioEnabled
      await hmsInstance.current.setLocalAudioEnabled(newState)
      setLocalAudioEnabled(newState)
    } catch (err) {
      console.error('Failed to toggle audio:', err)
      setError(err instanceof Error ? err.message : 'Failed to toggle audio')
    }
  }, [hmsInstance, isConnected, localAudioEnabled])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (hmsInstance.current) {
        cleanupEventListeners(hmsInstance.current)
      }
    }
  }, [cleanupEventListeners])

  return {
    // State
    isConnected,
    isConnecting,
    error,
    localAudioEnabled,
    peers,
    localPeer,
    
    // Actions
    joinRoom,
    leaveRoom,
    toggleAudio,
    
    // Computed
    canSpeak: role === 'speaker' || role === 'room_admin',
    canManage: role === 'room_admin',
    totalParticipants: peers.length + (localPeer ? 1 : 0)
  }
}


