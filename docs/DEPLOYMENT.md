# Deployment Guide

The Bendu deploys to Vercel, which serves both the Vite-built frontend and the serverless API functions.

## Architecture in Production

```
Vercel
├── Static assets (dist/)     ← Vite build output
├── /api/evaluate             ← Serverless function
├── /api/history              ← Serverless function
└── /api/magnifier            ← Serverless function

Supabase
├── Auth (email/password)
└── Postgres (clarity_scores table)

Anthropic API
└── Claude Sonnet 5 (called by evaluate + magnifier)
```

## Step-by-Step

### 1. Push to GitHub

```bash
cd the-bendu
git init
git add .
git commit -m "Initial commit"
gh repo create the-bendu --public --push
```

Or manually create the repo on GitHub and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/the-bendu.git
git branch -M main
git push -u origin main
```

### 2. Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and click "Add New Project."
2. Import the `the-bendu` GitHub repo.
3. Vercel auto-detects Vite. Default settings work.

### 3. Set Environment Variables

In Vercel project settings (**Settings > Environment Variables**), add:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `ANTHROPIC_API_KEY` | Your Anthropic API key |

Set all five for **Production**, **Preview**, and **Development** environments.

### 4. Deploy

Click "Deploy." Vercel will:
1. Run `npm run build` (which runs `tsc -b && vite build`).
2. Output the SPA to `dist/`.
3. Package each file in `api/` as a serverless function.
4. Apply the rewrites from `vercel.json`.

### 5. Verify

1. Visit your Vercel URL.
2. Sign up or sign in.
3. Submit a test claim. You should see a clarity score.
4. Navigate to Codex. You should see the Archive chart.
5. Open Mirror. Submit a claim and verify the Toulmin conversation works.

## Redeployment

Every push to `main` triggers an automatic redeployment on Vercel.

## vercel.json

```json
{
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

- API requests are routed to serverless functions.
- All other requests serve `index.html` (SPA fallback).

## Custom Domain

In Vercel project settings, go to **Domains** to add a custom domain.

## Troubleshooting

| Problem | Check |
|---------|-------|
| 500 on `/api/evaluate` | Verify `ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are set in Vercel |
| Auth fails | Verify `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set |
| Scores don't save | Check that `supabase-schema.sql` was run in Supabase SQL Editor |
| CORS errors | Vercel handles CORS for same-origin API calls automatically |
