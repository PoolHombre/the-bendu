# Project Overview

## What is The Bendu?

The Bendu is a personal clarity evaluation tool. It scores how clearly a user communicates a claim — not whether the claim is true, moral, or popular.

Users submit a claim (a sentence, paragraph, or argument), and The Bendu returns a clarity score (0-100) broken down across five dimensions. Over time, users can track their clarity trends and use a guided reasoning tool to strengthen their arguments.

## Core Principle

> The Bendu does not judge whether the user is correct, morally right, politically correct, or factually complete. It evaluates whether the submitted claim is clear, specific, supported, qualified, internally consistent, and aware of rebuttals.

## What it is not

- Not a fact-checker. It does not verify claims against external sources.
- Not a social platform. There are no profiles, feeds, followers, or public content.
- Not a comparison engine. Users are never scored against each other.
- Not a surveillance tool. It only evaluates text the user explicitly submits.

## Product Modules

| Module | Purpose | Implementation |
|--------|---------|---------------|
| **Assessment** | Score a single claim for clarity | `ScoreDisplay.tsx` + `POST /api/evaluate` |
| **Balance** | Show 24h and 7d trend averages | `ScoreDisplay.tsx` (client-side calculation) |
| **Archive** | 30-day score history with chart | `DetailPage.tsx` + Supabase query |
| **Mirror** | Guided Toulmin reasoning chatbot | `Magnifier.tsx` + `POST /api/magnifier` |
| **Codex** | Scoring explanation and color thresholds | `DetailPage.tsx` (static content) |

## Scoring Dimensions

Each claim is scored on five dimensions (0-20 each, totaling 0-100):

| Dimension | What it measures |
|-----------|-----------------|
| Specificity | Numbers, dates, names, concrete details |
| Evidence | Data or sources cited |
| Assumptions | Whether assumptions are stated explicitly |
| Consistency | Absence of internal contradictions |
| Precision | Use of appropriate qualifiers |

## Color Scale

| Score Range | Color | Hex |
|------------|-------|-----|
| 0-20 | Red | `#EF4444` |
| 21-40 | Orange | `#F97316` |
| 41-60 | Yellow | `#EAB308` |
| 61-80 | Green | `#22C55E` |
| 81-100 | Blue | `#3B82F6` |

## V1 Scope

V1 uses Toulmin argumentation as the only reasoning model in Mirror. Additional models (Aristotelian, Inductive, Abductive, Pragma-Dialectical) are planned for V2 as selectable "Mirror Modes."
