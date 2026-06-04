# MVP Definition

**Phase:** 6 — Product  
**Project:** saarthi-ai  
**Date:** 2026-05-22  
**Confidence:** High

---

## Core Hypothesis

**Student MVP:** "Indian competitive exam aspirants who use Saarthi's Socratic Tutor for doubt clearing will return the next day and recommend it to a friend — because it builds real understanding, not dependence."

**Founder MVP (Month 4):** "Indian early-stage founders who use India Stack Navigator will complete the compliance checklist and tell another founder about it — because it saves them ₹10,000+ in professional fees."

---

## Student MVP — Must-Have Features (Month 1–2)

### Feature 1: Socratic Tutor
**What it does:** Student types a question (any JEE/NEET/UPSC topic). AI responds with 3 guiding questions that lead them to the answer themselves. After 3 exchanges, if still stuck, AI shows a hint (not the full answer). After 5 exchanges, shows the answer with explanation.

**Why it's first:** It's the most novel, most shareable, and tests our core hypothesis about Socratic learning. It's also the most token-efficient — short exchanges, no long answer generation.

**Token budget:** ~400 tokens per session (200 input, 200 output across 3 exchanges)  
**Model:** `llama-3.1-8b-instant`

---

### Feature 2: Mistake DNA
**What it does:** Student answers MCQ practice questions (stored in DB). After 20+ questions, the system categorises wrong answers into error types: conceptual gap, calculation error, reading error, formula forgotten. Weekly report: "You make 68% of your errors in organic chemistry, and 80% of those are substitution/elimination confusion — same mistake, different questions."

**Why it's second:** It requires data to be useful, so it naturally grows with usage. Creates habit loops ("come back to see your weekly report").

**Token budget:** ~300 tokens per weekly report (AI only generates the narrative summary; categorisation is DB logic)  
**Model:** `llama-3.1-8b-instant`  
**Key design:** 80% of the work is SQL queries and categorisation rules in DB. AI writes the summary paragraph.

---

## Student MVP — Must-Have Infrastructure

- **Auth:** Supabase Auth (email or Google login)
- **Session history:** Every Socratic exchange stored in Supabase (enables Mistake DNA)
- **Rate limiting:** Upstash Redis — max 10 AI calls/day per free user
- **Groq key rotation:** Redis-backed, round-robin with token bucket per key (see 04-product/feature-prioritization.md for architecture)
- **PWA:** Manifest + service worker for Android install prompt

---

## Student MVP — Nice to Have (Month 3, Not v1.0)

- Concept Graph (requires knowledge graph DB build — medium effort)
- PYQ Pattern Predictor (requires PYQ data curation — high effort)
- Exam Psychology Coach (low effort, add in Month 3)
- Vernacular / Hindi input
- Voice input

---

## Student MVP — Explicitly Out of Scope (v1.0)

- Live tutoring / human teachers
- Video content
- Community / peer features
- Gamification / streaks (Duolingo-style)
- Parent dashboard
- Notifications / push alerts
- Payment integration (add in Month 7+)

---

## Founder MVP — Must-Have Features (Month 4)

### Feature 3: India Stack Navigator
**What it does:** Founder selects company type (Pvt Ltd / LLP / Sole Proprietor) + revenue stage (₹0, <₹20L, ₹20L–₹1Cr, >₹1Cr) + presence of foreign investment (yes/no). System returns a formatted compliance checklist with:
- Mandatory registrations (MCA, DPIIT, GST, etc.)
- Deadlines
- Cost estimates
- Links to official portals

**Token budget:** ~500 tokens per call  
**Model:** `llama-3.1-8b-instant`  
**Key design:** Rules are hardcoded in DB. AI formats and personalises the output language. No AI needed for the actual rules — just for natural language output.

### Feature 4: 0 to GST
**What it does:** Founder selects business type → gets a personalised 7-day step-by-step launch roadmap. Each day has 1–3 specific actions (e.g., "Day 2: File SPICe+ form on mca.gov.in — takes 20 min, costs ₹0").

**Token budget:** ~600 tokens per call  
**Model:** `llama-3.1-8b-instant`

---

## Student MVP Success Criteria

The MVP is validated when:
- 500 registered users within 4 weeks of launch
- 30%+ Day-7 retention
- Average 3+ Socratic exchanges per session (users are engaging, not bouncing)
- 10+ unprompted social shares / recommendations (qualitative signal)
- No user says "just give me the answer" more than 20% of the time (measures Socratic acceptance)

---

## Flags

**Red Flags:**
- None

**Yellow Flags:**
- Mistake DNA is only useful after 20+ practice questions. For new users, it feels empty. Show a "come back after 20 questions" message clearly rather than showing an empty dashboard.
- The Socratic method will frustrate some users initially. The first-session UX must explain why the AI doesn't give answers — frame it as a feature before they hit it.

## Sources
- `01-discovery/target-audience.md`, `02-strategy/lean-canvas.md`
