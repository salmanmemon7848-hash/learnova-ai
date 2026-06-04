# Saarthi AI — Executive Summary

**Project:** saarthi-ai  
**Date:** 2026-05-22  
**Status:** Plan complete. Ready for validation phase.

---

## What Is Saarthi?

Saarthi is a two-sided AI platform for India's two biggest journeys: cracking a competitive exam and building a startup. It serves Indian students (Class 6 to postgrad, all major exams) and early-stage Indian founders (idea to funded) in a single PWA-first application.

**Hard constraint:** Groq API free tier only (3 accounts rotated). Zero rupees budget. Every feature is designed to use the minimum tokens necessary.

**The brand:** Saarthi (सारथी) — the Sanskrit word for "charioteer/guide." As Krishna was Arjuna's guide before battle, Saarthi guides students and founders through their hardest challenges. It is distinctly Indian, historically rich, and naturally bilingual.

---

## Key Research Findings

- 5.5M+ Indian students take major competitive exams annually [JEE, NEET, UPSC, CAT, CLAT, NDA]
- 200K+ early-stage founders are actively building startups in India
- **The competitive gap is real:** No AI-native, India-specific exam prep tool exists. Founder AI tools for India are entirely absent.
- **Timing is ideal:** AI adoption accelerating, no incumbent owns the AI EdTech space in India, Groq's free tier makes zero-cost real-time AI tutoring possible right now.
- **The biggest risk:** Indian users' ₹0 preference for digital products. Conversion to paid will be slow. Plan for 6 months of free users before meaningful revenue.

---

## Strategic Positioning

**Category:** AI co-pilot (not EdTech platform, not AI chatbot)  
**Position:** High AI intelligence × India-specific — a quadrant currently unoccupied  
**Tagline:** "The AI that teaches you to think — not just to copy answers."  
**Domain:** getsaarthi.com (recommended)

---

## The 10 Novel Features

### 5 Student Features (none exist on any Indian platform)

| # | Feature | What It Does | Token Cost | Model |
|---|---------|-------------|-----------|-------|
| S1 | **Socratic Tutor** | Asks 3 guiding questions instead of giving the answer. Forces real understanding. | ~400/session | `llama-3.1-8b-instant` |
| S2 | **Mistake DNA** | Analyses your error patterns across practice sessions. Weekly report: "You make 68% of errors in organic chemistry, always the same mistake type." | ~300/week | `llama-3.1-8b-instant` |
| S3 | **Concept Graph** | Finds the prerequisite concepts you're missing when you're stuck. DB-heavy, AI formats. | ~150/call | `llama-3.2-3b-preview` |
| S4 | **PYQ Pattern Predictor** | Analyses 10-15 years of past papers to predict this year's high-probability topics. Runs quarterly, results cached for all users. | ~800/quarter total | `llama-3.3-70b-versatile` |
| S5 | **Exam Psychology Coach** | Daily 2-minute mental check-in. Manages anxiety, builds confidence. 50-word output. Most token-efficient feature on the platform. | ~100/day | `llama-3.2-3b-preview` |

### 5 Founder Features (none exist on any Indian platform)

| # | Feature | What It Does | Token Cost | Model |
|---|---------|-------------|-----------|-------|
| F1 | **India Stack Navigator** | Input company type + revenue → get full compliance checklist with deadlines. DB rules, AI formats. | ~500/call | `llama-3.1-8b-instant` |
| F2 | **Bharat Pricing Engine** | India-specific pricing recommendations. Understands Tier 2/3 WTP, Jio effect, GST implications. | ~600/call | `gemma2-9b-it` |
| F3 | **Investor Match** | 200+ curated Indian investors. AI matches your 30-word brief to top 10 with reasoning. DB does matching, AI writes explanations. | ~200/call | `llama-3.2-3b-preview` |
| F4 | **Pitch Roast** | Brutal honest feedback from Indian angel investor lens. Async, rate-limited to 3/month per user. | ~1,200/call | `llama-3.3-70b-versatile` |
| F5 | **0 to GST** | Personalised 7-day launch roadmap: company registration → bank → GST → first customer. Specific URLs, costs, times. | ~600/call | `llama-3.1-8b-instant` |

---

## Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| **Frontend** | Next.js 15 (App Router) + Tailwind CSS + shadcn/ui | Founder already knows it; serverless-native |
| **PWA** | next-pwa or custom service worker | Mobile install on Android — critical for India |
| **Database** | Supabase (PostgreSQL + Auth + Storage + pgvector) | Free tier covers 50K users; one service for everything |
| **Cache / Rate limit** | Upstash Redis | Groq key rotation state + response caching + per-user rate limits |
| **AI** | Groq API (3 accounts, key rotation) | Free, fast (500+ tokens/sec), adequate quality on 8B models |
| **Hosting** | Vercel (free tier) | Next.js native, serverless functions, 100GB bandwidth |
| **Email** | Resend (free: 3K/month) | Clean API, generous free tier |
| **Analytics** | PostHog (free: 1M events) | Product analytics for retention tracking |

**Total Year 1 cost: ~₹800 (domain only)**

---

## Groq Key Rotation Architecture (Summary)

```
Request → Auth + User Rate Limit (Redis) → Key Selector (Redis) → Groq API
                                                 ↓
                              Select least-used key with remaining quota
                              Cache response for 24h (repeat queries = zero Groq calls)
                              If all keys exhausted → queue or return "busy"
```

- 3 keys = ~18,000 requests/day total
- Supports ~1,800 DAU at 10 queries/day each
- Response caching reduces effective Groq calls by 20–40%

---

## Financial Summary

- **Year 1 cost:** ~₹800
- **Revenue start:** Month 7 (after paywall introduction)
- **Month 12 MRR (base case):** ~₹1,43,680
- **Break-even:** Before first paid user (costs are zero)
- **Free tier scale limit:** ~1,800 DAU (Groq) / ~5,000 DAU (Vercel) / ~50,000 registered (Supabase)

---

## Top 3 Risks and Mitigations

| Risk | Severity | Mitigation |
|------|----------|-----------|
| **Groq free tier changes** | High | Build provider abstraction layer from Day 1. Alternatives: Together AI, Cerebras, Cloudflare AI Workers. |
| **India's ₹0 preference kills conversion** | High | Make free tier genuinely valuable (10 queries/day). Price ₹199 as "less than one coaching class." Test ₹99 if needed. |
| **Indian students reject Socratic method** | Medium | Validate with Concierge MVP (manual Socratic via WhatsApp) BEFORE building. 10 students, 1 week. |

---

## Confidence Summary

| Area | Confidence | Status |
|------|------------|--------|
| Market size | Medium | Verify with current NASSCOM/NTA data |
| Competitive gap | High | Confirmed — no AI-native India exam prep exists |
| Groq architecture | High | Test with actual accounts before full build |
| Student willingness to use Socratic method | Low | Must validate with interviews |
| Conversion at ₹199 | Low | Must validate post-launch |

---

## Anti-Patterns Detected

1. **Boiling the ocean:** 10 features is an 18-month roadmap for a solo developer. Build S1 + S2 first. Get 500 users. Then build the next feature.
2. **Building in stealth:** No customer conversations mentioned. Do 20 student interviews before writing code for anything beyond the landing page.

---

## Document Index

| Document | Path |
|----------|------|
| Intake Brief | `00-intake/brief.md` |
| Brainstorm | `00-intake/brainstorm.md` |
| Market Analysis | `01-discovery/market-analysis.md` |
| Competitor Landscape | `01-discovery/competitor-landscape.md` |
| Target Audience | `01-discovery/target-audience.md` |
| Industry Trends | `01-discovery/industry-trends.md` |
| Confidence Dashboard | `01-discovery/confidence-dashboard.md` |
| Research Gate | `01-discovery/research-gate.md` |
| Lean Canvas | `02-strategy/lean-canvas.md` |
| Positioning | `02-strategy/positioning.md` |
| Go-to-Market | `02-strategy/go-to-market.md` |
| Mission / Vision / Values | `03-brand/mission-vision-values.md` |
| Tone of Voice | `03-brand/tone-of-voice.md` |
| MVP Definition | `04-product/mvp-definition.md` |
| Feature Prioritization + Groq Architecture | `04-product/feature-prioritization.md` |
| User Journey | `04-product/user-journey.md` |
| Revenue Model | `05-financial/revenue-model.md` |
| Cost Structure | `05-financial/cost-structure.md` |
| Validation Playbook | `06-validation/validation-playbook.md` |
| Kill Criteria | `06-validation/kill-criteria.md` |
| Scorecard | `06-validation/scorecard.md` |
| Action Plan | `action-plan-30-days.md` |
