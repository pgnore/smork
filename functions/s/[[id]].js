// Serves dynamic OG-tagged HTML for share URLs like /s/abc123
// Twitter, LinkedIn, etc. crawl this and see the personalized share card image

export async function onRequestGet(context) {
  const { params, env } = context;
  const id = (params.id || []).join("");

  if (!id || !env.SMORK_KV) {
    return Response.redirect("https://smork.co", 302);
  }

  const metaRaw = await env.SMORK_KV.get(`share-meta:${id}`);
  if (!metaRaw) {
    return Response.redirect("https://smork.co", 302);
  }

  const meta = JSON.parse(metaRaw);
  const imageUrl = `https://smork.co/api/share?id=${id}`;
  const redirectUrl = meta.challenge
    ? `https://smork.co?challenge=${encodeURIComponent(meta.challenge)}`
    : "https://smork.co";

  const title = `I scored ${meta.score}/100: "${meta.verdict}" | SMORK.CO`;
  const description = `Smork guessed my job: ${meta.job}. How replaceable are you? Take the quiz.`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:image" content="${imageUrl}" />
  <meta property="og:image:width" content="1200" />
  <meta property="og:image:height" content="630" />
  <meta property="og:type" content="website" />
  <meta property="og:url" content="https://smork.co/s/${id}" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${title}" />
  <meta name="twitter:description" content="${description}" />
  <meta name="twitter:image" content="${imageUrl}" />
  <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
</head>
<body style="background:#050505;color:#fff;font-family:monospace;display:flex;align-items:center;justify-content:center;height:100vh;margin:0">
  <p>Redirecting to <a href="${redirectUrl}" style="color:#ff0040">smork.co</a>...</p>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
