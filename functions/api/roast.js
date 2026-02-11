// Cloudflare Pages Function: /api/roast
// Proxies quiz results to Claude API and returns the roast text.
// Set ANTHROPIC_API_KEY in Cloudflare dashboard → Settings → Environment Variables

export async function onRequestPost(context) {
  const { request, env } = context;
  const apiKey = env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    return Response.json({ text: "Smork's brain is offline. API key not configured." }, { status: 500 });
  }

  try {
    const { score, job, profile } = await request.json();

    const prompt = `You are SMORK, the internet's most brutally honest AI career counselor at smork.co. Funny, savage, weirdly insightful. Short punchy sentences.

User scored ${score}/100 (higher = more replaceable). Guessed job: ${job}.

Answers:
${profile}

Write ~180 word personalized roast. Be SPECIFIC to their answers. Include: 1) Devastating opener about their job 2) Funny scenario of an AI agent doing their routine 3) The one thing keeping them employed (backhanded) 4) One sharp survival tip (with attitude). No bullets/headers. Dark humor. End with a one-liner.`;

    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await r.json();
    const text = data.content?.map(b => b.text || "").join("") || "Smork.exe has stopped working.";

    return Response.json({ text }, {
      headers: { "Access-Control-Allow-Origin": "*" },
    });
  } catch (e) {
    return Response.json({ text: "Smork's brain glitched. The irony is not lost on us." }, { status: 500 });
  }
}

// Handle CORS preflight
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
