// Cloudflare Pages Function: /api/stats
// GET  → return all results from KV
// POST → save results to KV
//
// Requires KV namespace binding: SMORK_KV
// Set up in Cloudflare dashboard → Settings → Bindings → KV Namespace

const KV_KEY = "smork-results";

// GET /api/stats — load results
export async function onRequestGet(context) {
  const { env } = context;

  if (!env.SMORK_KV) {
    return Response.json([], {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }

  try {
    const data = await env.SMORK_KV.get(KV_KEY);
    return Response.json(data ? JSON.parse(data) : [], {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return Response.json([], {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  }
}

// POST /api/stats — save results
export async function onRequestPost(context) {
  const { request, env } = context;

  if (!env.SMORK_KV) {
    return Response.json({ ok: false, error: "KV not configured" }, { status: 500 });
  }

  try {
    const results = await request.json();
    // Keep last 500
    const trimmed = Array.isArray(results) ? results.slice(-500) : [];
    await env.SMORK_KV.put(KV_KEY, JSON.stringify(trimmed));
    return Response.json({ ok: true }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return Response.json({ ok: false }, { status: 500 });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
