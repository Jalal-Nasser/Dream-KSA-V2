import { supabase } from '@/lib/supabase';

export async function raiseHand(roomId: string) {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw new Error('Not signed in');
	return supabase
		.from('room_participants')
		.upsert(
			{ room_id: roomId, user_id: user.id, mic_status: 'requested' },
			{ onConflict: 'room_id,user_id' }
		);
}

export async function grantMic(roomId: string, userId: string) {
	return supabase
		.from('room_participants')
		.update({ mic_status: 'granted' })
		.eq('room_id', roomId)
		.eq('user_id', userId);
}

export async function revokeMic(roomId: string, userId: string) {
	return supabase
		.from('room_participants')
		.update({ mic_status: 'none' })
		.eq('room_id', roomId)
		.eq('user_id', userId);
}




