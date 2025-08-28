import { useEffect, useMemo, useState } from 'react';
import { listenRoom } from '@/src/db/mic';
import type { RoomParticipant } from '@/src/db/types';
import { useVipMap } from '@/src/db/vip';

type PendingRow = { user_id: string; room_id: string; status: 'pending' };

export function useMicQueue(room_id: string) {
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [pending, setPending] = useState<PendingRow[]>([]);

  useEffect(() => {
    if (!room_id) return;
    const unsub = listenRoom(room_id, {
      onParticipants: setParticipants,
      onRequests: (rows) => setPending(rows as PendingRow[]),
    });
    return () => unsub?.();
  }, [room_id]);

  const userIds = useMemo(() => {
    const s = new Set<string>();
    participants.forEach((p) => s.add(p.user_id));
    pending.forEach((r) => s.add(r.user_id));
    return Array.from(s);
  }, [participants, pending]);

  const vipMap = useVipMap(userIds);

  const pendingSorted = useMemo(() => {
    const withPriority = pending.map((r, idx) => ({
      ...r,
      _priority: vipMap[r.user_id]?.priority ?? -1,
      _idx: idx,
      _vipName: vipMap[r.user_id]?.name || null,
    }));
    withPriority.sort((a, b) => {
      if ((b._priority ?? -1) !== (a._priority ?? -1)) return (b._priority ?? -1) - (a._priority ?? -1);
      return a._idx - b._idx;
    });
    return withPriority;
  }, [pending, vipMap]);

  const speakers = useMemo(
    () => participants.filter((p) => p.mic_status === 'granted').map((p) => ({ user_id: p.user_id })),
    [participants]
  );

  return { participants, pendingSorted, speakers, vipMap };
}





