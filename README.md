# The Bendu

A personal clarity evaluation system that scores how clearly you communicate — not whether you're right.

## What It Does

The Bendu takes a claim or statement you've written and scores it for communication clarity on a 0-100 scale. It evaluates five dimensions: specificity, evidence, assumptions, consistency, and precision. It does not judge truth, morality, or political correctness.

A guided reasoning tool (Mirror) walks you through the Toulmin argumentation model step by step, asking about your evidence, warrants, qualifiers, and rebuttals — then reflects back where the clarity gaps are.

## Core Modules

| Module | What it does |
|--------|-------------|
| **Assessment** | Clarity score for a single submitted claim |
| **Balance** | 24-hour and 7-day trend averages |
| **Archive** | 30-day score history with line chart |
| **Mirror** | Guided Toulmin reasoning chatbot |
| **Codex** | Explanation page with scoring rules and color thresholds |

## Tech Stack

- **Frontend:** React 19, TypeScript, Vite
- **API:** Vercel serverless functions (Node.js)
- **Auth:** Supabase Auth (email/password)
- **Database:** Supabase Postgres
- **AI:** Anthropic API (Claude Sonnet 5)
- **Charts:** Recharts

## Local Setup

1. Clone the repo:
   ```
   git clone https://github.com/YOUR_USERNAME/the-bendu.git
   cd the-bendu
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy `.env.example` to `.env` and fill in your keys:
   ```
   cp .env.example .env
   ```

4. Set up Supabase (see [Database Setup](#database-setup) below).

5. Start the dev server:
   ```
   npm run dev
   ```

6. Type check:
   ```
   npx tsc --noEmit
   ```

## Environment Variables

| Variable | Where it's used | Description |
|----------|----------------|-------------|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend | Supabase anonymous/public key |
| `SUPABASE_URL` | API | Supabase project URL (server-side) |
| `SUPABASE_SERVICE_ROLE_KEY` | API | Supabase service role key (never expose to client) |
| `ANTHROPIC_API_KEY` | API | Anthropic API key for Claude |

See `.env.example` for the template. Never commit `.env` — it is gitignored.

## Database Setup

1. Create a [Supabase](https://supabase.com) project.
2. Open the SQL Editor in your Supabase dashboard.
3. Paste and run the contents of `supabase-schema.sql`.
4. This creates the `clarity_scores` table with Row Level Security policies.
5. Copy your project URL, anon key, and service role key into `.env`.

## Running Locally

```bash
npm install          # install dependencies
npm run dev          # start Vite dev server on http://localhost:5173
npx tsc --noEmit     # type check
npm run build        # production build
```

The Vercel serverless API functions (`/api/*`) run only in production or via `vercel dev`. During local development, the frontend connects directly to Supabase for auth and data reads. API calls to `/api/evaluate` and `/api/magnifier` require deployment or running `vercel dev` locally.

## Deployment

1. Push this repo to GitHub.
2. Connect the GitHub repo to [Vercel](https://vercel.com).
3. In Vercel project settings, add all five environment variables.
4. Deploy. Vercel auto-builds the Vite frontend and serves `/api/*` as serverless functions.

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for the full deployment guide.

## Security and Privacy

- **User-submitted only.** The system never scrapes, monitors, or ingests content the user did not explicitly submit.
- **Isolated data.** Users see only their own data. Supabase Row Level Security enforces this at the database level.
- **No comparative scoring.** Users are never ranked against each other.
- **No public leaderboard.**
- **No trait inference.** The Bendu evaluates the submitted text, not the person.
- **Server-side secrets.** The Supabase service role key and Anthropic API key are used only in server-side API functions and are never exposed to the client.

## Current Status

**V1 / Prototype.** The core assessment loop, balance trends, archive history, and Mirror chatbot are implemented. The app type-checks and renders. It requires Supabase credentials and an Anthropic API key to function end-to-end. No automated tests exist yet.

## Roadmap

- Mirror Modes (Aristotelian, Inductive, Abductive, Pragma-Dialectical)
- Cross-model comparison view
- Rebuttal generation
- Automated tests
- Rate limiting

See [docs/ROADMAP.md](docs/ROADMAP.md) for details.

## Documentation

- [Project Overview](docs/PROJECT_OVERVIEW.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Product Spec](docs/PRODUCT_SPEC.md)
- [API Reference](docs/API.md)
- [Database Schema](docs/DATABASE.md)
- [Setup Guide](docs/SETUP.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testing](docs/TESTING.md)
- [Roadmap](docs/ROADMAP.md)
