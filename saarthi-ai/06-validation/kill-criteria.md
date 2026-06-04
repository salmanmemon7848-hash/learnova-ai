# Kill Criteria

**Phase:** 8 — Validation  
**Project:** saarthi-ai  
**Date:** 2026-05-22

> These are specific, measurable conditions under which you should stop or pivot. They protect you from sunk-cost thinking.

---

| # | Kill Condition | Measurement | When to Check |
|---|---------------|-------------|--------------|
| 1 | **Socratic method rejection** — Fewer than 12/20 student interview subjects say they'd use an AI that asks questions instead of giving answers | 20 student interviews | Before writing code |
| 2 | **No retention signal** — After 4 weeks of live Socratic Tutor, Day-7 retention is below 20% | Product analytics (PostHog) | Week 4 post-launch |
| 3 | **Founder pain mismatch** — Fewer than 6/10 founder interviews name compliance or pricing as a top-3 pain point | 10 founder interviews | Before building founder section |
| 4 | **Groq architecture collapses** — 3 keys together can't handle 200 DAU without users seeing "AI busy" more than 10% of the time | Load testing | Before public launch |
| 5 | **No conversion at all** — After 60 days with a paywall live, zero paid users among 1,000+ free users | Revenue dashboard | Day 60 post-paywall |
| 6 | **Competitive copy** — PhysicsWallah or Doubtnut launches an AI Socratic tutor feature with their existing distribution | Market monitoring | Ongoing |
| 7 | **Groq free tier eliminated** — Groq announces paid-only API with no free tier | Groq announcements | Ongoing |

---

## What to Do If a Kill Criterion Is Hit

- **Criteria 1–3 (pre-build):** Pause. Do not write code. Pivot the feature hypothesis. Go back to 10 more customer interviews with revised assumptions.
- **Criteria 4 (architecture):** Redesign key rotation, add aggressive caching, consider provider swap (Together AI, Cerebras also offer free/cheap inference).
- **Criterion 5 (no conversion):** Drop price to ₹99/month for 30 days and test. If still zero conversion, the free tier may be too generous — make it more restrictive (5 queries/day instead of 10).
- **Criterion 6 (competitive copy):** Move up the stack — deeper India data, Vernacular AI, voice features. PW has distribution; Saarthi must have depth.
- **Criterion 7 (Groq terms change):** Activate provider abstraction layer immediately. Together AI, Cerebras, and Cloudflare AI Workers all offer free/low-cost LLM inference as alternatives.
