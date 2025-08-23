/// <reference lib="dom" />
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const SUBDOMAIN = Deno.env.get("HMS_SUBDOMAIN")!;
const ACCESS_KEY = Deno.env.get("HMS_ACCESS_KEY")!;
const SECRET     = Deno.env.get("HMS_SECRET")!;
const REGION     = Deno.env.get("HMS_REGION") || "prod-in";

// POST https://{REGION}.100ms.live/hmsapi/{SUBDOMAIN}.app.100ms.live/api/token
const HMS_URL = `https://${REGION}.100ms.live/hmsapi/${SUBDOMAIN}.app.100ms.live/api/token`;
const BASIC   = "Basic " + btoa(`${ACCESS_KEY}:${SECRET}`);

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
    }

    const body = await req.json().catch(() => ({}));
    const { room_id, role, user_id } = body || {};

    // Validate payload
    if (!room_id || !role || !user_id) {
      return new Response(
        JSON.stringify({ error: "Missing fields", need: { room_id: true, role: true, user_id: true }, got: body }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Role alias protection (belt & suspenders)
    const ALIAS: Record<string, string> = {
      speake: "speaker", // typo fix
      viewer: "listener", // if you want to keep old names
      host:   "speaker",
    };
    const requested = (role || "").trim();
    const role_to_use = ALIAS[requested] ?? requested;

    // Forward to 100ms token API
    const res = await fetch(HMS_URL, {
      method: "POST",
      headers: {
        "Authorization": BASIC,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ room_id, role: role_to_use, user_id }),
    });

    const text = await res.text();
    let json: any;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    if (!res.ok) {
      // Proxy the exact 100ms error so client sees WHY (role not found, room missing, etc.)
      return new Response(JSON.stringify({ error: "hms_error", status: res.status, body: json }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 100ms returns { token }
    return new Response(JSON.stringify(json), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: "server_error", message: String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});




