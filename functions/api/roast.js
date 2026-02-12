// Cloudflare Pages Function: /api/roast
// Proxies quiz results to Claude API and returns the roast text.
// Set ANTHROPIC_API_KEY in Cloudflare dashboard → Settings → Environment Variables

const ALLOWED_ORIGINS = ["https://smork.co", "https://www.smork.co", "https://smork-quiz.pages.dev"];
const RATE_LIMIT = 10;        // max requests per window
const RATE_WINDOW_SEC = 3600; // 1 hour

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
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function checkRateLimit(env, ip) {
  if (!env.SMORK_KV) return { allowed: true };
  const key = `rl:roast:${ip}`;
  const now = Math.floor(Date.now() / 1000);
  const raw = await env.SMORK_KV.get(key);
  let bucket = raw ? JSON.parse(raw) : { count: 0, start: now };
  if (now - bucket.start > RATE_WINDOW_SEC) {
    bucket = { count: 0, start: now };
  }
  if (bucket.count >= RATE_LIMIT) {
    const retryAfter = RATE_WINDOW_SEC - (now - bucket.start);
    return { allowed: false, retryAfter };
  }
  bucket.count++;
  await env.SMORK_KV.put(key, JSON.stringify(bucket), { expirationTtl: RATE_WINDOW_SEC });
  return { allowed: true, remaining: RATE_LIMIT - bucket.count };
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const origin = getAllowedOrigin(request);

  if (!origin) {
    return Response.json({ text: "Unauthorized origin." }, { status: 403 });
  }

  const apiKey = env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({ text: "Smork's brain is offline. API key not configured." }, { status: 500, headers: corsHeaders(origin) });
  }

  // Rate limit
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  const rl = await checkRateLimit(env, ip);
  if (!rl.allowed) {
    return Response.json(
      { text: "Slow down! Smork needs a breather. Try again later." },
      { status: 429, headers: { ...corsHeaders(origin), "Retry-After": String(rl.retryAfter) } }
    );
  }

  try {
    const body = await request.json();
    const { score, job, profile } = body;

    // Input validation
    if (typeof score !== "number" || score < 0 || score > 100) {
      return Response.json({ text: "Invalid score." }, { status: 400, headers: corsHeaders(origin) });
    }
    if (typeof job !== "string" || job.length === 0 || job.length > 200) {
      return Response.json({ text: "Invalid job." }, { status: 400, headers: corsHeaders(origin) });
    }
    if (typeof profile !== "string" || profile.length === 0 || profile.length > 5000) {
      return Response.json({ text: "Invalid profile." }, { status: 400, headers: corsHeaders(origin) });
    }

    const prompt = `You are SMORK, the internet's most brutally honest AI career counselor at smork.co. Funny, savage, weirdly insightful. Short punchy sentences.

User scored ${score}/100 (higher = more replaceable). Guessed job: ${job}.

Answers:
${profile}

Write ~180 word personalized roast. Be SPECIFIC to their answers. Include: 1) Devastating opener about their job 2) Funny scenario of an AI agent doing their routine 3) The one thing keeping them employed (backhanded) 4) One sharp survival tip (with attitude). No bullets/headers. Dark humor. End with a one-liner.

IMPORTANT: Output PLAIN TEXT only. Do NOT use markdown formatting — no **, no *, no #, no bullet points. Just raw text paragraphs.`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json();
    const text = data.content?.map(b => b.text || "").join("") || "Smork.exe has stopped working.";

    return Response.json({ text }, { headers: corsHeaders(origin) });
  } catch (e) {
    return Response.json({ text: "Smork's brain glitched. The irony is not lost on us." }, { status: 500, headers: corsHeaders(origin) });
  }
}

// Handle CORS preflight
export async function onRequestOptions(context) {
  const origin = getAllowedOrigin(context.request);
  return new Response(null, { headers: corsHeaders(origin) });
}
