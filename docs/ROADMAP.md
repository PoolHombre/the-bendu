# Roadmap

## V1 (Current)

Implemented:
- [x] Supabase Auth (email/password signup/login)
- [x] Assessment — Claude-powered clarity scoring (0-100, five dimensions)
- [x] Balance — 24h and 7d trend averages
- [x] Archive — 30-day score history with line chart
- [x] Mirror — Guided Toulmin reasoning chatbot
- [x] Codex — Scoring explanation and color thresholds
- [x] Supabase Postgres with Row Level Security
- [x] Vercel serverless API
- [x] TypeScript type-checked codebase

Not implemented:
- [ ] Automated tests
- [ ] Server-side auth validation on API routes
- [ ] Rate limiting
- [ ] URL-based routing
- [ ] Email verification enforcement

## V2 — Mirror Modes

Add selectable reasoning models to Mirror:

| Mode | Framework | Status |
|------|-----------|--------|
| Toulmin | Claim, data, warrant, backing, qualifier, rebuttal | Shipped (V1) |
| Aristotelian | Major premise, minor premise, conclusion, fallacy check | Planned |
| Inductive | Pattern observation, sample size, context breaks, disproof | Planned |
| Abductive | Observation, possible explanations, best fit, evidence to reconsider | Planned |
| Pragma-Dialectical | Position, strongest objection, defense, recursive challenge | Planned |

Features:
- Model selector in Mirror UI
- Ability to switch models mid-conversation
- Cross-model comparison: show how the same claim scores or surfaces weaknesses differently across models
- Summary: "This claim is strong under [model] but weak under [model]"

## V3 — Depth

- **Rebuttal generation** — After scoring, auto-generate a counter-argument to the claim
- **Score persistence in Mirror** — Save Mirror conversation outcomes to the database
- **Export** — Download score history as CSV or PDF
- **Sharing** — Generate a shareable link for a single assessment (read-only, no account required)

## V4 — Hardening

- **Server-side auth** — Validate Supabase JWT on all API routes
- **Rate limiting** — Per-user limits on API calls to prevent abuse
- **Automated test suite** — Unit tests, API integration tests, component tests
- **URL routing** — Replace state-based navigation with React Router
- **Email verification** — Require email confirmation before first assessment
- **Error boundaries** — Graceful error handling in the React component tree
