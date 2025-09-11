import Constants from "expo-constants";

const rawUrl =
  process.env.EXPO_PUBLIC_BACKEND_URL ||
  (Constants?.expoConfig as any)?.extra?.backendUrl ||
  "";

let BASE = rawUrl?.trim?.() || "";
if (BASE.endsWith("/")) BASE = BASE.slice(0, -1);

let warned = false;
export function getBackendBase(): string {
  if (!BASE || !/^https?:\/\//i.test(BASE)) {
    const msg =
      "[api] BACKEND URL missing/invalid. Set EXPO_PUBLIC_BACKEND_URL to https://your-domain.tld";
    if (!warned) {
      console.log(msg, { rawUrl });
      warned = true;
    }
    throw new Error(msg);
  }
  return BASE;
}

type JSONish = Record<string, any> | undefined;

async function fetchJSON(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
) {
  const base = getBackendBase();
  const url = `${base}${path.startsWith("/") ? path : `/${path}`}`;

  const timeoutMs = init.timeoutMs ?? 8000;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  const doOnce = async () => {
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
      signal: controller.signal,
    });
    const text = await res.text();
    let json: any = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch {
      // leave json as {}
    }
    clearTimeout(id);
    if (!res.ok || json?.ok === false) {
      const message =
        json?.message ||
        `[api] HTTP ${res.status} for ${url} (${res.statusText})`;
      const err: any = new Error(message);
      err.status = res.status;
      err.details = json?.details ?? text;
      err.url = url;
      throw err;
    }
    return json?.data ?? json;
  };

  // retry on fetch TypeErrors (network)
  let attempt = 0;
  const max = 3;
  while (true) {
    try {
      return await doOnce();
    } catch (e: any) {
      const isNetErr =
        e?.name === "AbortError" ||
        e?.message?.includes?.("Network request failed") ||
        e?.message?.includes?.("NetworkError");
      if (isNetErr && attempt < max - 1) {
        const backoff = 300 * Math.pow(2, attempt); // 300ms, 600ms
        console.log("[api] retrying after network error", {
          url,
          attempt: attempt + 1,
        });
        await new Promise((r) => setTimeout(r, backoff));
        attempt++;
        continue;
      }
      console.log("[api] request failed", { url, error: String(e?.message) });
      throw e;
    }
  }
}

export const api = {
  async health() {
    return fetchJSON("/health", { method: "GET" });
  },
  joinRoom(room_id: string, user_id: string, role: "listener" | "speaker" | "host") {
    return fetchJSON("/rooms/join", {
      method: "POST",
      body: JSON.stringify({ room_id, user_id, role } as JSONish),
    });
  },
  setMicRole(room_id: string, user_id: string, enable: boolean) {
    return fetchJSON("/rooms/role", {
      method: "POST",
      body: JSON.stringify({ room_id, user_id, enable } as JSONish),
    });
  },
  getParticipants(room_id: string) {
    return fetchJSON(`/rooms/${room_id}/participants`, { method: "GET" });
  },
};

// Log backend base once at startup (import this file early)
try {
  console.log("[api] BACKEND BASE:", getBackendBase());
} catch (e: any) {
  console.log("[api] BACKEND BASE error:", e?.message);
}
