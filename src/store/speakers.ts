import { create } from 'zustand';

type S = {
  speaking: Set<string>;
  setSpeaking: (ids: string[]) => void;
  isSpeaking: (id: string) => boolean;
};

export const useSpeaking = create<S>((set, get) => ({
  speaking: new Set(),
  setSpeaking: (ids) => set({ speaking: new Set(ids) }),
  isSpeaking: (id) => get().speaking.has(id),
}));



