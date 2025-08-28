// supabase/functions/super-action/index.ts
// Deno-based Supabase Edge Function: validates a webhook secret header and echoes the payload.

export default async function handler(req: Request) {
  // header name used in your 100ms/Supabase webhook settings
  const HEADER_NAME = 'dreamksa-webhook-secret';

  // Supabase edge functions expose secrets via Deno.env.get('NAME')
  const configuredSecret = Deno.env.get(HEADER_NAME);
  if (!configuredSecret) {
    return new Response(JSON.stringify({ ok: false, error: 'secret_not_configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Accept header case-insensitively
  const incomingSecret = req.headers.get(HEADER_NAME) ?? req.headers.get(HEADER_NAME.toLowerCase());

  if (incomingSecret !== configuredSecret) {
    return new Response(JSON.stringify({ ok: false, error: 'unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Read body safely
  let body: any = null;
  try {
    body = await req.json();
  } catch (err) {
    // fallback to text if not json
    body = await req.text();
  }

  // (Optional) small event handling placeholder — extend for your logic
  // e.g. if (body.type === 'hms.something') { ... }

  return new Response(JSON.stringify({ ok: true, received: body }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}
