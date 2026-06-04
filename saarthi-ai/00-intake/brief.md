# Intake Brief

**Phase:** 1 — Intake Interview  
**Project:** saarthi-ai  
**Date:** 2026-05-22  
**Confidence:** High (founder-provided, no ambiguity)

---

## The Idea

**Problem:** Indian students and founders lack AI tools designed for their specific context — the Indian exam system, Indian regulatory environment, Indian pricing psychology, and Indian market realities. Every major AI tool is built for Western users. Indian platforms (Byju's, Unacademy, Doubtnut) use video/human delivery, not AI-native. No platform serves both students and founders with a unified AI co-pilot.

**Solution:** A two-sided AI platform — one app, two distinct sections:
1. **Students Section** — AI tools for Class 6 to postgrad, with deep focus on exam prep: JEE, NEET, UPSC, CAT, CLAT, NDA
2. **Founders Section** — AI tools for early-stage Indian founders from idea to first funding round

**Trigger:** Founder is rebuilding from a previous project (Learnova AI) with a cleaner, sharper vision and hard technical constraints that force token efficiency by design.

**Existing work:** Prior Next.js codebase (Learnova AI) — being scrapped entirely. Starting fresh.

---

## The Founder

- **Name:** Salman Memon
- **Background:** Developer with Next.js/React expertise; built and iterated Learnova AI
- **Time commitment:** [Assumption] Full-time or near-full-time; level of urgency suggests primary project
- **Budget:** Zero rupees — hard constraint, not a preference
- **Co-founders:** [Unknown] — assumed solo
- **Unfair advantage:** [Yellow Flag] Not stated explicitly. Domain advantage is technical (can build fast); exam domain expertise and founder network depth are unknown

---

## The Market

**Student audience:**
- Class 6–12: ~250M students in India [Knowledge-Based]
- JEE aspirants: ~1.5M/year [Knowledge-Based]
- NEET aspirants: ~2.2M/year [Knowledge-Based]
- UPSC aspirants: ~1M/year [Knowledge-Based]
- CAT aspirants: ~280K/year [Knowledge-Based]
- CLAT aspirants: ~60K/year [Knowledge-Based]
- NDA aspirants: ~400K/year [Knowledge-Based]

**Founder audience:**
- DPIIT-registered startups: ~100K+ [Knowledge-Based]
- Annual new startup registrations: ~15K–20K [Knowledge-Based]
- Pre-seed/idea-stage founders (informal): ~500K+ [Estimate]

**Geography:** India-first. Hindi belt + English-medium initially; vernacular expansion later.

**Current alternatives:**
- Students: Byju's (declining, toxic brand), PhysicsWallah (video-first), Doubtnut (image Q&A), Unacademy (struggling financially), ChatGPT/Gemini (not India-specific)
- Founders: Startupindia.gov.in (government, clunky), iSPIRT playbooks (static docs), YC resources (US-centric), generic ChatGPT

---

## The Business

**Revenue model:** Freemium (free with query limits, paid for unlimited + advanced features)
**Pricing intent:** [Assumption] ₹199–₹499/month for students, ₹499–₹999/month for founders
**Success at 12 months:** [Assumption] 10,000 active users, product-market fit signal, path to monetization
**Biggest constraint:** Groq API free tier — 3 accounts, ~18,000 requests/day total. Every feature MUST be designed for minimum token usage.

---

## Constraints

- **Tech:** Groq API only (no OpenAI, no Gemini, no Anthropic). 3 keys, free tier.
- **Budget:** Zero rupees — all infrastructure must be on free tiers
- **Stack:** Founder has Next.js expertise — build on that
- **No code phase:** Plan first, code later

---

## Hard Questions Assessment

| Question | Assessment |
|----------|-----------|
| Why are you the right person? | Developer who can build fast + has lived the Indian exam/startup experience [Assumption]. Domain depth TBD. |
| If Google launches this tomorrow? | Focus on India-specific depth Google won't prioritise. Be the specialist. |
| Strongest argument against? | Free tiers will break at scale. Byju's collapse showed ed-tech monetization is brutal in India. |
| Have you talked to potential customers? | [Unknown — not stated] |
| What would make you walk away? | [Unknown] |

---

## Flags

**Red Flags:**
- Founder-market fit is assumed, not evidenced. No customer conversations mentioned.

**Yellow Flags:**
- Free tier limits will become a ceiling. Plan for monetisation before hitting that ceiling.
- "Build for both students and founders" risks neither segment feeling the product is for them.

## Sources
- Founder intake message (primary source)
