# Confidence Dashboard

**Phase:** 3 — Market Research  
**Project:** saarthi-ai  
**Date:** 2026-05-22

> All research conducted in Knowledge-Based mode (no live web search). Confidence ratings reflect this. Verify critical claims before major decisions.

---

## Claim-by-Claim Confidence

| Claim | Source Tier | Corroborating Sources | Confidence | Data Age | Action |
|-------|-------------|----------------------|------------|----------|--------|
| Indian EdTech market ~$7.5B | Tier 2 (RedSeer estimate) | 2 | Medium | 2024 | Acceptable for positioning |
| JEE aspirants ~1.5M/year | Tier 1 (NTA official) | 3 | High | 2024 | Use confidently |
| NEET aspirants ~2.2M/year | Tier 1 (NTA official) | 3 | High | 2024 | Use confidently |
| UPSC aspirants ~1M/year | Tier 2 (press reports) | 2 | Medium | 2023 | Acceptable |
| India AI market 40%+ YoY growth | Tier 2 (multiple analyst) | 2 | Medium | 2024 | Acceptable |
| Groq free tier limits (6K req/day, 14.4K TPM) | Tier 1 (Groq docs) | 1 | High | 2025 | Verify against current Groq console |
| PhysicsWallah ~10M paid users | Tier 2 (media reports) | 2 | Medium | 2024 | Indicative only |
| DPIIT-registered startups ~115K | Tier 1 (Startupindia.gov.in) | 1 | High | 2024 | Use confidently |
| India AI Mission ₹10,372 crore | Tier 1 (Budget docs) | 1 | High | 2024-25 | Use confidently |
| India smartphone users ~700M | Tier 1 (TRAI) | 2 | High | 2024 | Use confidently |
| India UPI transaction comfort | Tier 2 (NPCI data) | 2 | High | 2024 | Use confidently |
| Byju's user exodus after collapse | Tier 2 (press) | 3 | Medium | 2023-24 | Indicative |
| LLaMA 3.1 8B near-GPT-3.5 quality | Tier 1 (Meta benchmarks) | 2 | Medium | 2024 | Test on actual tasks |

---

## What We Know vs. What We're Guessing

### High Confidence (act on this)
- Exam aspirant volume (JEE/NEET are official NTA numbers)
- Groq API capabilities (test it yourself)
- Indian startup registration numbers
- Mobile-first constraint is real

### Medium Confidence (use directionally)
- EdTech market size figures (vary by analyst; all are big enough to matter)
- Competitor user numbers (self-reported or press estimates)
- Founder tool willingness-to-pay (no primary research done)

### Low Confidence / Unvalidated Assumptions
- Student willingness to convert to paid (NO primary research — must validate)
- Founder acquisition channels (assumed — must test)
- Average session length / engagement pattern (unknown)
- Whether Saarthi's specific features (Socratic tutor, Mistake DNA) will drive retention (unproven)

---

## Founder's Validation Priorities

Before investing significant build time, validate these in order:

1. **Do 20 student interviews:** "Would you use an AI that asks you questions instead of giving answers? Would you pay ₹199/month for unlimited AI doubt clearing?"
2. **Do 10 founder interviews:** "What's your biggest pain in the first 90 days of starting up? Would you pay ₹499/month for an AI that handles compliance + investor research?"
3. **Test Groq limits in production conditions:** Build a minimal prototype and hit the API with realistic load patterns from 3 accounts simultaneously.

---

## Sources
- All sources are knowledge-based (training data). No live web searches performed.
