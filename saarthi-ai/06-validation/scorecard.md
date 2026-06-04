# Validation Scorecard

**Phase:** 8 — Validation  
**Project:** saarthi-ai  
**Date:** 2026-05-22

---

## Idea Scorecard

| Dimension | Score (1–10) | Rationale |
|-----------|-------------|-----------|
| Problem severity | **9** | JEE/NEET failure has life-altering consequences for Indian students. Compliance mistakes can kill a startup. Both pains are acute, not hypothetical. |
| Market size | **8** | 5.5M+ exam aspirants, 200K+ early-stage founders. TAM is large. SAM (AI-willing, smartphone-owning, tech-forward) is still >1M. |
| Competitive advantage | **7** | Features are genuinely novel (Socratic Tutor, Mistake DNA, India Stack Navigator). But all are copyable once validated. Moat = execution speed + PYQ data curation (long-term). |
| Feasibility | **8** | Groq free tier + Vercel + Supabase = proven zero-cost stack. Founder has Next.js skills to build. 3-key rotation is solvable. Main risk: Groq terms change. |
| Business model | **6** | Freemium is clear. But India's ₹0 expectation makes conversion hard. No evidence yet of willingness to pay at ₹199/499. |
| Founder-market fit | **6** | Founder has technical skills and lives in the Indian context. Domain depth (exam system knowledge, founder ecosystem experience) is assumed, not evidenced. No customer interviews mentioned. |
| Timing | **9** | AI adoption in India is accelerating. No India-specific AI exam co-pilot exists. The 2024–2026 window is open. Groq free tier makes zero-cost AI tooling uniquely possible right now. |
| **Overall** | **7.6 / 10** | |

---

## Verdict

**CONDITIONAL GO.**

The market gap is real, the timing is right, the technical stack is viable, and the features are genuinely novel. This is not a "me too" product.

**However — proceed conditionally on these validations:**

1. **Talk to 20 students before building more than the Socratic Tutor.** Specifically: "Would you use an AI that asks you questions instead of giving answers? Would you come back to it?" If fewer than 12/20 say yes, the Socratic core hypothesis fails and the whole product needs rethinking.

2. **Talk to 10 founders before building any founder features.** Ask: "What's your biggest compliance headache?" If India Stack Navigator doesn't come up naturally (unprompted), validate that your features match their actual pains.

3. **Build one thing, validate it, then build the next.** The "5 student + 5 founder features" plan is 10 features for a solo developer. That's 18+ months of work. Build Socratic Tutor first. If it gets 500 active users with 30%+ Day-7 retention, build the next feature.

4. **Verify Groq limits with your actual 3 accounts before committing to the architecture.** Free tier terms are not contracts — they can change. The provider abstraction layer is non-negotiable.

**What would make this a straight GO (no conditions):** 15+ of 20 student interviews show high intent to use Socratic Tutor + at least 3 founders say India Stack Navigator solves a real pain + 1 week of Groq load testing with 3 keys confirms the architecture holds.

---

## Anti-Patterns Detected

| Anti-Pattern | Evidence | Recommendation |
|-------------|---------|----------------|
| **Boiling the ocean** | 10 features planned across 2 segments | Build 2 features (S1 + S2), validate, then expand. Sequencing is critical. |
| **Building in stealth** | No customer conversations mentioned in intake | Do 20 student interviews this week before writing any code. |

---

## Flags

**Red Flags:**
- None that would suggest stopping. The idea is sound.

**Yellow Flags:**
- The "zero rupees budget" constraint means zero marketing budget. Every user must come from organic channels. This is achievable but requires community-first thinking, not product-first.
- India's low conversion rates are a structural risk. The ₹199 price point may need to drop to ₹99 after testing.

## Sources
- All `01-discovery/` and `02-strategy/` files
