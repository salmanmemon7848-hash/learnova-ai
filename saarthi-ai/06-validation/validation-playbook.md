# Validation Playbook

**Phase:** 8 — Validation  
**Project:** saarthi-ai  
**Date:** 2026-05-22

---

## Experiments (Cheapest → Most Expensive)

### Experiment 1: Student Problem Interviews (₹0, 1 week)
**Assumption tested:** Students want concept-level help, not just answer delivery  
**How to run:** Post in r/JEEPreparation: "JEE aspirants — 10-min interview for a free tool I'm building. DM me." Or reach out in Telegram study groups.  
**Measure:** % who say doubt-clearing is a top-3 pain, % who are interested in Socratic method  
**Validates:** If 12+/20 say yes → build Socratic Tutor  
**Invalidates:** If <8/20 say yes → rethink core feature  
**Time:** 5–7 days | **Cost:** ₹0

### Experiment 2: Founder Problem Interviews (₹0, 1 week)
**Assumption tested:** Early founders struggle with compliance and pricing  
**How to run:** Post in r/indianstartups, reach out to 10 founders in IIT/NIT alumni WhatsApp groups  
**Measure:** Top 3 pains mentioned, interest in AI compliance tool  
**Validates:** If compliance/pricing mentioned by 6+/10 → build India Stack Navigator  
**Time:** 5–7 days | **Cost:** ₹0

### Experiment 3: Landing Page Test (₹0, 3 days to build)
**Assumption tested:** Students will sign up for a waitlist based on the value prop  
**How to run:** Build a single-page site (one evening). Headline: "The AI tutor that makes you think — not just copy answers. Built for JEE/NEET." Email capture. No product yet.  
**Measure:** Conversion rate on landing page (target: >15% of visitors sign up)  
**Validates:** If 15%+ conversion → value prop resonates  
**Invalidates:** If <5% → messaging problem, not product problem  
**Time:** 3 days | **Cost:** ₹0

### Experiment 4: Concierge MVP — Fake Socratic Bot (₹0, 1 week)
**Assumption tested:** Students will engage with Socratic method (not demand the answer)  
**How to run:** Use a WhatsApp or Telegram bot. When a student sends a question, you manually respond with 3 Socratic questions (no AI yet — you're doing it manually). Run for 10 students.  
**Measure:** Average exchanges per session, % who keep going vs. give up, % who thank you for the method  
**Validates:** If 7+/10 complete 3+ exchanges → build the real AI version  
**Invalidates:** If students just say "bro just give me the answer" and leave → Socratic method doesn't fit Indian student expectations  
**Time:** 1 week | **Cost:** ₹0  
**Note:** This is the most important experiment. Do this BEFORE coding.

### Experiment 5: Groq Architecture Load Test (₹0, 2 days)
**Assumption tested:** 3 Groq keys can handle 200 simultaneous users  
**How to run:** Write a simple load test script (Apache JMeter or k6). Simulate 200 users × 10 req/day hitting the 3-key rotation simultaneously. Measure: error rate, latency, key exhaustion.  
**Validates:** <5% "key exhausted" errors at 200 concurrent users → architecture is sound  
**Invalidates:** >20% errors → add caching, reduce per-user limits, or find more keys  
**Time:** 2 days | **Cost:** ₹0

---

## Flags

**Red Flags:**
- None

**Yellow Flags:**
- The Concierge MVP (Experiment 4) is the most valuable experiment but also the hardest to do consistently. You must respond to every student's question manually and carefully. Limit to 10 students to keep it manageable.

## Sources
- Validation methodology: Lean Startup (Ries), The Mom Test (Fitzpatrick)
