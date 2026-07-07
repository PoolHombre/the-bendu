# Database Schema

The Bendu uses Supabase Postgres. The schema is defined in `supabase-schema.sql` at the project root.

## Tables

### auth.users (managed by Supabase)

Supabase Auth manages the `auth.users` table automatically. The Bendu uses email/password sign-up. Relevant columns:

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key, referenced by `clarity_scores.user_id` |
| `email` | text | User's email address |
| `created_at` | timestamptz | Account creation time |

### clarity_scores

Stores every clarity assessment result.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | UUID | No | `gen_random_uuid()` | Primary key |
| `user_id` | UUID | No | — | FK to `auth.users(id)`, cascade delete |
| `post_text` | text | No | — | The submitted claim text |
| `score` | integer | No | — | Total clarity score (0-100) |
| `color` | text | No | — | Color label (Red/Orange/Yellow/Green/Blue) |
| `color_hex` | text | No | — | Color hex code |
| `component_scores` | jsonb | No | — | Breakdown (see below) |
| `explanation` | text | Yes | — | Claude's explanation of the score |
| `created_at` | timestamptz | No | `now()` | Timestamp of assessment |

#### component_scores JSON structure

```json
{
  "specificity": 15,
  "evidence": 12,
  "assumptions": 16,
  "consistency": 18,
  "precision": 11
}
```

Each value is an integer 0-20. The sum equals the total `score`.

### Constraints

- `score` is checked: `score >= 0 AND score <= 100`
- `user_id` has a foreign key to `auth.users(id)` with `ON DELETE CASCADE`

## Indexes

| Name | Columns | Purpose |
|------|---------|---------|
| `idx_clarity_scores_user_created` | `(user_id, created_at DESC)` | Fast lookups for a user's recent scores |

## Row Level Security

RLS is enabled on `clarity_scores`. Two policies:

| Policy | Operation | Rule |
|--------|-----------|------|
| Users can read own scores | SELECT | `auth.uid() = user_id` |
| Users can insert own scores | INSERT | `auth.uid() = user_id` |

These policies apply when using the Supabase anon key (frontend reads). The API functions use the service role key, which bypasses RLS for inserts.

## Setup

Run `supabase-schema.sql` in the Supabase SQL Editor. The script is idempotent (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`).
