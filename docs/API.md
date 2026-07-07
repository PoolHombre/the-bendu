# API Reference

All endpoints are Vercel serverless functions in the `api/` directory.

## POST /api/evaluate

Scores a claim for communication clarity using Claude.

### Request

```json
{
  "user_id": "uuid",
  "post_text": "The claim to evaluate"
}
```

### Response (200)

```json
{
  "id": "uuid",
  "score": 72,
  "color": "Green",
  "color_hex": "#22C55E",
  "components": {
    "specificity": 15,
    "evidence": 12,
    "assumptions": 16,
    "consistency": 18,
    "precision": 11
  },
  "explanation": "The claim provides specific dates and numbers..."
}
```

### Errors

| Status | Body | Cause |
|--------|------|-------|
| 400 | `{"error": "user_id and post_text required"}` | Missing required fields |
| 405 | `{"error": "Method not allowed"}` | Non-POST request |
| 500 | `{"error": "..."}` | Claude API error or Supabase insert error |

### Behavior

1. Sends `post_text` to Claude Sonnet 5 with the Bendu system prompt.
2. Claude returns JSON with score, components, and explanation.
3. Maps score to color using thresholds (0-20 Red, 21-40 Orange, 41-60 Yellow, 61-80 Green, 81-100 Blue).
4. Inserts row into `clarity_scores` table via Supabase service role key.
5. Returns the score data plus the inserted row's `id`.

---

## GET /api/history

Returns a user's score history for a given time window.

### Query Parameters

| Param | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `user_id` | string (UUID) | Yes | — | The user's ID |
| `days` | number | No | 30 | Number of days to look back |

### Response (200)

Array of `clarity_scores` rows, ordered by `created_at` ascending:

```json
[
  {
    "id": "uuid",
    "user_id": "uuid",
    "post_text": "...",
    "score": 72,
    "color": "Green",
    "color_hex": "#22C55E",
    "component_scores": { "specificity": 15, ... },
    "explanation": "...",
    "created_at": "2026-07-06T12:00:00Z"
  }
]
```

### Errors

| Status | Body | Cause |
|--------|------|-------|
| 400 | `{"error": "user_id required"}` | Missing user_id |
| 405 | `{"error": "Method not allowed"}` | Non-GET request |
| 500 | `{"error": "..."}` | Supabase query error |

---

## POST /api/magnifier

Conducts a guided Toulmin reasoning conversation using Claude.

### Request

```json
{
  "claim": "The claim to analyze",
  "conversation_history": [
    { "role": "assistant", "content": "What exactly are you claiming?" },
    { "role": "user", "content": "I'm claiming that..." }
  ]
}
```

- `claim` (required): The original claim being analyzed.
- `conversation_history` (optional): Array of previous messages. Omit or send `[]` to start a new conversation.

### Response (200)

```json
{
  "response": "Thank you for stating your claim clearly. Now, what evidence supports this?"
}
```

### Errors

| Status | Body | Cause |
|--------|------|-------|
| 400 | `{"error": "claim required"}` | Missing claim |
| 405 | `{"error": "Method not allowed"}` | Non-POST request |
| 500 | `{"error": "..."}` | Claude API error |

### Behavior

1. Constructs a message array starting with the user's claim.
2. Appends any conversation history.
3. Sends to Claude Sonnet 5 with the Bendu identity prompt plus Toulmin sequencing instructions.
4. Returns Claude's response text.

The Mirror does not persist conversations to the database. Conversation state is maintained client-side and sent with each request.

---

## AI Model

All endpoints use `claude-sonnet-5` via the `@anthropic-ai/sdk` package. Max tokens: 1024 per response.

## Authentication

V1 does not validate auth tokens on API routes. The `user_id` is passed from the frontend session. This is suitable for a personal tool but would require server-side session validation before multi-tenant use.
