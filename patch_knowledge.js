// patch_knowledge.js — run with: node patch_knowledge.js
const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/lib/learnovaKnowledge.ts');
let c = fs.readFileSync(filePath, 'utf8');

const NEW_KNOWLEDGE = `
CAREER GUIDE KNOWLEDGE BASE V2.0 — India-First | 2026 Market Data | 28 Career Categories

━━━━ SCIENCE (PCM) CAREERS ━━━━

1. AI / Machine Learning Engineer
   Stream: Science (PCM) | Entry: Rs.8-18 LPA | Mid: Rs.18-35 LPA | Top: Rs.60 LPA+
   Demand: +34% (Jan 2026, Naukri JobSpeak) | Automation Risk: Low
   Exams: JEE Main/Advanced, BITSAT, GATE | India Shortage: 1.1M+ unfilled AI roles by 2027 (NASSCOM)
   Top Colleges: IIT Bombay, IIT Delhi, IIIT Hyderabad, BITS Pilani, NIT Trichy
   Skills: Python, TensorFlow, PyTorch, Statistics, Cloud (AWS/GCP)
   Schemes: NASSCOM FutureSkills Prime, Digital India internships

2. Software Developer / Full Stack Engineer
   Stream: Science (PCM) | Entry: Rs.4-10 LPA | Mid: Rs.12-25 LPA | Top: Rs.40 LPA+
   Demand: +12% (IT sector, Taggd 2026) | Automation Risk: Medium
   Exams: JEE Main, BITSAT, VITEEE, state CETs
   Top Colleges: IITs, NITs, BITS, VIT, Manipal, SRM
   Skills: JavaScript, React, Node.js, SQL, Git, System Design
   Note: GitHub portfolio + DSA outweigh college brand at startups

3. Cybersecurity Analyst
   Stream: Science (PCM) | Entry: Rs.5-10 LPA | Mid: Rs.10-20 LPA | Top: Rs.35 LPA+
   Demand: +31% | 790,000+ unfilled roles in India (2023, rising fast)
   Exams: JEE Main, CEH certification, CISSP (post-experience)
   Top Colleges: IIT Madras (online), NIT, BITS, PES University
   Skills: Network Security, Ethical Hacking, SIEM, Python, Cryptography

4. Data Scientist / Analyst
   Stream: Science (PCM) or Commerce (with Math)
   Entry: Rs.6-12 LPA | Mid: Rs.15-28 LPA | Top: Rs.50 LPA+ | Demand: +54% projected 2025-2030 (WEF)
   Exams: JEE, GATE (CS/Stats), IIM Business Analytics (MBA route)
   Top Colleges: IIT, ISI Kolkata, IISc, CMI Chennai, DSE Delhi
   Skills: Python, SQL, Tableau, Statistics, Machine Learning, Excel

5. Space Technology / Aerospace Engineer
   Stream: Science (PCM) | Entry: Rs.6-10 LPA (ISRO) / Rs.8-15 LPA (private) | Top: Rs.35 LPA+
   Demand: India space economy -> Rs.44B by 2033; ISRO + 150+ private startups
   Exams: JEE Advanced, IIST entrance, GATE (AE)
   Top Colleges: IIST Thiruvananthapuram, IIT Bombay/Madras, PEC Chandigarh
   Private Players Hiring: Agnikul Cosmos, Skyroot, Dhruva Space

6. EV / Renewable Energy Engineer
   Stream: Science (PCM) | Entry: Rs.5-10 LPA | Mid: Rs.12-25 LPA | Top: Rs.30 LPA+
   Demand: +1 million jobs by 2030 (NITI Aayog) | Schemes: PM Surya Ghar, NEMM
   Exams: JEE Main, state CETs, GATE (EE/ME)
   Top Colleges: IIT Madras (Energy), NIT, MNIT, PDPU Gandhinagar

7. Mechanical / Civil Engineer
   Stream: Science (PCM) | Entry: Rs.3-7 LPA | Mid: Rs.8-18 LPA | Top: Rs.25 LPA+
   Demand: Smart Cities Mission, RERA construction boom, infrastructure push
   Exams: JEE Main, JEE Advanced, state CETs, GATE
   Top Colleges: IIT Kharagpur, NIT Warangal, BITS Pilani, COEP Pune

━━━━ SCIENCE (PCB) CAREERS ━━━━

8. Doctor (MBBS -> MD/MS)
   Stream: Science (PCB) | Entry: Rs.6-15 LPA (private) / Rs.1.2L/month (Govt) | Top: Rs.40 LPA+
   Demand: 16% CAGR in healthcare (Vaidyog 2026) | Duration: 5.5 yrs MBBS + 3 yrs MD/MS
   Exams: NEET UG (mandatory), NEET PG (for specialization)
   Top Colleges: AIIMS Delhi, JIPMER, AFMC, GMC (state), Manipal
   Govt Stability: High — ESIC, CGHS, state health departments hiring consistently

9. Allied Health Sciences (BPT, BOT, Nutrition, Audiology)
   Stream: Science (PCB) | Entry: Rs.3-6 LPA | Mid: Rs.6-15 LPA | Top: Rs.20 LPA+
   Note: Excellent for healthcare without NEET pressure
   Courses: BPT, BOT, BSc Nutrition, BSc Audiology, BSc MLT
   Top Colleges: AIIMS (Allied), Manipal, Amity, SRMC Chennai

10. Biotechnology / Biomedical Engineer
    Stream: Science (PCB) | Entry: Rs.3-8 LPA | Mid: Rs.8-20 LPA | Top: Rs.35 LPA+ (with PhD)
    Demand: India biotech market -> Rs.150B by 2025 (IBEF)
    Exams: NEET, JEE (Biomedical), GATE (BT)
    Top Colleges: IIT Bombay, BITS Pilani, Manipal, Amity, VIT

11. Clinical Psychologist / Counseling Professional
    Stream: Science (PCB) or Arts
    Entry: Rs.3-6 LPA | Mid: Rs.6-15 LPA | Top: Rs.25 LPA+ (private practice)
    Demand: Mental health industry growing at 18% CAGR post-COVID
    Shortage: India has 1 psychiatrist per 100,000 people — extreme shortage
    Exams: NIMHANS entrance, DU PG entrance, RCI registration
    Top Colleges: NIMHANS Bangalore, TISS Mumbai, Delhi University, Amity

12. Pharmacy (B.Pharm -> M.Pharm / PharmD)
    Stream: Science (PCB) | Entry: Rs.3-6 LPA | Mid: Rs.6-18 LPA | Top: Rs.25 LPA+
    Exams: NEET (some states), state pharmacy entrance, GPAT (PG)
    Top Colleges: JSS Mysore, Manipal, ICT Mumbai, BHU, Jamia Hamdard

━━━━ COMMERCE CAREERS ━━━━

13. Chartered Accountant (CA)
    Stream: Commerce | Entry: Rs.6-12 LPA | Mid: Rs.15-30 LPA | Top: Rs.60 LPA+ (Big 4 partner)
    Demand: Every business, every startup, every MNC needs a CA — recession-proof
    Exams: CA Foundation -> Intermediate -> Final (ICAI) | Duration: 4-5 years with articleship
    Top Firms: Deloitte, EY, KPMG, PwC, Grant Thornton
    Schemes: ICAI scholarship for meritorious students

14. Investment Banker / Finance Professional
    Stream: Commerce (or PCM with strong Math)
    Entry: Rs.6-15 LPA | Mid: Rs.20-50 LPA | Top: Rs.1 Cr+ (senior roles)
    Exams: CAT -> IIM (MBA Finance), CFA, NISM certifications
    Top Colleges: IIM A/B/C, XLRI, FMS Delhi, MDI Gurgaon, SP Jain

15. Digital Marketer / Growth Hacker
    Stream: Commerce or Arts | Entry: Rs.3-8 LPA | Mid: Rs.8-20 LPA | Top: Rs.35 LPA+
    Demand: India e-commerce -> Rs.350B by 2030; Tier-2 remote roles growing 35%
    Exams: No mandatory entrance; Google/Meta/HubSpot certifications
    Top Institutes: MICA Ahmedabad, Xavier's, online (Coursera, HubSpot Academy)

16. Entrepreneur / Business Founder
    Stream: Commerce (or any) | Income: Rs.0 to unlimited — high risk, high reward
    Schemes: Startup India, MSME loans, Mudra Yojana, iStart (state level)
    Pathway: BBA/B.Com -> MBA -> Startup | or skip degree -> build directly
    Resources: IIT/IIM incubators, Y Combinator India, AngelList India

17. Logistics & Supply Chain Manager
    Stream: Commerce | Entry: Rs.4-7 LPA | Mid: Rs.10-20 LPA | Top: Rs.25 LPA+
    Demand: PM Gati Shakti + e-commerce boom; India logistics -> Rs.380B by 2025
    Top Colleges: IIM Calcutta (Ops), XLRI, IIFT Delhi, Symbiosis Pune
    Top Hirers: Amazon, Flipkart, Delhivery, Maersk, DHL, Blue Dart

━━━━ ARTS / HUMANITIES CAREERS ━━━━

18. Lawyer (LLB / LLM)
    Stream: Arts or any | Entry: Rs.3-8 LPA | Mid: Rs.10-30 LPA | Top: Rs.1 Cr+
    Exams: CLAT, AILET, LSAT India, DU LLB entrance
    Top Colleges: NLSIU Bangalore, NALSAR Hyderabad, NLU Delhi, Symbiosis Law
    Duration: 5 yrs (BA LLB integrated) or 3 yrs (LLB after graduation)

19. Journalist / Mass Communication
    Stream: Arts | Entry: Rs.2-6 LPA | Mid: Rs.6-18 LPA | Top: Rs.30 LPA+
    Exams: IIMC entrance, XIC entrance, ACJ Chennai entrance, CUET PG
    Top Colleges: IIMC Delhi, ACJ Chennai, Symbiosis Pune, AJK Mass Comm Delhi
    New Track: Digital journalism / YouTube / investigative podcasting

20. UI/UX Designer
    Stream: Arts or any (portfolio > degree)
    Entry: Rs.4-8 LPA | Mid: Rs.10-20 LPA | Top: Rs.30 LPA+
    Demand: India design roles up 28% (LinkedIn 2026)
    Exams: NID entrance, NIFT entrance, or bootcamp route (no exam)
    Top Colleges: NID Ahmedabad, NIFT Delhi, IDC IIT Bombay, Srishti Bangalore

21. Content Creator / Creator Economy
    Stream: Arts or any | Income: Rs.0 to Rs.5 Cr+ (non-linear)
    India Context: Creator economy -> Rs.2B+ and growing
    Path: Build content while studying -> monetize with brand deals, courses, merch
    Note: Niche + consistency = income. Not a gamble if treated as a business.

22. Civil Services / IAS / IPS (UPSC)
    Stream: Any | Salary: Rs.56,100-Rs.2,50,000/month (7th Pay Commission) + allowances
    Demand: 1,000+ IAS/IPS vacancies annually; State PCS adds thousands more
    Exams: UPSC CSE (Prelims -> Mains -> Interview), State PCS
    Institutes: Vajiram, Khan Study Group, ForumIAS, self-study with NCERT

━━━━ CROSS-STREAM / EMERGING CAREERS ━━━━

23. Blockchain Developer
    Stream: Science (PCM) or Commerce (FinTech)
    Entry: Rs.6-12 LPA | Mid: Rs.15-30 LPA | Top: Rs.50 LPA+
    Skills: Solidity, Ethereum, Web3.js, Smart Contracts, Python

24. HR Professional
    Stream: Arts or Commerce | Entry: Rs.3-6 LPA | Mid: Rs.8-18 LPA | Top: Rs.30 LPA+
    Best College: XLRI Jamshedpur (India's top for MBA HR)

25. Teacher / Education Professional
    Stream: Any | Entry: Rs.2-5 LPA (school) / Rs.6-18 LPA (edtech) | Top: Rs.40 LPA+
    Exams: CTET/TET (school), NET (college) | EdTech: PhysicsWallah, Unacademy hiring actively

26. Defence Officer (Army / Navy / Air Force)
    Stream: PCM preferred, but all streams eligible for some entries
    Entry: Rs.56,100/month (Lieutenant) + allowances + free housing
    Exams: NDA (after 12th), CDS (after graduation), AFCAT (Air Force)

27. Environmental Scientist / Climate Tech
    Stream: Science (PCB or PCM) | Entry: Rs.3-8 LPA | Mid: Rs.8-20 LPA | Top: Rs.30 LPA+
    Demand: ESG compliance mandates; India Net Zero target creating new roles
    Exams: GATE (Environment), IFS (Indian Forest Service via UPSC)
    Top Colleges: IIT Delhi (Environmental Engg), TERI University, BHU

28. Product Manager (Tech)
    Stream: Any (Engineering background preferred, MBA route common)
    Entry: Rs.10-18 LPA | Mid: Rs.20-40 LPA | Top: Rs.80 LPA+
    Top Hirers: Flipkart, Swiggy, Razorpay, CRED, Google India, Microsoft India

━━━━ SALARY BENCHMARKS 2026 (INDIA) ━━━━

AI/ML: Entry Rs.8-18 LPA | Senior Rs.25-50 LPA | Top Rs.60 LPA+
Cybersecurity: Entry Rs.5-10 LPA | Senior Rs.15-30 LPA | Top Rs.40 LPA+
Data Science: Entry Rs.6-12 LPA | Senior Rs.18-35 LPA | Top Rs.50 LPA+
Software Dev: Entry Rs.4-8 LPA | Senior Rs.12-25 LPA | Top Rs.40 LPA+
CA/Finance: Entry Rs.6-12 LPA | Senior Rs.18-40 LPA | Top Rs.1 Cr+ (partner)
Investment Banking: Entry Rs.8-15 LPA | Senior Rs.25-60 LPA | Top Rs.1 Cr+
Medicine: Entry Rs.6-15 LPA | Senior Rs.20-40 LPA | Top Rs.60 LPA+ (specialist)
Law (Corporate): Entry Rs.5-10 LPA | Senior Rs.20-50 LPA | Top Rs.1 Cr+
Product Manager: Entry Rs.10-18 LPA | Senior Rs.25-50 LPA | Top Rs.80 LPA+
UPSC/IAS: Rs.56,100-Rs.2,50,000/month
Digital Marketing: Entry Rs.3-6 LPA | Senior Rs.10-20 LPA | Top Rs.35 LPA+
UI/UX Design: Entry Rs.4-8 LPA | Senior Rs.12-22 LPA | Top Rs.35 LPA+

City Premium vs national avg: Bangalore +25-30% | Hyderabad +20-25% | Mumbai +15-20% | Delhi/NCR +15-20%
Tier-2 cities: -10-15% salary but significantly lower cost of living

━━━━ KEY GOVERNMENT SCHOLARSHIPS ━━━━

1. PM-YASASVI — OBC/EWS/DNT students; Rs.75,000-Rs.1,25,000/year
2. National Scholarship Portal (NSP) — scholarships.gov.in
3. AICTE Pragati & Saksham — Girls + Divyang in technical education
4. CSIR-NET/JRF Fellowship — Rs.31,000-Rs.35,000/month for science research
5. PM CARES Scholarship — COVID-affected families; full tuition
6. Tata Trust Scholarships — Underprivileged meritorious students
7. Reliance Foundation Scholarship — Rs.4 LPA for UG in top colleges
8. State Merit Scholarships — Every state has its own; check state education portal

━━━━ ENTRANCE EXAM QUICK REFERENCE ━━━━

PCM: JEE Main -> JEE Advanced -> BITSAT -> VITEEE -> GATE
PCB: NEET UG -> AIIMS -> JIPMER -> NEET PG -> GPAT
Commerce: CA Foundation -> CLAT -> CAT -> MAT -> NISM
Arts: CLAT -> IIMC -> CUET PG -> UPSC CSE -> NID -> NIFT
Defence: NDA -> CDS -> AFCAT -> SSB Interview
`;

// Replace the CAREER_GUIDE_KNOWLEDGE export content
c = c.replace(
  /(export const CAREER_GUIDE_KNOWLEDGE = `)[^`]*(`;)/s,
  '$1' + NEW_KNOWLEDGE + '$2'
);

fs.writeFileSync(filePath, c, 'utf8');
console.log('learnovaKnowledge.ts patched. Lines:', c.split('\n').length);
