import Constants from "expo-constants";
// optional: OTA manifest (do not hard-import to avoid bundling issues when not installed)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const Updates: any;

function tryGet<T>(fn: () => T): T | undefined {
  try {
    return fn();
  } catch {
    return undefined;
  }
}

// Allow runtime override for dev
declare global {
  // eslint-disable-next-line no-var
  var __BACKEND_URL: string | undefined;
  // eslint-disable-next-line no-var
  var __BACKEND_PREFIX: string | undefined;
}

function candidateList(): string[] {
  const cands: string[] = [];

  // 0) Runtime override (works without rebuild)
  const rt = (globalThis as any).__BACKEND_URL;
  if (typeof rt === "string") cands.push(rt);

  // 1) Public env (inlined at Metro build time)
  if (typeof process?.env?.EXPO_PUBLIC_BACKEND_URL === "string") {
    cands.push(process.env.EXPO_PUBLIC_BACKEND_URL!);
  }

  // 2) app.config extra (embedded at native build time)
  const extra = tryGet(() => (Constants as any).expoConfig?.extra) ?? {};
  if (typeof (extra as any)?.backendUrl === "string") cands.push((extra as any).backendUrl);

  // 3) OTA/production manifest extra
  const m2 = tryGet(() => (Updates as any)?.manifest)?.extra ?? {};
  if (typeof (m2 as any)?.backendUrl === "string") cands.push((m2 as any).backendUrl);

  return cands.filter(Boolean as any);
}

let BASE = "";
function resolveBase(): string {
  if (BASE) return BASE;
  const list = candidateList().map((v) => (v || "").trim());
  const chosen = list.find((v) => /^https?:\/\//i.test(v)) || "";
  if (chosen.endsWith("/")) BASE = chosen.slice(0, -1);
  else BASE = chosen;

  // One-time verbose log of all candidates + the winner
  console.log("[api] backend url candidates:", {
    runtimeOverride: (globalThis as any).__BACKEND_URL ?? null,
    env: (process as any)?.env?.EXPO_PUBLIC_BACKEND_URL ?? null,
    constantsExtra: tryGet(() => (Constants as any).expoConfig?.extra?.backendUrl) ?? null,
    updatesExtra: tryGet(() => (Updates as any)?.manifest?.extra?.backendUrl) ?? null,
    chosen: BASE || null,
  });

  return BASE;
}

export function getBackendBase(): string {
  const base = resolveBase();
  if (!base) {
    throw new Error(
      "[api] BACKEND URL missing/invalid. Set EXPO_PUBLIC_BACKEND_URL or global.__BACKEND_URL or extra.backendUrl"
    );
  }
  return base;
}

type JSONish = Record<string, any>;

// --- PATCH: prefix auto-detect in lib/api.ts ---
let _prefix: string | null = null;
const PREFIX_CANDIDATES = ["", "/api"]; // add more if needed e.g. "/v1"

async function pickPrefix(base: string): Promise<string> {
  if (globalThis.__BACKEND_PREFIX) return (_prefix = globalThis.__BACKEND_PREFIX);
  if (_prefix !== null) return _prefix;
  for (const cand of PREFIX_CANDIDATES) {
    try {
      const url = `${base}${cand}/health`;
      const res = await fetch(url, { method: "GET" });
      if (res.ok) {
        _prefix = cand;
        console.log("[api] selected prefix:", _prefix || "(root)");
        return _prefix;
      }
    } catch {
      // ignore, try next
    }
  }
  _prefix = ""; // fallback to root; we'll still see 404s if wrong, but we tried
  console.log("[api] prefix autodetect failed; using root");
  return _prefix;
}

async function fetchJSON(
  path: string,
  init: RequestInit & { timeoutMs?: number } = {}
) {
  const base = getBackendBase();
  const pfx = await pickPrefix(base);
  const url = `${base}${pfx}${path.startsWith("/") ? path : `/${path}`}`;

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
  leaveRoom(room_id: string, user_id: string) {
    return fetchJSON("/rooms/leave", {
      method: "POST",
      body: JSON.stringify({ room_id, user_id } as JSONish),
    });
  },
  raiseHand(room_id: string, user_id: string) {
    return fetchJSON("/rooms/handraise", {
      method: "POST",
      body: JSON.stringify({ room_id, user_id } as JSONish),
    });
  },
  lowerHand(room_id: string, user_id: string) {
    return fetchJSON("/rooms/handlower", {
      method: "POST",
      body: JSON.stringify({ room_id, user_id } as JSONish),
    });
  },
};
