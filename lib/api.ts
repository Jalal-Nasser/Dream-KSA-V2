import Constants from "expo-constants";

const BACKEND_URL = process.env.EXPO_PUBLIC_BACKEND_URL || Constants.expoConfig?.extra?.backendUrl;

async function request(path: string, options: RequestInit = {}) {
  const url = `${BACKEND_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) {
    const message = json?.message || `HTTP ${res.status}`;
    const details = json?.details || null;
    const err: any = new Error(message);
    err.details = details;
    throw err;
  }
  return json?.data ?? json;
}

export const api = {
  joinRoom: (room_id: string, user_id: string, role: "listener" | "speaker" | "host") =>
    request("/rooms/join", { method: "POST", body: JSON.stringify({ room_id, user_id, role }) }),
  setMicRole: (room_id: string, user_id: string, enable: boolean) =>
    request("/rooms/role", { method: "POST", body: JSON.stringify({ room_id, user_id, enable }) }),
  getParticipants: (room_id: string) =>
    request(`/rooms/${room_id}/participants`),
};
