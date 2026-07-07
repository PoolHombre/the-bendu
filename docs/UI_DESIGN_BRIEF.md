# The Bendu — UI Design Brief

## Product Purpose

The Bendu is a personal clarity evaluation system. Users submit a claim, post, or message and receive a structured score for how clearly it communicates — not whether it's true, moral, or popular.

The system evaluates five dimensions of communication clarity: specificity, evidence, assumptions, consistency, and precision. A guided chatbot (Mirror) walks users through the Toulmin argumentation model to strengthen their reasoning.

This is a private, reflective tool. There is no social layer, no public content, no leaderboard.

---

## Core User Flow

1. **Sign in** — Email/password authentication.
2. **Submit a claim** — User pastes or types a post, message, or statement into a textarea.
3. **Receive an Assessment** — The system returns a clarity score (0-100) with a color, component breakdown, and written explanation.
4. **View three score blocks** — The home screen shows three color-coded blocks side by side:
   - **Assessment** — The most recent score
   - **Balance 24h** — Average of all scores in the last 24 hours
   - **Balance 7d** — Average of all scores in the last 7 days
5. **Open the Codex** — Clicking any block navigates to a detail page with scoring rules, color thresholds, a 30-day history chart (Archive), and component breakdown for a selected score.
6. **Use the Mirror** — From the Codex page, user opens Mirror, a Toulmin-guided chatbot that walks through their claim step by step.

---

## Core Modules

| Module | Purpose | Where it appears |
|--------|---------|-----------------|
| **Assessment** | Clarity score for a single submitted claim. Includes total score, five component scores, color indicator, and written explanation. | Home screen (input + result) |
| **Balance** | Trend averages. Shows how clarity tracks over 24 hours and 7 days. | Home screen (two of the three blocks) |
| **Archive** | 30-day score history. Line chart plus a scrollable list of recent assessments. | Codex page |
| **Mirror** | Guided reasoning chatbot. Uses the Toulmin model to walk through a claim one question at a time. | Separate chat page |
| **Codex** | Explanation and reference. How scoring works, color thresholds, and a link to Mirror. | Detail page |

---

## Data Displayed

The UI must represent the following data points:

### Assessment Result
| Field | Type | Example |
|-------|------|---------|
| `score` | Integer 0-100 | `72` |
| `color` | String | `"Green"` |
| `color_hex` | String | `"#22C55E"` |
| `components.specificity` | Integer 0-20 | `15` |
| `components.evidence` | Integer 0-20 | `12` |
| `components.assumptions` | Integer 0-20 | `16` |
| `components.consistency` | Integer 0-20 | `18` |
| `components.precision` | Integer 0-20 | `11` |
| `explanation` | String (1-3 sentences) | `"The claim provides specific dates..."` |
| `post_text` | String (user's original claim) | `"Our Q3 revenue grew 12%..."` |
| `created_at` | ISO timestamp | `"2026-07-06T14:30:00Z"` |

### Balance
| Field | Type | Notes |
|-------|------|-------|
| 24h average score | Integer 0-100 | Calculated client-side from recent scores |
| 7d average score | Integer 0-100 | Calculated client-side from recent scores |
| Average color | Derived from average score | Same threshold mapping |

### Archive
| Field | Type | Notes |
|-------|------|-------|
| Score history | Array of scores | Up to 30 days, ordered by date |
| Each entry | `{date, score, color_hex, post_text}` | Rendered as line chart + selectable list |

### Mirror Conversation
| Field | Type | Notes |
|-------|------|-------|
| Original claim | String | Pinned at top of conversation |
| Messages | Array of `{role, content}` | Alternating assistant/user messages |

---

## Color Thresholds

These colors are central to the visual identity. Every score maps to exactly one color.

| Range | Name | Hex | Meaning |
|-------|------|-----|---------|
| 0-20 | Red | `#EF4444` | Very low clarity |
| 21-40 | Orange | `#F97316` | Low clarity |
| 41-60 | Yellow | `#EAB308` | Moderate clarity |
| 61-80 | Green | `#22C55E` | Good clarity |
| 81-100 | Blue | `#3B82F6` | Excellent clarity |

The designer may refine these hex values for the final palette, but the five-tier Red-Orange-Yellow-Green-Blue scale and the thresholds should be preserved.

---

## Design Goals

### The UI should feel:
- **Calm** — This is a reflective tool, not a productivity dashboard. No urgency, no notifications, no streaks.
- **Reflective** — The user is looking inward at their own communication. The interface should encourage contemplation, not speed.
- **Disciplined** — Clean structure, clear hierarchy, deliberate use of space. Nothing decorative.
- **Private** — This is a personal tool. The UI should feel like a journal, not a social platform.
- **Thoughtful** — Typography and layout should communicate care and precision.
- **Subtly inspired by Star Wars' Bendu character** — The concept of balance, the middle path, wisdom without allegiance. No copyrighted imagery, logos, or direct references. Think tone and philosophy, not fan art.

### Avoid:
- **Gamification** — No points, badges, streaks, confetti, or "level up" language. This is not Duolingo for arguments.
- **Social scoring language** — No "how you compare," no percentile rankings, no public profiles.
- **Harsh judgment** — The language and visual tone should guide, not condemn. A Red score is an opportunity for clarity, not a failure.
- **"Truth detector" framing** — The Bendu does not detect lies or verify facts. Nothing in the UI should suggest it does.
- **Cluttered dashboards** — Minimal data density. One thing at a time. Breathing room.

---

## Visual Metaphor

The Bendu draws on themes of:

- **Balance** — The three score blocks represent the balance between a single moment and longer trends. The overall system weighs multiple dimensions rather than reducing to pass/fail.
- **The middle path** — Neutral tone. The tool is neither praising nor punishing. It observes.
- **Mirror/reflection** — The Mirror chatbot reflects the user's reasoning back to them. The whole system is a mirror for how you communicate.
- **Archive/codex** — Knowledge organized and preserved. The history and explanation pages are a personal reference, not a feed.
- **Signal clarity** — Like tuning a radio: the score measures how clearly the signal comes through, not whether you agree with what's being said.
- **Quiet judgment** — The assessment happens, the result appears, and the user decides what to do with it. No alerts, no push.

---

## Current Implementation Notes

### Pages and Components

| Component | File | Purpose |
|-----------|------|---------|
| `App` | `src/App.tsx` | Root. Manages auth session and page state. |
| `Auth` | `src/components/Auth.tsx` | Login/signup form. Centered, minimal. |
| `ScoreDisplay` | `src/components/ScoreDisplay.tsx` | Home page. Textarea for input, three score blocks, assessment result card. |
| `ScoreBlock` | (inline in ScoreDisplay) | Single score block: label, number, color dot. |
| `DetailPage` | `src/components/DetailPage.tsx` | Codex + Archive. Scoring explanation, color legend, 30-day line chart, recent assessments list, component breakdown. |
| `Magnifier` | `src/components/Magnifier.tsx` | Mirror chatbot. Claim input, then turn-by-turn conversation. |

### Routing

State-based, not URL-based. `App.tsx` holds a `page` state (`'home' | 'detail' | 'magnifier'`). Components navigate by calling setter callbacks (`onNavigateDetail`, `onBack`, `onMagnifier`).

### API Data Shapes

**POST /api/evaluate** returns:
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

**POST /api/magnifier** returns:
```json
{
  "response": "Thank you for stating your claim. Now, what evidence supports this?"
}
```

**Supabase clarity_scores row** (used for history/archive):
```json
{
  "id": "uuid",
  "user_id": "uuid",
  "post_text": "Our Q3 revenue grew 12%...",
  "score": 72,
  "color": "Green",
  "color_hex": "#22C55E",
  "component_scores": { "specificity": 15, "evidence": 12, ... },
  "explanation": "...",
  "created_at": "2026-07-06T14:30:00Z"
}
```

### UI States

| State | What the user sees |
|-------|--------------------|
| **Unauthenticated** | Auth form (sign in / sign up toggle) |
| **Loading (session check)** | "Loading..." text |
| **Home — no history** | Textarea, three score blocks showing "—" |
| **Home — has history** | Textarea, three score blocks with numbers and colors |
| **Assessment loading** | Button text changes to "Assessing..." |
| **Assessment result** | Score card appears below the three blocks with number, color dot, explanation, and five component bars |
| **Codex — no history** | Explanation text, empty chart ("No scores yet."), no recent assessments list |
| **Codex — has history** | Explanation, line chart, clickable recent assessments list, component breakdown for selected score |
| **Mirror — claim entry** | Textarea + "Begin Analysis" button |
| **Mirror — conversation** | Pinned claim bar, scrollable message list (alternating Mirror/You), text input + Send |
| **Mirror — loading** | "Thinking..." indicator in message area |
| **Error** | Browser alert (Assessment failed) or inline error message (auth) |

### Current Styling

All styling is inline `React.CSSProperties`. No CSS framework, no design system, no theme. Font is `system-ui, sans-serif`. Colors are the five-tier scale plus `#3B82F6` as the action/button color and grays for text/borders. Layout is single-column, max-width 600-700px, centered.

---

## Screens and Components Needed

Design coverage requested for:

### 1. Auth Screen
- Sign in state (email + password + submit)
- Sign up state (same fields, different button label)
- Error state (inline message below inputs)
- Loading state (button disabled)

### 2. Main Assessment Screen (Home)
- Textarea for claim input
- "Assess Clarity" button with loading state
- Three score blocks in a row (Assessment, Balance 24h, Balance 7d)
- Assessment result card (score, color, explanation, five component bars)
- Empty state (no scores yet — blocks show "—")

### 3. Three-Block Score Display
- Each block: label, large number, color indicator
- Empty state: "—" instead of number, neutral/gray indicator
- Clickable (navigates to Codex)

### 4. Assessment Detail Card
- Score number with color indicator
- Explanation text
- Five component bars (specificity, evidence, assumptions, consistency, precision) each 0-20
- Original claim text (truncated with expand?)

### 5. Codex / Archive Page
- "How Assessment Works" explanation section
- Color legend (five colors with labels and ranges)
- 30-day line chart (score over time)
- Recent assessments list (clickable, shows score + truncated claim + color stripe)
- Component breakdown for selected assessment
- "Open Mirror" action

### 6. Mirror Chatbot
- Claim entry state (textarea + button)
- Active conversation state:
  - Pinned claim bar at top
  - Scrollable message thread (Mirror messages vs user messages, visually distinct)
  - Text input + Send button
  - "Thinking..." indicator
  - "New claim" restart action
- Toulmin step indicator (optional — shows which of the 6 steps the conversation is on)

### 7. Empty States
- Home with no scores: welcoming, not barren
- Codex with no history: explain what will appear here after assessments
- Mirror before claim entry: brief explanation of what Mirror does

### 8. Loading States
- Session loading (app startup)
- Assessment in progress
- Mirror thinking

### 9. Error States
- Auth error (wrong password, account exists, etc.)
- Assessment failure (API error)
- Mirror failure (API error)

### 10. Mobile Layout
- All screens should work at 375px width
- Score blocks may need to stack vertically or use a 2+1 grid
- Mirror chat should fill available height
- Textarea should be comfortable to type in on mobile

### 11. Header / Navigation
- App title ("The Bendu") — clickable, returns to home
- User email display
- Sign out action
- Current page context (which module is active)

---

## Technical Constraints

- **Framework:** React 19 + TypeScript + Vite. Design must be implementable as standard React components.
- **Auth:** Supabase Auth. Email/password only in V1. The designer does not need to design OAuth flows.
- **API:** Three existing endpoints (`/api/evaluate`, `/api/history`, `/api/magnifier`). Data shapes are fixed.
- **Charts:** Currently using Recharts for the 30-day line chart. Open to replacing with a different library if the design calls for it, but the chart must render from the same data shape.
- **Routing:** Currently state-based. Can move to URL-based routing (React Router is already installed) if the design benefits from it.
- **No external assets:** Vercel CSP restricts external fonts and CDN resources. Fonts should be system fonts or self-hosted.
- **No CSS framework currently installed.** Open to adding Tailwind, CSS Modules, or similar if the design warrants it.

---

## Open Questions for Design

1. **Score animation** — Should the score reveal with an animation (count up, color fade in), or appear instantly? Animation could add a moment of reflection but risks feeling gamified.

2. **Component score visualization** — Currently horizontal bars. Would a radar/spider chart, circular gauges, or another format better communicate five dimensions of equal weight?

3. **Dark mode** — The calm/reflective tone might suit a dark theme. Should the default be dark, light, or user-selectable?

4. **Toulmin step indicator in Mirror** — The chatbot follows a 6-step sequence (claim, data, warrant, backing, qualifier, rebuttal). Should the UI show progress through these steps, or let the conversation flow naturally without a visible tracker?

5. **Score history density** — The line chart shows 30 days. If a user submits 10 claims a day, the chart gets dense. Should it aggregate by day (daily average) or show every individual score?

6. **Claim text display** — Claims can be short (one sentence) or long (a paragraph). How should long claims be handled in the assessment card and the recent assessments list? Truncation + expand? Fixed-height scroll?

7. **Navigation model** — Currently three pages with back buttons. Would a persistent sidebar, tabs, or bottom nav better serve the module structure (Assessment, Codex, Mirror)?

8. **Branding depth** — How far to take the Bendu/Star Wars-inspired tone? Subtle (color palette and typography choices that evoke calm wisdom) vs. overt (atmospheric backgrounds, monastic visual language)?

9. **Future connector context** — The long-term vision includes connectors to Slack, Gmail, Teams, etc. Should the V1 design leave room for a "source" indicator on scores (e.g., which app a claim came from), or is that a V2 design concern?

10. **Onboarding** — Should there be a first-run experience explaining the modules and scoring model, or should the Codex page serve that purpose?
