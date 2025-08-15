import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import AsyncStorage from '@react-native-async-storage/async-storage'

export type Theme = 'system' | 'light' | 'dark'
export type ViewMode = 'grid' | 'list'

interface UIState {
  // Theme
  theme: Theme
  setTheme: (theme: Theme) => void
  
  // View modes
  roomsViewMode: ViewMode
  setRoomsViewMode: (mode: ViewMode) => void
  
  // UI state
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  
  // Notifications
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // Modals
  activeModal: string | null
  openModal: (modalId: string) => void
  closeModal: () => void
  
  // Loading states
  loadingStates: Record<string, boolean>
  setLoading: (key: string, loading: boolean) => void
  
  // Error states
  errors: Record<string, string | null>
  setError: (key: string, error: string | null) => void
  
  // Reset
  reset: () => void
}

interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message: string
  timestamp: number
  read: boolean
}

const initialState = {
  theme: 'system' as Theme,
  roomsViewMode: 'grid' as ViewMode,
  sidebarOpen: false,
  notifications: [],
  activeModal: null,
  loadingStates: {},
  errors: {}
}

export const useUIStore = create<UIState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      setTheme: (theme: Theme) => set({ theme }),
      
      setRoomsViewMode: (mode: ViewMode) => set({ roomsViewMode: mode }),
      
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
      
      addNotification: (notification: Notification) => set((state) => ({
        notifications: [notification, ...state.notifications].slice(0, 50) // Keep max 50 notifications
      })),
      
      removeNotification: (id: string) => set((state) => ({
        notifications: state.notifications.filter(n => n.id !== id)
      })),
      
      clearNotifications: () => set({ notifications: [] }),
      
      openModal: (modalId: string) => set({ activeModal: modalId }),
      
      closeModal: () => set({ activeModal: null }),
      
      setLoading: (key: string, loading: boolean) => set((state) => ({
        loadingStates: { ...state.loadingStates, [key]: loading }
      })),
      
      setError: (key: string, error: string | null) => set((state) => ({
        errors: { ...state.errors, [key]: error }
      })),
      
      reset: () => set(initialState)
    }),
    {
      name: 'ui-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        theme: state.theme,
        roomsViewMode: state.roomsViewMode
      })
    }
  )
)

// Selector hooks for better performance
export const useTheme = () => useUIStore((state) => state.theme)
export const useSetTheme = () => useUIStore((state) => state.setTheme)

export const useRoomsViewMode = () => useUIStore((state) => state.roomsViewMode)
export const useSetRoomsViewMode = () => useUIStore((state) => state.setRoomsViewMode)

export const useSidebarOpen = () => useUIStore((state) => state.sidebarOpen)
export const useSetSidebarOpen = () => useUIStore((state) => state.setSidebarOpen)

export const useNotifications = () => useUIStore((state) => state.notifications)
export const useAddNotification = () => useUIStore((state) => state.addNotification)
export const useRemoveNotification = () => useUIStore((state) => state.removeNotification)
export const useClearNotifications = () => useUIStore((state) => state.clearNotifications)

export const useActiveModal = () => useUIStore((state) => state.activeModal)
export const useOpenModal = () => useUIStore((state) => state.openModal)
export const useCloseModal = () => useUIStore((state) => state.closeModal)

export const useLoading = (key: string) => useUIStore((state) => state.loadingStates[key] || false)
export const useSetLoading = () => useUIStore((state) => state.setLoading)

export const useError = (key: string) => useUIStore((state) => state.errors[key])
export const useSetError = () => useUIStore((state) => state.setError)

export const useReset = () => useUIStore((state) => state.reset)




