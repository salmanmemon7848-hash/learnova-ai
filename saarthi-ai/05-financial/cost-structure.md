# Cost Structure

**Phase:** 7 — Financial  
**Project:** saarthi-ai  
**Date:** 2026-05-22  
**Confidence:** High (infrastructure costs are verifiable)

---

## Year 1 Infrastructure — Zero Budget Mode

| Service | Free Tier Limit | Monthly Cost | Breaks At |
|---------|----------------|-------------|-----------|
| Groq API (3 accounts) | ~18,000 req/day, ~1.5M tokens/day | ₹0 | ~1,800 DAU using 10 req/day each |
| Vercel (hosting) | 100GB bandwidth, 100K serverless invocations/day | ₹0 | ~5,000–10,000 DAU |
| Supabase (DB + Auth + Storage) | 500MB data, 2 projects, 50K MAU auth | ₹0 | ~50,000 registered users with data |
| Upstash Redis (rate limiting + caching) | 10,000 commands/day | ₹0 | ~1,000 DAU (Redis commands multiply fast) |
| Resend (email) | 3,000 emails/month | ₹0 | ~3,000 monthly email events |
| Domain (getsaarthi.com) | — | ~₹66/month (₹800/year) | N/A |
| **Total Year 1** | | **~₹800/year** | |

---

## Scale Cost Triggers

When free tiers break, this is the upgrade path:

| Service | Free Tier Limit | Paid Tier | Monthly Cost |
|---------|----------------|-----------|-------------|
| Vercel | 100GB bandwidth | Pro ($20/month) | ₹1,660 |
| Supabase | 500MB, 50K MAU | Pro ($25/month) | ₹2,075 |
| Upstash Redis | 10K commands/day | Pay-per-use (~$0.2/100K commands) | Variable |
| Groq | Free tier | On-demand pricing TBD | Variable |

**Estimated monthly infrastructure at 10,000 DAU: ~₹5,000–₹8,000/month**  
**At this scale, monthly revenue should be ~₹89,800 (from projections) — healthy margin.**

---

## Break-Even Analysis

Infrastructure costs stay at ₹0 until ~1,800 DAU. By then, if 2% conversion holds:
- 36 paying students × ₹199 = ₹7,164/month
- 18 paying founders × ₹499 = ₹8,982/month
- Total MRR: ~₹16,146/month vs. infrastructure cost ~₹3,000–₹5,000/month at that scale

**Break-even: Before the first paid user, since costs are zero.**  
**First infrastructure spend: When DAU exceeds ~2,000 (likely Month 8–9)**

---

## One-Time Costs

| Item | Cost | When |
|------|------|------|
| Domain registration | ₹800 | Day 1 |
| CA consultation (compliance review of India Stack Navigator output) | ₹2,000–₹5,000 | Before founder section launch |
| PYQ data curation (time cost, no money cost) | ₹0 (founder's time) | Month 2 |
| **Total one-time: ~₹3,000–₹6,000** | | |

---

## Flags

**Red Flags:**
- Upstash Redis free tier (10K commands/day) will break first — at ~1,000 DAU if each user generates 10 Redis commands per session. Monitor this closely and optimise Redis usage aggressively (batch reads, reduce unnecessary checks).

**Yellow Flags:**
- Supabase free tier allows only 2 active projects. Student section and founder section should share one project.
- Groq free tier terms can change. Build provider abstraction from Day 1.

## Sources
- Vercel, Supabase, Upstash, Groq, Resend official pricing pages [Knowledge-Based, verify current limits]
