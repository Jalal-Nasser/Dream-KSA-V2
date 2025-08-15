// Example usage of the invokeEdge function
// This file demonstrates how to replace direct supabase.functions.invoke calls

import { invokeEdge } from './edge';

// Example: Get HMS token
export async function getHMSToken(userId: string, userName: string, role: string, roomId: string) {
  try {
    const result = await invokeEdge('hms-token', {
      user_id: userId,
      user_name: userName,
      role: role,
      room_id: roomId
    });
    return result;
  } catch (error) {
    console.error('Failed to get HMS token:', error);
    throw error;
  }
}

// Example: Approve microphone access
export async function approveMicrophone(roomId: string, targetUserId: string) {
  try {
    const result = await invokeEdge('approve-mic', {
      room_id: roomId,
      target_user_id: targetUserId
    });
    return result;
  } catch (error) {
    console.error('Failed to approve microphone:', error);
    throw error;
  }
}

// Example: Revoke microphone access
export async function revokeMicrophone(roomId: string, targetUserId: string) {
  try {
    const result = await invokeEdge('revoke-mic', {
      room_id: roomId,
      target_user_id: targetUserId
    });
    return result;
  } catch (error) {
    console.error('Failed to revoke microphone:', error);
    throw error;
  }
}

// Example: Send a gift
export async function sendGift(roomId: string, receiverHostId: string, giftId: string) {
  try {
    const result = await invokeEdge('send-gift', {
      room_id: roomId,
      receiver_host_id: receiverHostId,
      gift_id: giftId
    });
    return result;
  } catch (error) {
    console.error('Failed to send gift:', error);
    throw error;
  }
}

// Example: Close month (owner/admin only)
export async function closeMonth(month: string) {
  try {
    const result = await invokeEdge('close-month', {
      month: month
    });
    return result;
  } catch (error) {
    console.error('Failed to close month:', error);
    throw error;
  }
}

// Example: Finalize month (owner/admin only)
export async function finalizeMonth(month: string) {
  try {
    const result = await invokeEdge('finalize-month', {
      month: month
    });
    return result;
  } catch (error) {
    console.error('Failed to finalize month:', error);
    throw error;
  }
}

// Example: Create agency
export async function createAgency(agencyData: any) {
  try {
    const result = await invokeEdge('create-agency', agencyData);
    return result;
  } catch (error) {
    console.error('Failed to create agency:', error);
    throw error;
  }
}

// Example: Invite host
export async function inviteHost(inviteData: any) {
  try {
    const result = await invokeEdge('invite-host', inviteData);
    return result;
  } catch (error) {
    console.error('Failed to invite host:', error);
    throw error;
  }
}

// Example: Accept invite
export async function acceptInvite(inviteData: any) {
  try {
    const result = await invokeEdge('accept-invite', inviteData);
    return result;
  } catch (error) {
    console.error('Failed to accept invite:', error);
    throw error;
  }
}
