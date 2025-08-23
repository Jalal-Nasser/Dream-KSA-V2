// Calls the Supabase Edge Function 'hms-token' and returns a 100ms room token
import { ENV } from '@/env';

type TokenResp = { token: string };

export async function getHmsToken(params: {
  room_id: string;
  role: string;
  user_id: string;
  display_name?: string;
}) {
  const res = await fetch(ENV.HMS_TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`HMS token fetch failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as TokenResp;
  if (!data?.token) throw new Error('HMS token missing in response');
  return data.token;
}
