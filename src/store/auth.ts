import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';

type AuthState = {
  session: Session | null;
  hasSession: boolean;
  authBusy: boolean;
  setSession: (s: Session | null) => void;
  setAuthBusy: (b: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  session: null,
  hasSession: false,
  authBusy: false,
  setSession: (s) => set({ session: s, hasSession: !!s }),
  setAuthBusy: (b) => set({ authBusy: b }),
}));



