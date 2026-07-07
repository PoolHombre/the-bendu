# Setup Guide

## Prerequisites

- Node.js 18+ (LTS recommended)
- npm
- A [Supabase](https://supabase.com) account (free tier works)
- An [Anthropic](https://console.anthropic.com) API key

## 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/the-bendu.git
cd the-bendu
npm install
```

## 2. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project.
2. Note your **Project URL** (e.g., `https://abcdefgh.supabase.co`).
3. Go to **Settings > API** and note:
   - **anon/public key** (safe for frontend)
   - **service_role key** (secret, server-side only)

## 3. Create the Database Table

1. In your Supabase dashboard, open the **SQL Editor**.
2. Paste the contents of `supabase-schema.sql` from the project root.
3. Click **Run**.
4. This creates the `clarity_scores` table, index, and RLS policies.

## 4. Configure Environment Variables

Copy the example file:

```bash
cp .env.example .env
```

Fill in your values:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key
ANTHROPIC_API_KEY=sk-ant-...your-key
```

- `VITE_` prefixed variables are bundled into the frontend by Vite. Only the Supabase URL and anon key should have this prefix.
- `SUPABASE_SERVICE_ROLE_KEY` and `ANTHROPIC_API_KEY` are server-side only. They are used by Vercel serverless functions and are never exposed to the browser.

## 5. Start the Dev Server

```bash
npm run dev
```

Opens at `http://localhost:5173`. You'll see the sign-in page.

## 6. Test Auth

1. Click "Need an account? Sign up."
2. Enter an email and password (min 6 characters).
3. Click Sign Up.
4. Depending on your Supabase settings, you may need to confirm your email. For development, you can disable email confirmation in Supabase under **Authentication > Providers > Email**.

## 7. Test the API (requires Vercel CLI)

The `/api/*` endpoints are Vercel serverless functions. To run them locally:

```bash
npm install -g vercel
vercel dev
```

This starts both the Vite frontend and the API functions. The API will be available at the same URL.

Without `vercel dev`, the frontend renders and auth works, but "Assess Clarity" and "Begin Analysis" will fail because the API functions are not served by Vite's dev server.

## Type Check

```bash
npx tsc --noEmit
```

## Build

```bash
npm run build
```

Output goes to `dist/`.
