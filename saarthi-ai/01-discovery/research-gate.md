# Research Gate — Go/No-Go Checkpoint

**Phase:** 3.5 — Research Gate  
**Project:** saarthi-ai  
**Date:** 2026-05-22

---

## Summary of Research Findings

| Dimension | Finding |
|-----------|---------|
| Market size | Large. 5.5M exam aspirants + 200K early-stage founders. EdTech ~$7.5B, growing 15%+ CAGR. |
| Competition | Intense in students (PW, Doubtnut), weak in AI-native exam prep. Very weak in founder tools. |
| Customer demand | Strong signal — students clearly need concept-level AI help. Founders need compliance + investor tools. |
| Timing | Favorable. AI adoption accelerating. No India-specific AI EdTech leader yet. Window: 2024–2026. |
| Technical feasibility | Groq free tier is real and fast. 3-key rotation architecture is buildable. Zero-cost stack is viable. |

---

## Recommendation

**GREEN LIGHT** — with conditions.

**Strongest signals:**
- The competitive gap is real: no India-AI-native exam prep tool exists. Saarthi's planned features are genuinely novel.
- Groq's LPU speed makes real-time AI tutoring competitive with — actually faster than — GPT-4 powered tools.
- The zero-cost infrastructure stack is proven (Vercel + Supabase + Upstash + Groq free tiers all exist today).
- India's 2024–2026 AI adoption window is open now.

**Conditions to monitor:**
1. Groq free tier stability — build the abstraction layer for provider swapping from Day 1
2. Student-to-paid conversion — validate with real users before assuming freemium works
3. Token usage per session — prototype and measure before full build

---

## Decision

**Proceed to Strategy (Phase 4).** No pivot required. The core two-sided platform idea is validated by market structure. The launch sequencing (students first, founders second) is recommended to reduce scope complexity.
