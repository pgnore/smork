# SMORK.CO — AI Replaceability Quiz

## Architecture

```
┌─────────────────────────────────────────┐
│  Cloudflare Pages (static site)         │
│  ┌───────────────────────────────────┐  │
│  │  Vite + React (quiz, scoring,     │  │
│  │  job detection, share images)     │  │
│  └───────────┬───────────┬───────────┘  │
│              │           │              │
│  ┌───────────▼───┐ ┌────▼───────────┐  │
│  │ /api/roast    │ │ /api/stats     │  │
│  │ (CF Function) │ │ (CF Function)  │  │
│  │ Claude proxy  │ │ KV storage     │  │
│  └───────────────┘ └────────────────┘  │
└─────────────────────────────────────────┘
```

- **Static site**: Quiz UI, scoring engine, 307 job profiles — pure client-side
- **`/api/roast`**: Proxies to Claude API for personalized AI roasts (hides API key)
- **`/api/stats`**: Global stats via Cloudflare KV (replaces `window.storage`)

## Deployment Steps

### 1. Push to GitHub

```bash
cd smork-quiz
git init
git add .
git commit -m "initial"
gh repo create smork-quiz --public --push
```

### 2. Connect to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages** → **Create**
2. Select **Pages** → **Connect to Git** → select `smork-quiz` repo
3. Build settings:
   - **Framework preset**: None
   - **Build command**: `npm install && npm run build`
   - **Build output directory**: `dist`
4. Deploy

### 3. Set up KV Storage (for global stats)

```bash
# Create KV namespace
npx wrangler kv namespace create SMORK_KV

# Note the ID it outputs, then go to:
# Dashboard → your Pages project → Settings → Bindings → Add → KV Namespace
# Variable name: SMORK_KV
# KV namespace: select the one you just created
```

### 4. Add Claude API Key (for AI roasts)

1. Dashboard → your Pages project → **Settings** → **Environment Variables**
2. Add variable:
   - **Name**: `ANTHROPIC_API_KEY`
   - **Value**: your Claude API key (sk-ant-...)
   - **Encrypt**: Yes
3. Select both **Production** and **Preview**

### 5. Connect Your Domain

1. Dashboard → your Pages project → **Custom domains** → **Set up a custom domain**
2. Enter `smork.co` (or whatever domain)
3. Cloudflare auto-configures DNS if the domain is already on Cloudflare

### 6. Redeploy

After adding env vars and bindings, trigger a redeploy:
- Dashboard → **Deployments** → **Retry deployment** on the latest

## Local Development

```bash
npm install
npm run dev          # Vite dev server (no API functions)

# To test with functions locally:
npx wrangler pages dev dist  # after npm run build
```

Note: Local dev without wrangler won't have `/api/roast` or `/api/stats`.
The quiz itself works fine without them (roast gracefully fails, stats show empty).

## Cost

- **Cloudflare Pages**: Free (unlimited sites, 500 builds/month)
- **Cloudflare Functions**: Free tier = 100k requests/day
- **Cloudflare KV**: Free tier = 100k reads/day, 1k writes/day
- **Claude API**: ~$0.003-0.01 per roast (Sonnet, ~1k tokens)

At moderate traffic the only cost is Claude API usage.

## Files

```
smork-quiz/
├── index.html              # Entry HTML
├── package.json            # Dependencies
├── vite.config.js          # Vite build config
├── wrangler.toml           # Cloudflare config
├── src/
│   ├── main.jsx            # React mount
│   └── App.jsx             # Full quiz app (2100+ lines)
└── functions/
    └── api/
        ├── roast.js        # Claude API proxy (Pages Function)
        └── stats.js        # KV stats storage (Pages Function)
```
