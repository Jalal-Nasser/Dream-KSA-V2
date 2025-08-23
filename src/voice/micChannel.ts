import { supabase } from '@/lib/supabase';

export type MicStatus = 'none' | 'requested' | 'granted';

export function listenToMicStatus(
	roomId: string,
	userId: string,
	onChange: (s: MicStatus) => void
) {
	const channel = supabase
		.channel(`mic:${roomId}:${userId}`)
		.on(
			'postgres_changes',
			{ event: 'UPDATE', schema: 'public', table: 'room_participants', filter: `room_id=eq.${roomId}` },
			(payload: any) => {
				if (payload.new?.user_id === userId && payload.new?.mic_status) {
					onChange(payload.new.mic_status as MicStatus);
				}
			}
		)
		.subscribe();
	return () => { supabase.removeChannel(channel); };
}




