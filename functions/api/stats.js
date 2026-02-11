// Cloudflare Pages Function: /api/stats
// GET  → return all results from KV
// POST → save results to KV
//
// Requires KV namespace binding: SMORK_KV
// Set up in Cloudflare dashboard → Settings → Bindings → KV Namespace

const KV_KEY = "smork-results";

const ALLOWED_ORIGINS = ["https://smork.co", "https://www.smork.co", "https://smork-quiz.pages.dev"];
const POST_RATE_LIMIT = 30;
const RATE_WINDOW_SEC = 3600;

function getAllowedOrigin(request) {
  const origin = request.headers.get("Origin") || "";
  if (ALLOWED_ORIGINS.includes(origin) || origin.endsWith(".smork-quiz.pages.dev")) {
    return origin;
  }
  return null;
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function checkRateLimit(env, ip) {
  if (!env.SMORK_KV) return { allowed: true };
  const key = `rl:stats:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  const raw = await env.SMORK_KV.get(key);
  let bucket = raw ? JSON.parse(raw) : { count: 0, start: now };
  if (now - bucket.start > RATE_WINDOW_SEC) {
    bucket = { count: 0, start: now };
  }
  if (bucket.count >= POST_RATE_LIMIT) {
    return { allowed: false };
  }
  bucket.count++;
  await env.SMORK_KV.put(key, JSON.stringify(bucket), { expirationTtl: RATE_WINDOW_SEC });
  return { allowed: true };
}

// GET /api/stats — load results
export async function onRequestGet(context) {
  const { request, env } = context;
  const origin = getAllowedOrigin(request);

  if (!env.SMORK_KV) {
    return Response.json([], { headers: corsHeaders(origin) });
  }

  try {
    const data = await env.SMORK_KV.get(KV_KEY);
    return Response.json(data ? JSON.parse(data) : [], { headers: corsHeaders(origin) });
  } catch {
    return Response.json([], { headers: corsHeaders(origin) });
  }
}

// POST /api/stats — save results
export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = getAllowedOrigin(request);

  if (!origin) {
    return Response.json({ ok: false, error: "Unauthorized" }, { status: 403 });
  }

  if (!env.SMORK_KV) {
    return Response.json({ ok: false, error: "KV not configured" }, { status: 500, headers: corsHeaders(origin) });
  }

  // Rate limit
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rl = await checkRateLimit(env, ip);
  if (!rl.allowed) {
    return Response.json({ ok: false, error: "Rate limited" }, { status: 429, headers: corsHeaders(origin) });
  }

  try {
    const contentLength = parseInt(request.headers.get("Content-Length") || "0", 10);
    if (contentLength > 100_000) {
      return Response.json({ ok: false, error: "Payload too large" }, { status: 413, headers: corsHeaders(origin) });
    }

    const results = await request.json();
    if (!Array.isArray(results)) {
      return Response.json({ ok: false, error: "Invalid data" }, { status: 400, headers: corsHeaders(origin) });
    }
    // Keep last 500
    const trimmed = results.slice(-500);
    await env.SMORK_KV.put(KV_KEY, JSON.stringify(trimmed));
    return Response.json({ ok: true }, { headers: corsHeaders(origin) });
  } catch (e) {
    return Response.json({ ok: false }, { status: 500, headers: corsHeaders(origin) });
  }
}

// Handle CORS preflight
export async function onRequestOptions(context) {
  const origin = getAllowedOrigin(context.request);
  return new Response(null, { headers: corsHeaders(origin) });
}
