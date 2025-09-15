import { DEMO_MODE } from './demoMode';

// Light RTL helpers
const rtl = (ar: string, _en: string) => ar;

// In-memory demo store
type UID = string;
type RoomID = string;
type Role = 'host' | 'moderator' | 'speaker' | 'listener';

type DemoParticipant = {
  user_id: UID;
  role: Role;
  name: string;
  muted: boolean;
  handRaised: boolean;
  left_at: string | null;
};
type DemoMessage = {
  id: string;
  room_id: RoomID;
  user_id: UID | null; // null => system
  text: string;
  ts: number;
};

type DemoRoom = {
  id: RoomID;
  title: string;
  hms_room_id: string; // fake
  participants: Record<UID, DemoParticipant>;
  messages: DemoMessage[];
};

type DemoStore = {
  rooms: Record<RoomID, DemoRoom>;
  wallet: Record<UID, number>;
  gifts: Record<string, { id: string; name: string; price: number; emoji: string }>;
};

const randomId = (len = 6) => Math.random().toString(36).slice(2, 2 + len);
const nowIso = () => new Date().toISOString();
const coinsStart = 5000;

const demo: DemoStore = {
  rooms: {},
  wallet: {},
  gifts: {
    rose: { id: 'rose', name: rtl('وردة', 'Rose'), price: 50, emoji: '🌹' },
    heart: { id: 'heart', name: rtl('قلب', 'Heart'), price: 100, emoji: '❤️' },
    car: { id: 'car', name: rtl('سيارة', 'Car'), price: 500, emoji: '🏎️' },
    yacht: { id: 'yacht', name: rtl('يخت', 'Yacht'), price: 2000, emoji: '🛥️' },
  },
};

function ensureRoom(room_id: RoomID): DemoRoom {
  let r = demo.rooms[room_id];
  if (!r) {
    r = demo.rooms[room_id] = {
      id: room_id,
      title: rtl('غرفة دردشة', 'Chat Room'),
      hms_room_id: randomId(24),
      participants: {},
      messages: [],
    };
    // Seed a couple of audience ghosts
    seedAudience(r);
  }
  return r;
}

function seedAudience(r: DemoRoom) {
  const ghosts = [
    { name: 'Alya', role: 'listener' as Role },
    { name: 'Noura', role: 'listener' as Role },
    { name: 'Bader', role: 'listener' as Role },
  ];
  ghosts.forEach((g) => {
    const uid = randomId(8);
    r.participants[uid] = {
      user_id: uid,
      role: g.role,
      name: g.name,
      muted: true,
      handRaised: false,
      left_at: null,
    };
  });
  pushSystem(r, rtl('انضم بعض المستخدمين 👋', 'Some users joined 👋'));
}

function pushSystem(r: DemoRoom, text: string) {
  r.messages.push({ id: randomId(10), room_id: r.id, user_id: null, text, ts: Date.now() });
}

function pushUser(r: DemoRoom, uid: UID, text: string) {
  r.messages.push({ id: randomId(10), room_id: r.id, user_id: uid, text, ts: Date.now() });
}

function grantCoins(uid: UID) {
  if (demo.wallet[uid] == null) demo.wallet[uid] = coinsStart;
}

function json(resBody: any, init: number = 200) {
  return new Response(JSON.stringify(resBody), {
    status: init,
    headers: { 'Content-Type': 'application/json' },
  });
}

function parseBody(body: any) {
  try {
    if (!body) return {};
    if (typeof body === 'string') return JSON.parse(body);
    if (body instanceof FormData) return Object.fromEntries(body as any);
    return JSON.parse(String(body));
  } catch {
    return {};
  }
}

// Minimal router for our API base
const API_BASES = ['https://api.dreamsksa.online', 'http://localhost:3001', 'http://127.0.0.1:3001'];

function isApi(url: string) {
  return API_BASES.some((b) => url.startsWith(b));
}

function pathOf(url: string) {
  for (const b of API_BASES) if (url.startsWith(b)) return url.slice(b.length);
  return url;
}

// Periodic audience churn for realism
function startChurn(room: DemoRoom) {
  if ((room as any).__churn) return;
  (room as any).__churn = setInterval(() => {
    // flip a random listener mute/hand
    const arr = Object.values(room.participants).filter((p) => !p.left_at);
    if (arr.length === 0) return;
    const p = arr[Math.floor(Math.random() * arr.length)];
    if (p.role === 'listener') {
      p.handRaised = !p.handRaised;
      pushSystem(room, p.handRaised ? rtl(`${p.name} طلب التحدث ✋`, `${p.name} raised hand ✋`) :
        rtl(`${p.name} أنزل يده`, `${p.name} lowered hand`));
    }
  }, 6000);
}

// DEMO fetch shim
export function installDemoFetch() {
  if (!DEMO_MODE) return;
  if ((globalThis as any).__demoFetchInstalled) return;
  (globalThis as any).__demoFetchInstalled = true;

  const realFetch = globalThis.fetch.bind(globalThis);
  globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : String(input);
    if (!isApi(url)) return realFetch(input as any, init);

    const p = pathOf(url);
    const method = (init?.method || 'GET').toUpperCase();
    const body = parseBody(init?.body);

    // Debug banner once
    if (!(globalThis as any).__demoLogged) {
      console.log('[api] DEMO MODE active — intercepting backend calls');
      (globalThis as any).__demoLogged = true;
    }

    // Health
    if (p === '/health') return json({ ok: true, ts: new Date().toISOString(), demo: true });

    // HMS token
    if (p === '/hms/token' && method === 'POST') {
      const { room_id, user_id } = body;
      ensureRoom(room_id);
      grantCoins(user_id);
      return json({ ok: true, token: `demo-token-${room_id}-${user_id}` });
    }

    // Join
    if (p === '/rooms/join' && method === 'POST') {
      const { room_id, user_id, role } = body;
      const r = ensureRoom(room_id);
      grantCoins(user_id);
      r.participants[user_id] = r.participants[user_id] || {
        user_id,
        role: (role as Role) || 'listener',
        name: (user_id || '').slice(0, 6),
        muted: role === 'listener',
        handRaised: false,
        left_at: null,
      };
      r.participants[user_id].left_at = null;
      pushSystem(r, rtl(`انضم ${r.participants[user_id].name}`, `${r.participants[user_id].name} joined`));
      startChurn(r);
      return json({ ok: true, data: { room_id, user_id, role: r.participants[user_id].role } });
    }

    // Leave
    if (p === '/rooms/leave' && method === 'POST') {
      const { room_id, user_id } = body;
      const r = ensureRoom(room_id);
      const me = r.participants[user_id];
      if (me) {
        me.left_at = nowIso();
        pushSystem(r, rtl(`غادر ${me.name}`, `${me.name} left`));
      }
      return json({ ok: true });
    }

    // Role toggle (promote/demote)
    if (p === '/rooms/role' && method === 'POST') {
      const { room_id, user_id, enable } = body; // enable -> speaker
      const r = ensureRoom(room_id);
      const me = r.participants[user_id];
      if (me) {
        me.role = enable ? 'speaker' : 'listener';
        me.muted = !enable;
        pushSystem(r, enable ? rtl(`${me.name} أصبح متحدثًا 🎙️`, `${me.name} is now a speaker 🎙️`)
                             : rtl(`${me.name} عاد مستمعًا`, `${me.name} is now a listener`));
      }
      return json({ ok: true, role: me?.role || 'listener' });
    }

    // Hand raise/lower
    if (p === '/rooms/handraise' && method === 'POST') {
      const { room_id, user_id } = body;
      const r = ensureRoom(room_id);
      const me = r.participants[user_id];
      if (me) {
        me.handRaised = true;
        pushSystem(r, rtl(`${me.name} طلب التحدث ✋`, `${me.name} raised hand ✋`));
      }
      return json({ ok: true });
    }
    if (p === '/rooms/handlower' && method === 'POST') {
      const { room_id, user_id } = body;
      const r = ensureRoom(room_id);
      const me = r.participants[user_id];
      if (me) {
        me.handRaised = false;
        pushSystem(r, rtl(`${me.name} أنزل يده`, `${me.name} lowered hand`));
      }
      return json({ ok: true });
    }

    // Participants
    const matchParts = p.match(/^\/rooms\/([^/]+)\/participants$/);
    if (matchParts && method === 'GET') {
      const room_id = decodeURIComponent(matchParts[1]);
      const r = ensureRoom(room_id);
      const list = Object.values(r.participants).filter((x) => !x.left_at);
      return json({ ok: true, participants: list });
    }

    // Chat send
    if (p === '/rooms/chat' && method === 'POST') {
      const { room_id, user_id, text } = body;
      const r = ensureRoom(room_id);
      pushUser(r, user_id, String(text || '').trim());
      return json({ ok: true });
    }

    // Chat fetch (simple pull)
    const matchChat = p.match(/^\/rooms\/([^/]+)\/messages$/);
    if (matchChat && method === 'GET') {
      const room_id = decodeURIComponent(matchChat[1]);
      const r = ensureRoom(room_id);
      // return last 100
      return json({ ok: true, messages: r.messages.slice(-100) });
    }

    // Gifts/coins
    if (p === '/rooms/gift' && method === 'POST') {
      const { room_id, from_user_id, to_user_id, gift_id } = body;
      const r = ensureRoom(room_id);
      const gift = demo.gifts[gift_id] || demo.gifts.rose;
      grantCoins(from_user_id);
      if (demo.wallet[from_user_id] >= gift.price) {
        demo.wallet[from_user_id] -= gift.price;
        pushSystem(r, rtl(`🎁 تم إرسال ${gift.emoji} ${gift.name}`, `🎁 Sent ${gift.emoji} ${gift.name}`));
        return json({ ok: true, balance: demo.wallet[from_user_id] });
      } else {
        return json({ ok: false, message: rtl('لا يوجد رصيد كافٍ', 'Insufficient balance') }, 400);
      }
    }

    // Unknown -> pass through to avoid breaking other calls
    return realFetch(input as any, init);
  };
}

if (DEMO_MODE) {
  try { installDemoFetch(); } catch (e) { console.log('[api] DEMO install failed', e); }
}


