# Product Spec

## Purpose

The Bendu helps individuals improve the clarity of their communication by scoring claims they submit and guiding them through structured reasoning.

## Core Principle

The Bendu evaluates communication clarity only. It does not:
- Judge truth or factual accuracy
- Assess moral or political correctness
- Compare users to each other
- Infer private characteristics or traits
- Score or analyze content the user did not explicitly submit

## User Flow

### Authentication
1. User signs up with email and password via Supabase Auth.
2. User signs in. Session is stored in the browser via Supabase client.
3. All subsequent data is scoped to `user_id` from the session.

### Assessment (Home Page)
1. User types a claim into the textarea.
2. User clicks "Assess Clarity."
3. The claim is sent to `/api/evaluate`, which calls Claude with the Bendu system prompt.
4. Claude returns a JSON object with a total score (0-100), five component scores (0-20 each), and an explanation.
5. The score is saved to `clarity_scores` in Supabase.
6. The UI shows:
   - The total score with a color indicator
   - The explanation text
   - Component score bars (specificity, evidence, assumptions, consistency, precision)

### Balance (Home Page)
Three blocks displayed in a row:
- **Assessment:** The most recent score
- **Balance 24h:** Average of all scores in the last 24 hours
- **Balance 7d:** Average of all scores in the last 7 days

Averages are calculated client-side from the loaded score history. All three blocks are clickable and navigate to the Codex page.

### Codex (Detail Page)
- Explains how assessment works
- Shows the color scale with thresholds
- Displays a 30-day line chart of score history (Archive)
- Shows component breakdown for a selected score
- Lists the 10 most recent assessments (clickable to view breakdown)
- Links to Mirror

### Mirror (Chatbot Page)
1. User enters a claim.
2. User clicks "Begin Analysis."
3. The claim is sent to `/api/magnifier` with an empty conversation history.
4. The Mirror (Claude with Toulmin prompt) responds with the first question.
5. User responds. Each message is appended to conversation history and sent back to the API.
6. The Mirror guides the user through six Toulmin steps: claim, data, warrant, backing, qualifier, rebuttal.
7. After the final step, the Mirror summarizes clarity strengths and gaps.
8. User can click "New claim" to restart.

## Scoring Model

### Dimensions (0-20 each)

| Dimension | Question |
|-----------|----------|
| Specificity | Are there numbers, dates, names, or concrete details? |
| Evidence | Is data or are sources cited? |
| Assumptions | Are assumptions stated explicitly? |
| Consistency | Are there internal contradictions? |
| Precision | Are appropriate qualifiers used? |

### Color Scale

| Range | Color | Hex |
|-------|-------|-----|
| 0-20 | Red | `#EF4444` |
| 21-40 | Orange | `#F97316` |
| 41-60 | Yellow | `#EAB308` |
| 61-80 | Green | `#22C55E` |
| 81-100 | Blue | `#3B82F6` |

## Toulmin Model (Mirror)

The Mirror uses the Toulmin argumentation model with six elements:

1. **Claim** — What exactly are you claiming?
2. **Data/Grounds** — What evidence supports this?
3. **Warrant** — Why does that evidence support the claim?
4. **Backing** — Why should we trust that warrant?
5. **Qualifier** — How certain are you? What qualifiers apply?
6. **Rebuttal** — What would prove you wrong?

V1 supports Toulmin only. Additional models are planned for V2.

## What is Not Built (V1)

- No URL-based routing (state-based page switching only)
- No password reset flow
- No email verification enforcement
- No server-side auth validation on API routes
- No rate limiting on API endpoints
- No automated tests
- No alternative reasoning models in Mirror
- No export or sharing of scores
