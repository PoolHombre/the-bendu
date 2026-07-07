# Architecture

## System Diagram

```
┌─────────────────────────────────────┐
│         Browser (React SPA)         │
│                                     │
│  Auth ─► ScoreDisplay ─► DetailPage │
│                              │      │
│                          Magnifier  │
└──────────┬──────────────────┬───────┘
           │                  │
           ▼                  ▼
┌──────────────────┐  ┌──────────────────┐
│  Supabase Client │  │  Vercel API      │
│  (auth + reads)  │  │  /api/evaluate   │
│                  │  │  /api/history    │
│                  │  │  /api/magnifier  │
└────────┬─────────┘  └───┬─────────┬───┘
         │                │         │
         ▼                ▼         ▼
┌──────────────────┐  ┌─────────────────┐
│  Supabase        │  │  Anthropic API  │
│  (Postgres + RLS │  │  (Claude)       │
│   + Auth)        │  │                 │
└──────────────────┘  └─────────────────┘
```

## Frontend

- **Framework:** React 19 with TypeScript
- **Build tool:** Vite 8
- **Routing:** State-based (`page` state in `App.tsx`), not URL-based. Three pages: `home`, `detail`, `magnifier`.
- **Styling:** Inline styles. No CSS framework. Minimal by design.
- **Charts:** Recharts for the 30-day line chart on the detail page.

### Component Tree

```
App
├── Auth                    (shown when no session)
├── ScoreDisplay            (page: 'home')
│   └── ScoreBlock ×3       (Assessment, Balance 24h, Balance 7d)
├── DetailPage              (page: 'detail')
│   └── Recharts LineChart
└── Magnifier               (page: 'magnifier')
```

### State Management

No state library. All state is local to components via `useState`. The Supabase client (`src/lib/supabase.ts`) is a singleton initialized from env vars.

Auth state flows through `App.tsx`:
1. `supabase.auth.getSession()` on mount
2. `supabase.auth.onAuthStateChange()` subscription
3. Session passed as `userId` prop to child components

## API Layer

Three Vercel serverless functions in the `api/` directory:

| Endpoint | Method | Auth | AI | DB Write |
|----------|--------|------|-----|----------|
| `/api/evaluate` | POST | via `user_id` in body | Yes (Claude) | Yes |
| `/api/history` | GET | via `user_id` in query | No | No (read only) |
| `/api/magnifier` | POST | No | Yes (Claude) | No |

All API functions use the Supabase service role key (server-side only) to bypass RLS when writing. The frontend uses the anon key and relies on RLS for reads.

## AI Integration

Both `/api/evaluate` and `/api/magnifier` call the Anthropic API using the `@anthropic-ai/sdk` package.

### System Prompt

Both endpoints share the same identity prompt:

```
You are The Bendu, a clarity and reasoning evaluator.
You do not judge whether the user is morally right, politically correct, or factually omniscient.
You evaluate whether the submitted claim is clear, specific, supported, qualified, internally consistent, and aware of rebuttals.
Score only the submitted text.
Do not compare the user to other users.
Do not infer private traits.
```

The evaluate endpoint adds `Return structured JSON only.` and requests a specific JSON schema. The magnifier endpoint adds Toulmin-specific sequencing instructions.

## Database

Single table (`clarity_scores`) in Supabase Postgres. See [DATABASE.md](DATABASE.md).

Row Level Security is enabled. Two policies:
- Users can SELECT their own rows
- Users can INSERT their own rows

The API uses the service role key to INSERT (bypassing RLS) because the `user_id` is passed from the frontend session, not from a Supabase auth context on the server side.

## Deployment

Vercel handles both the Vite SPA and the serverless functions. `vercel.json` configures rewrites:
- `/api/*` routes to serverless functions
- Everything else falls through to `index.html` (SPA)

## Security Boundaries

- **Client:** Has the Supabase anon key (public, safe to expose). Can only read rows matching `auth.uid()` via RLS.
- **Server:** Has the Supabase service role key (secret) and Anthropic API key (secret). Both are environment variables, never bundled into the frontend.
- **No middleware auth on API routes.** V1 trusts the `user_id` passed in the request body. This is acceptable for a personal tool but would need server-side session validation before any multi-tenant deployment.
