import { useEffect, useState } from 'react';

// shared map of userId -> level (0..1)
let _levels: Record<string, number> = {};
const _subs = new Set<React.Dispatch<React.SetStateAction<Record<string, number>>>>();

export function setLevels(map: Record<string, number>) {
  _levels = map;
  _subs.forEach((set) => set({ ..._levels }));
}

export function updateLevel(userId: string, level: number) {
  if (_levels[userId] === level) return;
  _levels = { ..._levels, [userId]: level };
  _subs.forEach((set) => set({ ..._levels }));
}

export function useHmsLevels() {
  const [map, setMap] = useState<Record<string, number>>(_levels);
  useEffect(() => { 
    _subs.add(setMap); 
    return () => { 
      _subs.delete(setMap); 
    }; 
  }, []);
  return map;
}


