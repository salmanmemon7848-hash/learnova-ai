# User Journey

**Phase:** 6 — Product  
**Project:** saarthi-ai  
**Date:** 2026-05-22

---

## Student Journey — Arjun (JEE Aspirant)

| Stage | Touchpoint | Emotion | Risk of Drop-Off | Mitigation |
|-------|-----------|---------|-----------------|------------|
| **Discovery** | Sees Reddit post "This AI won't give me the answer — and that's why it works" | Curious, slightly sceptical | Medium — "sounds gimmicky" | Honest post with real example (not marketing copy). Show the full Socratic exchange. |
| **Landing** | Opens getsaarthi.com on mobile | Evaluating | High — slow load = instant exit | PWA, <500KB bundle, loads in <2s on 4G |
| **Sign-up** | Google auth (1 tap) | Friction if too many steps | High | One-tap Google auth. No email verification required for free tier. |
| **First session** | Types JEE physics doubt | Unsure about AI | High — if AI gives a vague or wrong guiding question | Explain Socratic method in 2 sentences BEFORE first exchange. "We'll ask you questions, not give you the answer. Here's why this works." |
| **"Aha moment"** | Gets to the answer on their own after 3 AI questions | Surprised, proud | — | AI explicitly says: "You got there yourself. That's the point." |
| **Day 2 return** | Comes back with another doubt | Committed | Medium | Send no notification. Users come back on merit. |
| **Day 7** | Sees first Mistake DNA partial report (10+ questions answered) | Intrigued | Low | Show "X more questions until your first full Mistake DNA report" progress bar |
| **Day 14** | Sees full Mistake DNA report | Impressed | Low | This is the retention anchor. Make this report visual and shareable. |
| **Share** | Sends Mistake DNA card to WhatsApp study group | Proud | — | One-tap share to WhatsApp with pre-written message |
| **Conversion** | Hits 10-query daily limit | Frustrated | High — they may churn if paywall feels aggressive | Paywall message: "You've been using Saarthi every day for [X] days. Go unlimited for ₹199/month." |

**The "aha moment":** When the student realises they actually understood the concept — not just copied an answer. Target: within first 10 minutes of first session.

---

## Founder Journey — Rahul (First-Time Founder)

| Stage | Touchpoint | Emotion | Risk of Drop-Off | Mitigation |
|-------|-----------|---------|-----------------|------------|
| **Discovery** | Sees Twitter/X thread "I saved ₹15,000 in CA fees using this free tool" | Sceptical curiosity | Low — founder pain is acute | Real story from beta user |
| **Landing** | Opens Saarthi Founders section | Evaluating | Medium | Clear above-fold copy: "Free compliance checklist for Indian founders. No signup required for the first check." |
| **First use** | Selects "Pvt Ltd, <₹20L revenue, no foreign investment" → sees India Stack Navigator output | Relieved, impressed | Low if output is accurate | Output must be accurate and actionable. Test with CA before launch. |
| **"Aha moment"** | Finds one compliance item they didn't know about | "This could have cost me" | — | "Did you know about [rule]? 40% of founders miss this." |
| **0 to GST** | Runs 7-day launch roadmap | Confident | Low | Roadmap has specific URLs, times, and ₹0 cost items |
| **Sign-up** | Creates account to save progress | Committed | Medium | Show progress lost if they don't save: "Your compliance checklist will disappear if you close this tab. Save it free." |
| **Deeper use** | Uses Bharat Pricing Engine + Investor Match | Engaged | Low | Each feature delivers distinct, new value |
| **Pitch Roast** | Pastes pitch deck | Anxious | Low | Framing: "Think of this as a practice run before the real investor." |
| **Conversion** | Hits limits or wants more investor matches | Motivated | Medium | ₹499/month for Founders Pro. Position as "less than 1 hour of a CA's time." |

**The "aha moment":** When the founder sees a compliance item they genuinely didn't know about — a real, avoided mistake.

---

## Flags

**Red Flags:**
- None

**Yellow Flags:**
- The student Socratic Tutor "aha moment" depends on the AI asking GOOD guiding questions. Bad questions (too vague, wrong direction) = user bounces after first session. This is the highest-risk feature UX.
- The founder India Stack Navigator output must be accurate. Inaccurate legal information damages trust immediately and irreparably. Get it reviewed by an actual CA before launch.

## Sources
- `01-discovery/target-audience.md` (Arjun and Rahul personas)
