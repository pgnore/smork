// POST /api/share — store share card image + metadata in KV
// GET  /api/share?id=X — serve the stored PNG image

const ALLOWED_ORIGINS = ["https://smork.co", "https://www.smork.co", "https://smork-quiz.pages.dev"];

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

export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id || !env.SMORK_KV) {
    return new Response("Not found", { status: 404 });
  }

  const data = await env.SMORK_KV.get(`share:${id}`, { type: "arrayBuffer" });
  if (!data) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(data, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = getAllowedOrigin(request);

  if (!origin) {
    return Response.json({ error: "Unauthorized" }, { status: 403 });
  }

  if (!env.SMORK_KV) {
    return Response.json({ error: "KV not configured" }, { status: 500, headers: corsHeaders(origin) });
  }

  try {
    const { image, score, job, verdict, challenge } = await request.json();

    if (!image || typeof image !== "string" || !image.startsWith("data:image/png")) {
      return Response.json({ error: "Invalid image" }, { status: 400, headers: corsHeaders(origin) });
    }

    // Decode base64 data URL to binary
    const base64 = image.split(",")[1];
    const binary = Uint8Array.from(atob(base64), c => c.charCodeAt(0));

    // Limit to 500KB
    if (binary.length > 500_000) {
      return Response.json({ error: "Image too large" }, { status: 413, headers: corsHeaders(origin) });
    }

    // Generate short ID
    const id = crypto.randomUUID().slice(0, 8);

    // Store image
    await env.SMORK_KV.put(`share:${id}`, binary.buffer, { expirationTtl: 60 * 60 * 24 * 30 }); // 30 days

    // Store metadata
    await env.SMORK_KV.put(`share-meta:${id}`, JSON.stringify({ score, job, verdict, challenge }), { expirationTtl: 60 * 60 * 24 * 30 });

    return Response.json({ id, url: `https://smork.co/s/${id}` }, { headers: corsHeaders(origin) });
  } catch (e) {
    return Response.json({ error: "Failed to save" }, { status: 500, headers: corsHeaders(origin) });
  }
}

export async function onRequestOptions(context) {
  const origin = getAllowedOrigin(context.request);
  return new Response(null, { headers: corsHeaders(origin) });
}
