# Action Plan — First 30 Days

**Project:** saarthi-ai  
**Date:** 2026-05-22  
**Rule:** No code before Week 2. Validate before building.

---

## Week 1 — Customer Discovery (Talk Before You Build)

**Goal:** Confirm the Socratic Tutor and India Stack Navigator are solving real pains people will use.

**Tasks:**

1. **Post in r/JEEPreparation** (Day 1–2): "Building a free AI doubt-clearing tool for JEE/NEET. Would love 10 minutes with serious aspirants to understand what's missing. DM me." Target: 20 responses.
   - Do NOT mention the Socratic concept yet — let them describe their pain first
   - Ask: "When you get a wrong answer, what do you do next?" → listen for "I just look up the answer" vs. "I try to understand why"
   - Ask: "Have you ever used ChatGPT for JEE prep? What worked, what didn't?"

2. **Post in r/indianstartups** (Day 2–3): "Building a free AI tool for early-stage founders. 10 minutes of your time for an honest conversation?" Target: 10 responses.
   - Ask: "What was the most confusing part of your first 90 days?" → listen for compliance/pricing/investors
   - Ask: "Have you ever paid a CA/lawyer for something you later found was free online?"

3. **Run Concierge MVP** (Day 3–7): Pick 5 JEE students from your interviews. Tell them: "For the next 3 days, send me any doubt on WhatsApp. I won't give you the answer — I'll ask you 3 questions that help you find it yourself."
   - You do this manually. No AI. No code.
   - Observe: Do they engage with the questions? Do they get frustrated and demand the answer? Do they thank you when they get there?
   - This is your single most important data point.

**Success signal by end of Week 1:** 15+ student interviews completed, 8+ founder interviews completed, 5 Concierge MVP sessions run. You have a clear gut sense of whether the Socratic method lands.

---

## Week 2 — Setup & Infrastructure (Only If Week 1 Validates)

**Goal:** Build the foundation — not features. Get the boring infrastructure right so you can move fast.

**Tasks:**

1. **Register domain** (Day 8): Get getsaarthi.com (or saarthiai.in as fallback). ₹800 one-time.

2. **Set up accounts** (Day 8–9):
   - 3 Groq accounts (3 different email addresses) — test free tier limits in Groq console
   - Supabase project (1 project for the whole app — students + founders share it)
   - Upstash Redis (free tier — note the 10K commands/day limit)
   - Vercel (connect to GitHub repo)
   - Resend (email)

3. **Create new Next.js project** (Day 9): Fresh repo. No code from Learnova AI. Start clean.
   - Set up Tailwind + shadcn/ui
   - Configure Supabase Auth (Google login + email)
   - Configure PWA manifest
   - Deploy to Vercel (even empty page — establish the deploy pipeline)

4. **Build Groq key rotation** (Day 10–11): The most critical infrastructure piece.
   - Upstash Redis key tracking (see `04-product/feature-prioritization.md` for full Redis schema)
   - API route `/api/ai/query` with key selector + rate limiter
   - Test: simulate 100 requests across all 3 keys, confirm rotation works, confirm Redis tracks correctly
   - Test: exhaust Key 0, confirm Key 1 is selected

5. **Build auth + basic layout** (Day 12–13): Login page, student section shell, founder section shell. No AI features yet.

6. **Set up PostHog** (Day 14): Add analytics before first user. Track: session_start, query_sent, feature_used, day_7_return.

**Success signal by end of Week 2:** Deployed empty app at getsaarthi.com. Groq rotation works and tested. CI/CD pipeline running.

---

## Week 3 — Build Socratic Tutor (First Feature)

**Goal:** Ship the first real feature. Get 20 beta users.

**Tasks:**

1. **Build Socratic Tutor** (Day 15–18):
   - UI: Chat interface, subject selector (Physics / Chemistry / Biology / Maths / General)
   - System prompt (see `04-product/feature-prioritization.md` for exact prompt)
   - Model: `llama-3.1-8b-instant`
   - Hard cap: `max_tokens: 150` per response
   - User rate limit: 10 queries/day (Redis check)
   - Response cache: SHA256(model + system_prompt + user_message) → cache 24h

2. **Add the "Why Socratic?" onboarding** (Day 18): Before first exchange, show 2 sentences: "We ask questions, not give answers. Research shows you remember 3x more when you find the answer yourself. [Start →]"

3. **Build MCQ practice tracker** (Day 19–20): Simple form — paste/type a question, mark correct/wrong, tag subject + chapter. This data feeds Mistake DNA. It doesn't need to be beautiful — it needs to be fast.

4. **Soft launch to 20 people** (Day 20–21): Share the link with the students from your Week 1 interviews. No public announcement yet.
   - Watch PostHog: Are they using it? How many exchanges per session?
   - Message every user after their first session: "How was it? Honest reaction?"

**Success signal by end of Week 3:** 20 beta users active. Average 3+ Socratic exchanges per session. Zero crashes.

---

## Week 4 — Iterate + Go-to-Market Decision

**Goal:** Fix what's broken based on real feedback. Decide if you're ready to go wider.

**Tasks:**

1. **Review PostHog data** (Day 22): 
   - What is the average exchange count per session? (Target: 3+)
   - What percentage of users returned on Day 2? (Target: 30%+)
   - What subjects are most queried? (This tells you what PYQ data to curate first)

2. **Fix the top 3 bugs / UX issues** (Day 22–24): Don't add features. Fix what's annoying beta users.

3. **Add Mistake DNA (basic)** (Day 25–27): Use the MCQ data from Week 3. After 20+ answered questions, generate the weekly report. Test with yourself first.

4. **Go/No-Go decision** (Day 28):
   - If Day-7 retention is 30%+ AND average session has 3+ exchanges → public launch in Week 5
   - If Day-7 retention is <20% AND users are asking for direct answers → pause, interview 5 more users, diagnose the Socratic rejection

5. **Prepare public launch post** (Day 29–30): Write the Reddit post for r/JEEPreparation. Tell the real story:
   - "I've been building a free AI tool for JEE/NEET prep that won't give you the answer. Here's why, and here's the link."
   - Include a real Socratic exchange from beta (screenshot, anonymised)
   - Include the link, say it's free, say feedback is welcome

**Success signal by end of Week 4:** Go/No-Go decision made with real data. If GO: launch post ready. If NO-GO: specific hypothesis revision written down.

---

## 30-Day Summary

| Week | Focus | Key Output |
|------|-------|-----------|
| 1 | Customer discovery | 20 student + 10 founder interviews, 5 Concierge MVP sessions |
| 2 | Infrastructure | New Next.js app, Groq rotation working, deployed to getsaarthi.com |
| 3 | First feature | Socratic Tutor live, 20 beta users |
| 4 | Iterate + decide | Data-driven go/no-go, public launch ready |

**What you must NOT do in the first 30 days:**
- Build more than 2 features
- Write a line of code before Week 2
- Launch publicly before you have data from 20 beta users
- Build the Founder section (comes Month 4 — after the student section has traction)
- Spend any money
