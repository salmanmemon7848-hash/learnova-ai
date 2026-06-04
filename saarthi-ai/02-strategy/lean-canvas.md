# Lean Canvas

**Phase:** 4 — Strategy  
**Project:** saarthi-ai  
**Date:** 2026-05-22  
**Confidence:** Medium

---

## Lean Canvas — Saarthi AI

### Problem (Top 3)

**Students:**
1. Students can't get instant, concept-level explanations for wrong answers — video platforms give answers but don't build understanding
2. No platform diagnoses *why* a student keeps making the same mistake type (conceptual gap vs. calculation error vs. reading error)
3. Exam anxiety and psychological preparation are completely ignored by every Indian EdTech platform

**Founders:**
1. India's regulatory and compliance landscape (GST, MCA, DPIIT, FEMA) is opaque — founders learn by making expensive mistakes
2. No AI tool gives India-specific pricing recommendations — founders either copy US pricing or underprice destructively
3. Indian investor preferences are undocumented and inaccessible — founders pitch blind

---

### Customer Segments

**Primary (launch):** Competitive exam aspirants — JEE/NEET/UPSC/CAT/CLAT/NDA — aged 15–26, smartphone-only users, Tier 1–3 cities

**Secondary (Month 3+):** Early-stage Indian founders — pre-seed to seed stage — aged 22–35, primarily metro + Tier 1

---

### Unique Value Proposition

**Students:** "The AI tutor that makes you think, not just copy answers — designed for India's hardest exams."

**Founders:** "Your AI co-pilot for navigating India's startup system — compliance, pricing, investors, pitch."

**Combined one-liner:** "Saarthi — India's AI guide for the two biggest journeys: cracking the exam, building the company."

---

### Solution

**5 Student Features (novel, token-efficient):**
1. **Mistake DNA** — Weekly AI analysis of error patterns across your practice sessions. Tells you not just what was wrong but why you keep making that mistake type.
2. **Concept Graph** — Static knowledge graph of exam syllabus; AI guides you to prerequisite concepts when you're stuck. DB-heavy, token-light.
3. **Socratic Tutor** — AI that never gives the answer. Asks 3 guiding questions to make you arrive at it yourself. Proven to improve retention 2–3x.
4. **PYQ Pattern Predictor** — AI analysis of 10–15 years of past papers to predict high-probability topics for this year's exam. Runs quarterly, results cached.
5. **Exam Psychology Coach** — Daily 2-minute mental prep check-in. Manages anxiety, builds confidence. 50-word output per session — the most token-efficient feature on the platform.

**5 Founder Features (novel, token-efficient):**
1. **India Stack Navigator** — Input your company type + revenue stage → get a complete compliance checklist with deadlines. DB-driven rules, AI only formats.
2. **Bharat Pricing Engine** — Input your product, target market, B2C/B2B → AI gives India-specific pricing tiers with rationale. Understands Tier 2/3 WTP.
3. **Investor Match** — 200+ curated Indian investors tagged by sector/stage/cheque size. AI matches your brief to top 10 investors with reasoning.
4. **Pitch Roast** — Paste your pitch deck content → AI tears it apart from the lens of an Indian angel investor. Runs async, not real-time.
5. **0 to GST** — Input company type → get a personalised 7-day launch roadmap (registration → bank → GST → payment gateway → first customer).

---

### Channels

- SEO (Indian exam keywords are high-volume, medium-competition)
- WhatsApp/Telegram — share a result, viral loop
- Reddit (r/JEEPreparation, r/UPSC, r/indianstartups)
- YouTube shorts — "The AI that won't give you the answer" concept is shareable
- Founder Twitter/X communities
- ProductHunt (launch)

---

### Revenue Streams

**Phase 1 (Month 1–6):** Free only. Build user base.  
**Phase 2 (Month 7+):** Freemium
- Free: 10 AI queries/day, basic features
- Student Pro: ₹199/month — unlimited queries + Mistake DNA + PYQ Predictor
- Founder Pro: ₹499/month — unlimited + all 5 founder features
- Student Annual: ₹1,499/year (save ₹889)

**Later:**
- Institutional: ₹20,000–₹50,000/year for coaching institutes
- API access for EdTech integrations

---

### Cost Structure

**Current (Year 1):** ₹0/month
- Groq: Free (3 accounts)
- Vercel: Free tier (100GB bandwidth)
- Supabase: Free tier (500MB, 2 projects)
- Upstash Redis: Free (10K commands/day)
- Domain: ~₹800/year

**Scale triggers (when free tiers break):**
- Vercel Pro: $20/month at >100GB bandwidth (~5,000+ active users)
- Supabase Pro: $25/month at >500MB data (~50,000+ users with history)
- Upstash Pro: $10/month at >10K Redis commands/day

---

### Key Metrics

- Daily Active Users (DAU)
- AI queries per session (target: 5–10)
- Day-7 retention (target: 40%+)
- Free → Paid conversion rate (target: 2–5%)
- Groq tokens used per user per day (target: <500 tokens)

---

### Unfair Advantage

1. **Technical:** Groq's speed + small model selection + response caching = real-time AI tutoring at literally zero marginal cost at current scale
2. **Design:** Token-efficiency is a product design philosophy — every feature is built to use the minimum AI needed
3. **Content:** PYQ Pattern Predictor requires 10+ years of paper data curation — defensible moat once built
4. **Network:** If student community features are added later, WhatsApp-native sharing creates viral loops

---

## Flags

**Red Flags:**
- No unfair advantage in brand or distribution yet. Early moat is execution speed + feature uniqueness — both are copyable once validated.

**Yellow Flags:**
- Revenue depends on free tier converting. India's ₹0 preference is real. Design the free experience to demonstrate clear value before the paywall.

## Sources
- See `01-discovery/` files for all underlying research
