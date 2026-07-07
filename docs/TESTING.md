# Testing

## Current State

V1 has no automated tests. Testing is manual.

## Manual Testing Checklist

### Auth
- [ ] Sign up with a new email/password
- [ ] Sign in with existing credentials
- [ ] Sign out and confirm redirect to login page
- [ ] Attempt sign in with wrong password (expect error message)

### Assessment
- [ ] Submit a claim and receive a score (0-100)
- [ ] Verify component scores are displayed (five bars)
- [ ] Verify color indicator matches the score range
- [ ] Verify explanation text is displayed
- [ ] Submit an empty claim (button should be disabled or no request sent)

### Balance
- [ ] After submitting multiple scores, verify 24h average updates
- [ ] Verify 7d average calculates correctly
- [ ] Click any score block to navigate to Codex

### Codex (Detail Page)
- [ ] Verify color thresholds are displayed
- [ ] Verify "How Assessment Works" explanation is present
- [ ] If scores exist, verify the 30-day line chart renders
- [ ] Click a recent assessment to see its component breakdown
- [ ] Verify "Open Mirror" button navigates to Mirror

### Mirror
- [ ] Enter a claim and click "Begin Analysis"
- [ ] Verify the Mirror responds with the first Toulmin question
- [ ] Respond to each question and verify follow-up questions
- [ ] Click "New claim" to restart
- [ ] Verify "Back to Codex" link works

### Security
- [ ] Verify `.env` is not committed to git
- [ ] Verify `.env.example` contains no real keys
- [ ] Verify browser network tab shows no service role key in requests
- [ ] Sign in as User A, submit scores. Sign in as User B, verify User A's scores are not visible.

## Planned Automated Tests

### Unit Tests (not yet implemented)
- `scoreToColor()` — verify color mapping for boundary values (0, 20, 21, 40, 41, 60, 61, 80, 81, 100)
- Component score validation — verify components sum to total score
- Color label to hex mapping

### API Integration Tests (not yet implemented)
- `/api/evaluate` — mock Claude response, verify Supabase insert and response shape
- `/api/history` — seed test data, verify query filtering by user and date range
- `/api/magnifier` — mock Claude response, verify conversation threading

### Frontend Component Tests (not yet implemented)
- `Auth` — render, fill inputs, submit, verify loading state
- `ScoreDisplay` — render with mock scores, verify average calculation
- `Magnifier` — render, start conversation, send messages

## Type Checking

The project uses TypeScript strict mode. Run:

```bash
npx tsc --noEmit
```

This catches type errors across the entire codebase including API functions.
