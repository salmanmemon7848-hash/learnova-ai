'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const careerData: any = {
  Science: [
    {
      id: 'engineering',
      title: 'Engineering (B.Tech/B.E.)',
      icon: '⚙️',
      tagline: 'Build the future with technology',
      description: 'One of India\'s most sought-after careers. Engineers design, build and maintain systems across industries from IT to infrastructure.',
      salary: { entry: '₹3-8 LPA', mid: '₹8-20 LPA', senior: '₹20-60 LPA', top: '₹60 LPA+' },
      duration: '4 years',
      jobGrowth: '22% (High)',
      difficulty: 'Hard',
      scope: 'Excellent',
      topColleges: ['IIT Bombay', 'IIT Delhi', 'IIT Madras', 'NIT Trichy', 'BITS Pilani', 'VIT'],
      requiredExams: ['JEE Main', 'JEE Advanced', 'BITSAT', 'VITEEE', 'MHT-CET', 'KCET'],
      specializations: ['Computer Science', 'Mechanical', 'Electrical', 'Civil', 'Electronics', 'AI & ML', 'Robotics', 'Data Science'],
      jobRoles: ['Software Engineer', 'Data Scientist', 'AI Engineer', 'Product Manager', 'System Architect', 'DevOps Engineer'],
      topRecruiters: ['Google', 'Microsoft', 'Amazon', 'TCS', 'Infosys', 'Wipro', 'ISRO', 'DRDO'],
      skills: ['Mathematics', 'Problem Solving', 'Coding', 'Analytical Thinking', 'Project Management'],
      pros: ['Highest placement rates', 'Global job opportunities', 'Multiple specializations', 'Strong alumni networks'],
      cons: ['Extremely competitive entrance', 'High coaching costs', '4 years commitment', 'Stressful academics'],
      roadmap: ['Class 11-12: PCM + JEE prep', 'Clear JEE Main/Advanced', 'Choose specialization wisely', 'Build projects & internships', 'Campus placements or GATE'],
      futureScope: 'AI, ML, Robotics, Quantum Computing are future hot areas. Remote work opportunities globally.',
      color: 'blue',
    },
    {
      id: 'medicine',
      title: 'Medicine (MBBS/MD)',
      icon: '🏥',
      tagline: 'Save lives and serve humanity',
      description: 'Noble profession with high respect in Indian society. Doctors are always in demand with growing healthcare industry.',
      salary: { entry: '₹6-12 LPA', mid: '₹12-25 LPA', senior: '₹25-60 LPA', top: '₹1 Cr+' },
      duration: '5.5 years (MBBS) + 3 years (MD)',
      jobGrowth: '18% (High)',
      difficulty: 'Very Hard',
      scope: 'Excellent',
      topColleges: ['AIIMS Delhi', 'JIPMER', 'CMC Vellore', 'AFMC Pune', 'Maulana Azad Medical College'],
      requiredExams: ['NEET UG', 'AIIMS', 'JIPMER', 'NEET PG (for MD)'],
      specializations: ['General Medicine', 'Surgery', 'Paediatrics', 'Cardiology', 'Neurology', 'Oncology', 'Orthopaedics', 'Psychiatry'],
      jobRoles: ['General Physician', 'Surgeon', 'Specialist Doctor', 'Medical Researcher', 'Hospital Director', 'Medical Officer'],
      topRecruiters: ['AIIMS', 'Apollo Hospitals', 'Fortis', 'Max Healthcare', 'Government Hospitals', 'Armed Forces'],
      skills: ['Biology', 'Chemistry', 'Empathy', 'Attention to Detail', 'Communication', 'Stamina'],
      pros: ['Highest social respect', 'Job security', 'High earning potential', 'Ability to help people'],
      cons: ['Very long study period', 'Extremely tough NEET competition', 'High stress', 'Expensive private colleges'],
      roadmap: ['Class 11-12: PCB + NEET prep', 'Clear NEET UG', 'MBBS 5.5 years', 'Internship 1 year', 'NEET PG for specialization'],
      futureScope: 'Telemedicine, AI diagnostics, medical research growing rapidly. Indian doctors highly valued globally.',
      color: 'red',
    },
    {
      id: 'datascience',
      title: 'Data Science & AI',
      icon: '🤖',
      tagline: 'Shape the future with data and AI',
      description: 'Fastest growing career globally. Data scientists and AI engineers are in massive demand across every industry.',
      salary: { entry: '₹5-12 LPA', mid: '₹12-30 LPA', senior: '₹30-80 LPA', top: '₹1 Cr+' },
      duration: '3-4 years',
      jobGrowth: '35% (Explosive)',
      difficulty: 'Medium-Hard',
      scope: 'Outstanding',
      topColleges: ['IITs', 'IIITs', 'IISc', 'BITS Pilani', 'NIT', 'ISI Kolkata'],
      requiredExams: ['JEE Main', 'State CETs', 'NIMCET', 'CUET'],
      specializations: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'Business Analytics', 'Data Engineering'],
      jobRoles: ['Data Scientist', 'ML Engineer', 'AI Researcher', 'Data Analyst', 'Business Intelligence Analyst', 'AI Product Manager'],
      topRecruiters: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Flipkart', 'Zomato', 'Ola', 'Startups'],
      skills: ['Python', 'Statistics', 'Machine Learning', 'SQL', 'Data Visualization', 'Mathematics'],
      pros: ['Highest salary packages', 'Work from anywhere', 'Future-proof career', 'Exciting work'],
      cons: ['Requires strong math skills', 'Fast-changing field', 'High competition globally'],
      roadmap: ['Learn Python & Statistics', 'Study ML/DL fundamentals', 'Build projects on Kaggle', 'Get internships', 'Contribute to open source'],
      futureScope: 'AI is transforming every industry. Demand will only grow. India becoming global AI hub.',
      color: 'purple',
    },
    {
      id: 'research',
      title: 'Research & Science',
      icon: '🔬',
      tagline: 'Discover new knowledge for humanity',
      description: 'For those passionate about understanding how the universe works. Research careers in physics, chemistry, biology and mathematics.',
      salary: { entry: '₹3-6 LPA', mid: '₹6-15 LPA', senior: '₹15-40 LPA', top: '₹40 LPA+' },
      duration: '5-7 years (BSc + MSc + PhD)',
      jobGrowth: '12% (Moderate)',
      difficulty: 'Very Hard',
      scope: 'Good',
      topColleges: ['IISc Bangalore', 'IISER', 'TIFR Mumbai', 'IITs', 'Bose Institute'],
      requiredExams: ['IISER Aptitude', 'KVPY', 'NEST', 'JAM (for MSc)', 'CSIR NET'],
      specializations: ['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Astronomy', 'Nanotechnology'],
      jobRoles: ['Research Scientist', 'Professor', 'Lab Director', 'Science Writer', 'Policy Advisor', 'Forensic Scientist'],
      topRecruiters: ['ISRO', 'DRDO', 'CSIR', 'BARC', 'IITs', 'International Universities', 'Pharma Companies'],
      skills: ['Analytical Thinking', 'Patience', 'Mathematics', 'Writing', 'Laboratory Skills'],
      pros: ['Intellectual satisfaction', 'Government job security', 'International opportunities', 'Noble contribution'],
      cons: ['Low starting salary', 'Very long education path', 'Limited private sector jobs'],
      roadmap: ['Strong PCM/PCB in school', 'Clear KVPY/IISER', 'BSc + MSc', 'PhD from top institute', 'Post-doc if needed'],
      futureScope: 'Space research, biotech, quantum physics growing. India investing heavily in R&D.',
      color: 'green',
    },
    {
      id: 'cybersecurity',
      title: 'Cybersecurity & Ethical Hacking',
      icon: '🛡️',
      tagline: 'Defend the digital world from attackers',
      description: 'India needs 1 million+ cybersecurity professionals by 2027 and has a massive talent gap right now. Every bank, startup, and government system needs cyber protection. One of the most future-proof and AI-resistant careers.',
      salary: { entry: '₹5-12 LPA', mid: '₹12-30 LPA', senior: '₹30-70 LPA', top: '₹70 LPA+' },
      duration: '3-4 years',
      jobGrowth: '33% (Explosive)',
      difficulty: 'Medium-Hard',
      scope: 'Outstanding',
      topColleges: ['IITs', 'NITs', 'BITS Pilani', 'VIT', 'Amity University', 'Chandigarh University'],
      requiredExams: ['JEE Main', 'State CETs', 'CUET', 'CEH Certification', 'CompTIA Security+'],
      specializations: ['Ethical Hacking', 'Network Security', 'Cloud Security', 'Forensic Analysis', 'Penetration Testing', 'Malware Analysis', 'Cryptography'],
      jobRoles: ['Cybersecurity Analyst', 'Ethical Hacker', 'Penetration Tester', 'Security Architect', 'SOC Analyst', 'CISO', 'Bug Bounty Hunter'],
      topRecruiters: ['ISRO', 'DRDO', 'TCS Cyber', 'IBM Security', 'Wipro', 'HCL', 'Government Agencies', 'Banks'],
      skills: ['Python', 'Linux', 'Networking', 'Ethical Hacking Tools', 'Risk Management', 'Cryptography', 'Logical Thinking'],
      pros: ['Massive talent shortage = high salaries', 'Remote work available', 'GCCs pay 40% more than regular IT', 'AI cannot replace human hackers', 'Bug bounties can earn ₹10-50L/year extra'],
      cons: ['Needs constant upskilling', 'Certifications are expensive', 'High responsibility and stress', 'Always on-call during incidents'],
      roadmap: ['B.Tech in CS/IT or Cybersecurity', 'Learn networking fundamentals (CCNA)', 'Get CEH or CompTIA Security+ certification', 'Practice on platforms like HackTheBox, TryHackMe', 'Build portfolio of CTF challenges', 'Internship at security firm'],
      futureScope: 'India digital transactions crossed ₹5.1 trillion in 2024. Every UPI transaction, Aadhaar system, bank needs protection. Demand doubling every 2 years.',
      color: 'cyan',
    },
    {
      id: 'pharmacy',
      title: 'Pharmacy (B.Pharm/Pharm.D)',
      icon: '💊',
      tagline: 'Power India\'s booming pharma industry',
      description: 'India is the world\'s largest generic medicine supplier — called the Pharmacy of the World. B.Pharm and Pharm.D graduates have strong career paths in drug companies, hospitals, research, and global exports.',
      salary: { entry: '₹3-6 LPA', mid: '₹6-15 LPA', senior: '₹15-40 LPA', top: '₹40 LPA+' },
      duration: '4 years (B.Pharm) or 6 years (Pharm.D)',
      jobGrowth: '20% (High)',
      difficulty: 'Medium',
      scope: 'Very Good',
      topColleges: ['BITS Pilani (Pharmacy)', 'Jamia Hamdard', 'JSS College of Pharmacy', 'Manipal College of Pharmacy', 'ICT Mumbai'],
      requiredExams: ['GPAT', 'NEET (some colleges)', 'State Pharmacy CETs', 'MH CET Pharmacy'],
      specializations: ['Clinical Pharmacy', 'Pharmaceutical Research', 'Drug Regulatory Affairs', 'Hospital Pharmacy', 'Industrial Pharmacy', 'Pharmacovigilance'],
      jobRoles: ['Clinical Pharmacist', 'Drug Regulatory Officer', 'Medical Representative', 'Quality Control Analyst', 'Research Scientist', 'Hospital Pharmacist'],
      topRecruiters: ['Sun Pharma', 'Cipla', 'Dr. Reddy\'s', 'Lupin', 'Aurobindo', 'Apollo Hospitals', 'AIIMS', 'WHO'],
      skills: ['Chemistry', 'Biology', 'Drug Knowledge', 'Regulatory Knowledge', 'Lab Skills', 'Communication'],
      pros: ['India is Pharmacy of the World', 'Global job opportunities', 'Growing pharma exports', 'Less competitive than MBBS', 'Multiple career paths'],
      cons: ['Lower starting salary than engineering', 'Long Pharm.D path', 'MR jobs require heavy field work'],
      roadmap: ['PCB in Class 12', 'Clear GPAT/state CET', 'B.Pharm 4 years', 'M.Pharm or MBA Pharma for growth', 'USMLE for USA opportunities'],
      futureScope: 'India pharma exports growing at 11% annually. Post-COVID vaccine research boom. Pharmacovigilance and drug regulatory careers growing fastest.',
      color: 'emerald',
    },
    {
      id: 'biotechnology',
      title: 'Biotechnology & Genetics',
      icon: '🧬',
      tagline: 'Engineer life itself with science',
      description: 'One of the most exciting science careers. Biotechnologists work on life-saving vaccines, gene editing, agricultural biotech, and biofuels. India\'s biotech industry is projected to reach $150 billion by 2025.',
      salary: { entry: '₹3-7 LPA', mid: '₹7-20 LPA', senior: '₹20-50 LPA', top: '₹50 LPA+' },
      duration: '3-5 years (BSc/BTech Biotech)',
      jobGrowth: '22% (High)',
      difficulty: 'Hard',
      scope: 'Excellent',
      topColleges: ['IIT Bombay', 'IIT Delhi', 'IIT Madras', 'JNU', 'BITS Pilani', 'Manipal', 'SRM University'],
      requiredExams: ['JEE Main', 'CUET', 'State CETs', 'DBT JRF (for research)'],
      specializations: ['Genetic Engineering', 'Bioinformatics', 'Agricultural Biotech', 'Medical Biotech', 'Industrial Biotech', 'Biofuels', 'Genomics'],
      jobRoles: ['Biotechnologist', 'Genetic Counselor', 'Bioinformatics Analyst', 'Research Scientist', 'Quality Analyst', 'Biotech Entrepreneur', 'Clinical Research Associate'],
      topRecruiters: ['Biocon', 'Serum Institute', 'Dr. Reddy\'s', 'CSIR', 'ICMR', 'ISRO', 'International Universities'],
      skills: ['Molecular Biology', 'Genetics', 'Bioinformatics', 'Lab Techniques', 'Data Analysis', 'Research Writing'],
      pros: ['Cutting-edge science', 'Global research opportunities', 'Post-COVID pharma boom', 'Growing startup ecosystem', 'Government R&D funding increasing'],
      cons: ['Long research path for top roles', 'Lower private sector salaries early on', 'PhD required for senior research'],
      roadmap: ['PCB with high marks', 'BSc/BTech Biotechnology', 'Internship at biotech lab', 'MSc or MTech Biotech', 'PhD from CSIR/IIT for research leadership'],
      futureScope: 'Gene therapy, CRISPR, personalized medicine — all growing rapidly. India becoming global vaccine manufacturing hub.',
      color: 'lime',
    },
  ],
  Commerce: [
    {
      id: 'ca',
      title: 'Chartered Accountant (CA)',
      icon: '📊',
      tagline: 'Master of finance and accounting',
      description: 'One of the most prestigious and high-paying qualifications in India. CAs are essential for every business.',
      salary: { entry: '₹6-10 LPA', mid: '₹10-25 LPA', senior: '₹25-60 LPA', top: '₹1 Cr+' },
      duration: '4-5 years',
      jobGrowth: '20% (High)',
      difficulty: 'Very Hard',
      scope: 'Excellent',
      topColleges: ['ICAI (self-study)', 'DU Commerce', 'Shri Ram College of Commerce', 'NMIMS', 'Christ University'],
      requiredExams: ['CA Foundation', 'CA Intermediate', 'CA Final', 'ICAI Articleship'],
      specializations: ['Audit & Assurance', 'Taxation', 'Financial Reporting', 'Corporate Finance', 'Forensic Accounting'],
      jobRoles: ['Chartered Accountant', 'Tax Consultant', 'Auditor', 'CFO', 'Finance Manager', 'Investment Banker'],
      topRecruiters: ['Big 4 (Deloitte, PwC, EY, KPMG)', 'Banks', 'MNCs', 'Government', 'Own Practice'],
      skills: ['Accounting', 'Taxation Law', 'Attention to Detail', 'Analytical Skills', 'Communication'],
      pros: ['Very high earning potential', 'Own practice option', 'Always in demand', 'Prestigious qualification'],
      cons: ['Extremely tough exams', 'Low pass rate (10-15%)', 'Years of articleship', 'Stressful preparation'],
      roadmap: ['Clear Class 12 Commerce', 'Register for CA Foundation', 'Pass Foundation → Inter → Final', '3 years articleship', 'ICAI membership'],
      futureScope: 'GST, digital taxation, international accounting standards creating more demand than ever.',
      color: 'yellow',
    },
    {
      id: 'mba',
      title: 'Business Administration (BBA/MBA)',
      icon: '💼',
      tagline: 'Lead businesses and drive growth',
      description: 'Gateway to corporate leadership. MBA from premium institutes opens doors to top management positions across industries.',
      salary: { entry: '₹4-10 LPA', mid: '₹10-30 LPA', senior: '₹30-1 Cr LPA', top: '₹1 Cr+' },
      duration: '3 years BBA + 2 years MBA',
      jobGrowth: '25% (High)',
      difficulty: 'Medium',
      scope: 'Excellent',
      topColleges: ['IIM Ahmedabad', 'IIM Bangalore', 'IIM Calcutta', 'ISB Hyderabad', 'XLRI', 'FMS Delhi'],
      requiredExams: ['CAT', 'XAT', 'CMAT', 'GMAT', 'MAT', 'SNAP'],
      specializations: ['Finance', 'Marketing', 'HR', 'Operations', 'Strategy', 'Entrepreneurship', 'Digital Business'],
      jobRoles: ['Product Manager', 'Marketing Manager', 'Consultant', 'Investment Banker', 'Entrepreneur', 'Business Analyst'],
      topRecruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Amazon', 'Google', 'Hindustan Unilever', 'P&G'],
      skills: ['Leadership', 'Communication', 'Strategic Thinking', 'Networking', 'Problem Solving'],
      pros: ['Top salary packages at IIMs', 'Wide career options', 'Strong alumni network', 'Entrepreneurship support'],
      cons: ['IIM fees very high (₹20-25L)', 'CAT is extremely competitive', 'Work experience needed for top MBA'],
      roadmap: ['BBA or any graduation', 'Work 2-3 years', 'Prepare for CAT', 'IIM/top MBA', 'Campus placements'],
      futureScope: 'Digital transformation, startup ecosystem, and global business expansion creating huge demand for MBAs.',
      color: 'orange',
    },
    {
      id: 'banking',
      title: 'Banking & Finance',
      icon: '🏦',
      tagline: 'Power the financial backbone of India',
      description: 'Stable government jobs plus exciting private sector roles. Banking sector employs millions across India.',
      salary: { entry: '₹3-6 LPA', mid: '₹6-18 LPA', senior: '₹18-40 LPA', top: '₹40 LPA+' },
      duration: '3 years',
      jobGrowth: '15% (Steady)',
      difficulty: 'Medium',
      scope: 'Very Good',
      topColleges: ['DU', 'Mumbai University', 'Symbiosis', 'Christ University', 'NMIMS'],
      requiredExams: ['IBPS PO', 'IBPS Clerk', 'SBI PO', 'RBI Grade B', 'NABARD', 'LIC AAO'],
      specializations: ['Retail Banking', 'Investment Banking', 'Insurance', 'Stock Markets', 'Microfinance', 'FinTech'],
      jobRoles: ['Bank PO', 'Financial Analyst', 'Stock Broker', 'Insurance Agent', 'FinTech Product Manager', 'Credit Analyst'],
      topRecruiters: ['SBI', 'HDFC Bank', 'ICICI Bank', 'RBI', 'LIC', 'Kotak', 'Axis Bank', 'Paytm'],
      skills: ['Numerical Ability', 'Reasoning', 'English', 'Financial Knowledge', 'Customer Service'],
      pros: ['Government job security', 'Good perks and pension', 'Pan-India opportunities', 'Respect in society'],
      cons: ['Low starting salary in government', 'Highly competitive exams', 'Transfers across India'],
      roadmap: ['Graduate in Commerce/Math', 'Start IBPS/SBI preparation', 'Clear prelims + mains', 'Interview preparation', 'Specialist certification'],
      futureScope: 'Digital banking, UPI, FinTech revolution creating new-age banking careers beyond traditional roles.',
      color: 'teal',
    },
    {
      id: 'stockmarket',
      title: 'Stock Market & Investment',
      icon: '📈',
      tagline: 'Build wealth through financial markets',
      description: 'India\'s stock market has over 10 crore registered investors and growing. Career opportunities in trading, wealth management, equity research, and investment banking are booming with India becoming a global financial hub.',
      salary: { entry: '₹4-8 LPA', mid: '₹8-30 LPA', senior: '₹30-1 Cr LPA', top: '₹1 Cr+' },
      duration: '3-4 years + certifications',
      jobGrowth: '28% (High)',
      difficulty: 'Medium-Hard',
      scope: 'Excellent',
      topColleges: ['IIM Ahmedabad', 'IIM Calcutta', 'SP Jain School', 'NMIMS Finance', 'DSE', 'ISI Kolkata'],
      requiredExams: ['NISM Certifications', 'CFA (global)', 'CFP', 'SEBI Registered Research Analyst', 'NCFM'],
      specializations: ['Equity Research', 'Technical Analysis', 'Derivatives Trading', 'Mutual Funds', 'Portfolio Management', 'Algorithmic Trading', 'Wealth Management'],
      jobRoles: ['Equity Research Analyst', 'Portfolio Manager', 'Wealth Manager', 'Stock Trader', 'Investment Banker', 'Quantitative Analyst', 'Fund Manager'],
      topRecruiters: ['Zerodha', 'Goldman Sachs', 'Morgan Stanley', 'HDFC Securities', 'Motilal Oswal', 'ICICI Securities', 'Hedge Funds'],
      skills: ['Financial Modeling', 'Excel', 'Python (Algo Trading)', 'Economics', 'Risk Management', 'Behavioral Finance', 'Communication'],
      pros: ['Unlimited earning potential', 'Exciting and dynamic work', 'Can start investing personally early', 'Remote work possible', 'Global opportunities'],
      cons: ['High stress and pressure', 'Markets unpredictable', 'Requires continuous learning', 'Early career income volatile'],
      roadmap: ['B.Com or BBA Finance', 'NISM/NCFM certifications', 'Learn Excel and financial modeling', 'Internship at brokerage firm', 'CFA Level 1 for global recognition', 'Build track record'],
      futureScope: 'India\'s Nifty growing at 12% CAGR. Demat accounts grew 10x in 5 years. Algorithmic trading, crypto regulation, and mutual fund SIPs creating massive new careers.',
      color: 'green',
    },
    {
      id: 'companysecretary',
      title: 'Company Secretary (CS)',
      icon: '🏛️',
      tagline: 'Be the legal backbone of corporations',
      description: 'Company Secretaries handle corporate governance, legal compliance and regulatory filings. Every listed company in India is legally required to have a CS. SEBI tightening rules means demand keeps rising.',
      salary: { entry: '₹4-8 LPA', mid: '₹8-20 LPA', senior: '₹20-40 LPA', top: '₹40 LPA+' },
      duration: '3-4 years',
      jobGrowth: '18% (Steady)',
      difficulty: 'Hard',
      scope: 'Very Good',
      topColleges: ['ICSI (self-study)', 'Any Commerce graduation as base', 'DU Commerce', 'Christ University', 'Symbiosis Commerce'],
      requiredExams: ['CS Foundation', 'CS Executive', 'CS Professional', 'ICSI membership'],
      specializations: ['Corporate Law', 'Securities Law', 'Mergers & Acquisitions', 'Corporate Governance', 'Foreign Exchange Management', 'Intellectual Property'],
      jobRoles: ['Company Secretary', 'Compliance Officer', 'Legal Advisor', 'Corporate Governance Manager', 'Board Secretary', 'Independent Director'],
      topRecruiters: ['All Listed Companies', 'BSE/NSE listed firms', 'Law Firms', 'Big 4', 'SEBI', 'Government Undertakings'],
      skills: ['Corporate Law', 'Companies Act', 'SEBI Regulations', 'Communication', 'Attention to Detail', 'Ethics'],
      pros: ['Legal mandate to hire CS', 'Recession-proof career', 'High respect in corporate world', 'Own practice option', 'Can combine with LLB for more power'],
      cons: ['Long exam path', 'Niche field with limited awareness', 'Lower salary ceiling than CA'],
      roadmap: ['Class 12 Commerce', 'CS Foundation after 12th', 'CS Executive during graduation', 'CS Professional', 'ICSI membership', 'Corporate job or practice'],
      futureScope: 'SEBI increasing listing requirements. IBC (Insolvency Code) creating new roles. Every new startup that grows needs a CS for IPO readiness.',
      color: 'slate',
    },
    {
      id: 'digitalmarketing',
      title: 'Digital Marketing & E-Commerce',
      icon: '📱',
      tagline: 'Grow brands in the digital age',
      description: 'India has 90 crore internet users and e-commerce growing at 27% annually. Every business needs digital marketers. One of the most accessible, high-growth careers that doesn\'t require a specific degree — skills matter more.',
      salary: { entry: '₹3-6 LPA', mid: '₹6-18 LPA', senior: '₹18-40 LPA', top: '₹40 LPA+' },
      duration: '3 years + certifications',
      jobGrowth: '30% (Booming)',
      difficulty: 'Easy-Medium',
      scope: 'Excellent',
      topColleges: ['MICA Ahmedabad', 'Symbiosis', 'Xavier Institute', 'NMIMS Marketing', 'Any BBA/BCom + Google Certifications'],
      requiredExams: ['Google Digital Marketing Cert', 'Meta Blueprint', 'HubSpot Certifications', 'CUET for top colleges'],
      specializations: ['SEO/SEM', 'Social Media Marketing', 'Content Marketing', 'Performance Marketing', 'Email Marketing', 'Influencer Marketing', 'E-Commerce Management'],
      jobRoles: ['Digital Marketing Manager', 'SEO Specialist', 'Performance Marketer', 'Content Strategist', 'Social Media Manager', 'E-Commerce Manager', 'Growth Hacker'],
      topRecruiters: ['Amazon', 'Flipkart', 'Myntra', 'Zomato', 'Swiggy', 'Startups', 'Ad Agencies', 'Any brand with online presence'],
      skills: ['SEO', 'Google Ads', 'Meta Ads', 'Analytics', 'Content Writing', 'Canva/Design Basics', 'Excel'],
      pros: ['Low barrier to entry', 'Freelancing potential from home', 'Salary grows fast with results', 'Works across every industry', 'Can start your own agency'],
      cons: ['Highly competitive', 'Algorithms change constantly', 'Difficult to show impact early', 'Commoditized at entry level'],
      roadmap: ['BBA/BCom or any graduation', 'Get Google & Meta certifications (free)', 'Build personal brand/blog', 'Freelance for small businesses', 'Specialize in performance marketing for highest pay'],
      futureScope: 'India\'s digital ad spend crossed ₹40,000 crore in 2025. AI tools like ChatGPT making content creation faster but human strategy more valuable.',
      color: 'violet',
    },
  ],
  Arts: [
    {
      id: 'upsc',
      title: 'Civil Services (UPSC/IAS)',
      icon: '🏛️',
      tagline: 'Serve the nation with power and purpose',
      description: 'Most prestigious government career in India. IAS/IPS officers shape national policy and governance.',
      salary: { entry: '₹7-10 LPA', mid: '₹10-20 LPA', senior: '₹20-40 LPA', top: '₹40 LPA + perks' },
      duration: '1-3 years preparation',
      jobGrowth: 'Stable (Government)',
      difficulty: 'Extremely Hard',
      scope: 'Excellent',
      topColleges: ['Any graduation', 'Jamia Millia', 'Delhi University', 'JNU', 'Hyderabad University'],
      requiredExams: ['UPSC CSE Prelims', 'UPSC CSE Mains', 'UPSC Interview', 'State PSC'],
      specializations: ['IAS (Administration)', 'IPS (Police)', 'IFS (Foreign Service)', 'IRS (Revenue)', 'State Services'],
      jobRoles: ['District Collector', 'SP of Police', 'Indian Ambassador', 'Joint Secretary', 'Revenue Officer'],
      topRecruiters: ['Government of India', 'State Governments', 'UN Organizations (IFS)'],
      skills: ['Current Affairs', 'History', 'Geography', 'Polity', 'Economics', 'Essay Writing', 'Leadership'],
      pros: ['Ultimate power and responsibility', 'Highest social prestige', 'Lifetime job security', 'Free housing & transport'],
      cons: ['Extremely hard exam (0.1% pass rate)', '2-3 years full-time preparation', 'Age limit (21-32 years)', 'Frequent transfers'],
      roadmap: ['Any graduation (any stream)', 'Start NCERT foundation', '2-3 years focused preparation', 'Clear Prelims + Mains', 'Personality test'],
      futureScope: 'Always relevant. IAS officers shaping Digital India, smart cities, policy reforms.',
      color: 'indigo',
    },
    {
      id: 'journalism',
      title: 'Journalism & Media',
      icon: '📰',
      tagline: 'Tell stories that change the world',
      description: 'Dynamic career for those who love writing, storytelling and being at the center of events. Digital media creating explosion of opportunities.',
      salary: { entry: '₹2-5 LPA', mid: '₹5-15 LPA', senior: '₹15-40 LPA', top: '₹40 LPA+' },
      duration: '3 years',
      jobGrowth: '20% (Digital boom)',
      difficulty: 'Medium',
      scope: 'Growing',
      topColleges: ['IIMC Delhi', 'AJK MCRC Jamia', 'Symbiosis Media', 'Xavier Institute', 'Asian College of Journalism'],
      requiredExams: ['DU JMC Entrance', 'IIMC Entrance', 'CUET', 'Symbiosis SET'],
      specializations: ['Print Journalism', 'TV Journalism', 'Digital Media', 'Photojournalism', 'Sports Journalism', 'Data Journalism'],
      jobRoles: ['Reporter', 'News Anchor', 'Content Creator', 'Editor', 'Documentary Filmmaker', 'PR Specialist', 'Podcast Host'],
      topRecruiters: ['NDTV', 'Times of India', 'The Hindu', 'Aaj Tak', 'BBC India', 'Vice Media', 'Digital Outlets'],
      skills: ['Writing', 'Communication', 'Research', 'Current Affairs', 'Video Editing', 'Social Media'],
      pros: ['Exciting and dynamic work', 'Social impact', 'Travel opportunities', 'Fame and recognition'],
      cons: ['Low starting salary', 'Irregular work hours', 'High pressure deadlines', 'Shrinking print media'],
      roadmap: ['Strong English + writing', 'BJC/BMS degree', 'Intern at media houses', 'Build portfolio', 'Specialization in digital media'],
      futureScope: 'YouTube, podcasts, newsletters, digital news explosion creating new media entrepreneurship opportunities.',
      color: 'pink',
    },
    {
      id: 'law',
      title: 'Law (LLB)',
      icon: '⚖️',
      tagline: 'Fight for justice and uphold rights',
      description: 'Prestigious profession with diverse opportunities from courtrooms to corporate boardrooms. Growing demand in India.',
      salary: { entry: '₹3-8 LPA', mid: '₹8-25 LPA', senior: '₹25-80 LPA', top: '₹1 Cr+' },
      duration: '5 years (BA LLB integrated)',
      jobGrowth: '18% (High)',
      difficulty: 'Hard',
      scope: 'Very Good',
      topColleges: ['NLU Delhi (NLS)', 'NALSAR Hyderabad', 'NLU Bangalore', 'Symbiosis Law', 'Amity Law School'],
      requiredExams: ['CLAT', 'AILET', 'LSAT India', 'SLAT', 'MH CET Law'],
      specializations: ['Criminal Law', 'Corporate Law', 'Constitutional Law', 'Cyber Law', 'Intellectual Property', 'International Law'],
      jobRoles: ['Advocate', 'Corporate Lawyer', 'Judge', 'Legal Advisor', 'Public Prosecutor', 'Legal Researcher', 'Law Professor'],
      topRecruiters: ['Supreme Court', 'High Courts', 'Amarchand Mangaldas', 'AZB Partners', 'Khaitan & Co', 'MNCs Legal Depts'],
      skills: ['Logical Reasoning', 'Research', 'Communication', 'Writing', 'Negotiation', 'Critical Thinking'],
      pros: ['Prestigious profession', 'High earning potential', 'Intellectual challenge', 'Social justice work'],
      cons: ['Long path to success', 'Competitive job market', 'Irregular income early on'],
      roadmap: ['Clear CLAT for NLU', '5 year BA LLB', 'Moot courts + internships', 'Enroll in Bar Council', 'Specialize in 1-2 areas'],
      futureScope: 'Cyber law, startup legal advisory, international arbitration, IP law growing massively in India.',
      color: 'amber',
    },
    {
      id: 'design',
      title: 'Design & Creative Arts',
      icon: '🎨',
      tagline: 'Create beauty and solve problems visually',
      description: 'Booming industry with India becoming a design and creative hub. UI/UX, graphic design, fashion and architecture all growing fast.',
      salary: { entry: '₹3-8 LPA', mid: '₹8-25 LPA', senior: '₹25-60 LPA', top: '₹60 LPA+' },
      duration: '4 years',
      jobGrowth: '28% (Booming)',
      difficulty: 'Medium',
      scope: 'Excellent',
      topColleges: ['NID Ahmedabad', 'IIT Bombay IDC', 'NIFT', 'Srishti', 'Pearl Academy', 'MIT Institute of Design'],
      requiredExams: ['NID Entrance', 'NIFT Entrance', 'UCEED (IIT)', 'CEED', 'NATA (Architecture)'],
      specializations: ['UI/UX Design', 'Graphic Design', 'Fashion Design', 'Interior Design', 'Industrial Design', 'Animation', 'Game Design'],
      jobRoles: ['UI/UX Designer', 'Product Designer', 'Fashion Designer', 'Art Director', 'Motion Designer', 'Brand Designer'],
      topRecruiters: ['Google', 'Myntra', 'Flipkart', 'Design Studios', 'Ad Agencies', 'Fashion Houses', 'Game Companies'],
      skills: ['Creativity', 'Visual Thinking', 'Sketching', 'Design Tools (Figma, Adobe)', 'User Research', 'Storytelling'],
      pros: ['Creative and fulfilling work', 'Growing salary packages', 'Freelance potential', 'Work with global brands'],
      cons: ['Portfolio-dependent', 'Subjective field', 'Requires constant upskilling'],
      roadmap: ['Build drawing/design skills', 'Clear NID/NIFT/UCEED', 'Focus on portfolio projects', 'Internships', 'Specialize in UI/UX for highest pay'],
      futureScope: 'Every app, product, brand needs great design. UI/UX designers most in demand in tech right now.',
      color: 'rose',
    },
    {
      id: 'psychology',
      title: 'Psychology & Counselling',
      icon: '🧠',
      tagline: 'Heal minds and transform lives',
      description: 'India\'s mental health crisis has created massive demand for psychologists and counsellors. Corporate wellness, school counselling, clinical therapy and organizational psychology are all booming. One of the most human and AI-resistant careers.',
      salary: { entry: '₹3-6 LPA', mid: '₹6-18 LPA', senior: '₹18-40 LPA', top: '₹40 LPA+' },
      duration: '3 years BSc + 2 years MSc',
      jobGrowth: '25% (Fast Growing)',
      difficulty: 'Medium',
      scope: 'Very Good',
      topColleges: ['Delhi University', 'Christ University', 'Fergusson College Pune', 'TISS Mumbai', 'Amity', 'Jamia Millia'],
      requiredExams: ['CUET', 'TISS NET', 'Delhi University Entrance', 'RCI Registration (Clinical)'],
      specializations: ['Clinical Psychology', 'Counselling Psychology', 'Organizational Psychology', 'Child Psychology', 'Sports Psychology', 'Neuropsychology', 'School Counselling'],
      jobRoles: ['Clinical Psychologist', 'Corporate Wellness Coach', 'School Counsellor', 'HR Business Partner', 'Therapist', 'Researcher', 'Mental Health Content Creator'],
      topRecruiters: ['Hospitals', 'MNCs (Corporate Wellness)', 'Schools & Colleges', 'NGOs', 'Government', 'Online Therapy Platforms (iCall, YourDOST)'],
      skills: ['Empathy', 'Active Listening', 'Communication', 'Research', 'Counselling Techniques', 'Ethics', 'Patience'],
      pros: ['Growing demand post-COVID', 'Deeply meaningful work', 'Private practice potential', 'Corporate wellness booming', 'Can work online globally'],
      cons: ['Long study path for clinical licensure', 'Emotionally draining', 'Private practice takes years to build', 'RCI registration required for clinical work'],
      roadmap: ['BSc Psychology', 'MSc Clinical/Counselling Psychology', 'RCI Registration', 'Internship at hospital or NGO', 'Specialization via PG Diploma', 'Private practice or corporate role'],
      futureScope: 'India has 1 psychologist per 83,000 people vs WHO recommended 1 per 1,000. Massive gap. Online therapy platforms growing 40% annually.',
      color: 'fuchsia',
    },
    {
      id: 'socialwork',
      title: 'Social Work & Development',
      icon: '🤝',
      tagline: 'Create real change in society',
      description: 'Professional social workers shape policy, run NGOs, work in corporate CSR, and lead development projects. With India\'s massive social challenges, trained development professionals are always in demand by INGOs, UN bodies, and government.',
      salary: { entry: '₹3-7 LPA', mid: '₹7-18 LPA', senior: '₹18-40 LPA', top: '₹40 LPA+' },
      duration: '3-4 years',
      jobGrowth: '15% (Steady)',
      difficulty: 'Medium',
      scope: 'Good',
      topColleges: ['TISS Mumbai', 'Delhi School of Social Work', 'Jamia Millia', 'Madras School of Social Work', 'Christ University'],
      requiredExams: ['TISS NET', 'CUET', 'Delhi University Entrance'],
      specializations: ['Community Development', 'Healthcare Social Work', 'NGO Management', 'Corporate CSR', 'Child Welfare', 'Disability Rehabilitation', 'Rural Development'],
      jobRoles: ['Social Worker', 'NGO Manager', 'CSR Head', 'Development Consultant', 'Policy Analyst', 'UN Programme Officer', 'Community Organizer'],
      topRecruiters: ['UNICEF', 'WHO', 'UNDP', 'CRY', 'HelpAge India', 'Tata Trusts', 'Government Social Departments'],
      skills: ['Communication', 'Empathy', 'Project Management', 'Research', 'Fundraising', 'Policy Knowledge', 'Leadership'],
      pros: ['Deeply meaningful work', 'UN/INGO opportunities globally', 'Diverse career paths', 'Government jobs available', 'Growing CSR sector'],
      cons: ['Lower starting salary', 'Emotionally demanding', 'Funding uncertainty in NGOs'],
      roadmap: ['BA Social Work or Sociology', 'MSW from TISS or equivalent', 'Internship with NGO or government', 'Specialization (health, child welfare, CSR)', 'International certifications for INGO roles'],
      futureScope: 'Corporate CSR spending mandated at 2% of profit for large companies. INGO and UN careers growing. Mental health and disability rights emerging specializations.',
      color: 'sky',
    },
    {
      id: 'teaching',
      title: 'Teaching & Education',
      icon: '👨‍🏫',
      tagline: 'Shape the next generation of India',
      description: 'One of the most stable and respected professions in India. NEP 2020 is transforming education, creating demand for skilled, modern educators. EdTech boom means teachers can also build online courses earning lakhs.',
      salary: { entry: '₹3-8 LPA', mid: '₹8-20 LPA', senior: '₹20-50 LPA', top: '₹50 LPA+' },
      duration: '3 years BA/BSc + 2 years B.Ed',
      jobGrowth: '18% (Steady)',
      difficulty: 'Medium',
      scope: 'Very Good',
      topColleges: ['Delhi University B.Ed', 'TISS', 'RIE (NCERT institutes)', 'Jamia Millia', 'IGNOU', 'Any state B.Ed college'],
      requiredExams: ['CTET', 'State TET', 'B.Ed Entrance', 'UGC NET (for college teaching)', 'KVS/NVS Recruitment'],
      specializations: ['School Teaching (Primary/Secondary)', 'College Teaching', 'Special Education', 'EdTech Content Creation', 'Curriculum Design', 'Educational Leadership'],
      jobRoles: ['School Teacher', 'College Lecturer', 'EdTech Educator', 'Curriculum Designer', 'School Principal', 'Online Tutor', 'Corporate Trainer'],
      topRecruiters: ['KVS', 'NVS', 'Government Schools', 'CBSE Private Schools', 'BYJU\'s', 'Unacademy', 'Vedantu', 'International Schools'],
      skills: ['Subject Expertise', 'Communication', 'Patience', 'Digital Tools', 'Classroom Management', 'Empathy', 'Creativity'],
      pros: ['Extremely stable career', 'Government job security + pension', 'Long vacations', 'EdTech allows lakhs/month extra income', 'Deep social impact'],
      cons: ['Lower private school salaries', 'CTET/TET required', 'Administrative burden increasing', 'Need to keep updating knowledge with NEP 2020'],
      roadmap: ['Graduation in any subject', 'B.Ed (2 years)', 'Clear CTET/State TET', 'Apply KVS/NVS for government', 'UGC NET for college teaching', 'Online course for EdTech income'],
      futureScope: 'NEP 2020 transforming entire education system. International schools growing 20%/year. Online tutoring market in India ₹7,000 crore and growing.',
      color: 'orange',
    },
  ],
};

const colorMap: any = {
  blue: { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-400', badge: 'bg-blue-500/20 text-blue-300' },
  red: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-300' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400', badge: 'bg-purple-500/20 text-purple-300' },
  green: { bg: 'bg-green-500/10', border: 'border-green-500/30', text: 'text-green-400', badge: 'bg-green-500/20 text-green-300' },
  yellow: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', badge: 'bg-yellow-500/20 text-yellow-300' },
  orange: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300' },
  teal: { bg: 'bg-teal-500/10', border: 'border-teal-500/30', text: 'text-teal-400', badge: 'bg-teal-500/20 text-teal-300' },
  indigo: { bg: 'bg-indigo-500/10', border: 'border-indigo-500/30', text: 'text-indigo-400', badge: 'bg-indigo-500/20 text-indigo-300' },
  pink: { bg: 'bg-pink-500/10', border: 'border-pink-500/30', text: 'text-pink-400', badge: 'bg-pink-500/20 text-pink-300' },
  amber: { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300' },
  rose: { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-400', badge: 'bg-rose-500/20 text-rose-300' },
  cyan: { bg: 'bg-cyan-500/10', border: 'border-cyan-500/30', text: 'text-cyan-400', badge: 'bg-cyan-500/20 text-cyan-300' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-300' },
  lime: { bg: 'bg-lime-500/10', border: 'border-lime-500/30', text: 'text-lime-400', badge: 'bg-lime-500/20 text-lime-300' },
  slate: { bg: 'bg-slate-500/10', border: 'border-slate-500/30', text: 'text-slate-400', badge: 'bg-slate-500/20 text-slate-300' },
  violet: { bg: 'bg-violet-500/10', border: 'border-violet-500/30', text: 'text-violet-400', badge: 'bg-violet-500/20 text-violet-300' },
  fuchsia: { bg: 'bg-fuchsia-500/10', border: 'border-fuchsia-500/30', text: 'text-fuchsia-400', badge: 'bg-fuchsia-500/20 text-fuchsia-300' },
  sky: { bg: 'bg-sky-500/10', border: 'border-sky-500/30', text: 'text-sky-400', badge: 'bg-sky-500/20 text-sky-300' },
};

export default function CareerGuidePage() {
  const router = useRouter();
  const [selectedStream, setSelectedStream] = useState<string>('Science');
  const [selectedCareer, setSelectedCareer] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [compareList, setCompareList] = useState<any[]>([]);
  const [showCompare, setShowCompare] = useState(false);
  const [loading, setLoading] = useState(false);

  const streams = Object.keys(careerData);
  const careers = careerData[selectedStream] || [];

  const filtered = searchQuery
    ? Object.values(careerData).flat().filter((c: any) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.specializations.some((s: string) => s.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : careers;

  const toggleCompare = (career: any) => {
    if (compareList.find(c => c.id === career.id)) {
      setCompareList(compareList.filter(c => c.id !== career.id));
    } else if (compareList.length < 3) {
      setCompareList([...compareList, career]);
    }
  };

  const handleCareerClick = (career: any) => {
    setLoading(true);
    setSelectedCareer(career);
    setTimeout(() => setLoading(false), 300);
  };

  const getDifficultyColor = (difficulty: string) => {
    if (difficulty.includes('Very Hard')) return 'text-red-400';
    if (difficulty.includes('Hard')) return 'text-orange-400';
    if (difficulty.includes('Medium')) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getScopeColor = (scope: string) => {
    if (scope === 'Outstanding') return 'text-purple-400';
    if (scope === 'Excellent') return 'text-green-400';
    if (scope === 'Good') return 'text-blue-400';
    return 'text-gray-400';
  };

  const getGrowthColor = (growth: string) => {
    if (growth.includes('Very High') || growth.includes('Booming')) return 'text-green-400';
    if (growth.includes('High') || growth.includes('20%') || growth.includes('25%') || growth.includes('28%')) return 'text-green-400';
    if (growth.includes('15%') || growth.includes('Steady')) return 'text-blue-400';
    if (growth.includes('10%')) return 'text-yellow-400';
    if (growth.includes('Stable')) return 'text-yellow-400';
    return 'text-gray-400';
  };

  if (selectedCareer) {
    const c = selectedCareer;
    const colors = colorMap[c.color];

    // Loading Skeleton
    if (loading) {
      return (
        <div className="min-h-screen bg-[#0F0F10] text-white p-6 max-w-4xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700/30 rounded-lg w-40" />
            <div className="h-40 bg-gray-700/30 rounded-2xl" />
            <div className="h-32 bg-gray-700/30 rounded-2xl" />
            <div className="grid grid-cols-2 gap-6">
              <div className="h-24 bg-gray-700/30 rounded-2xl" />
              <div className="h-24 bg-gray-700/30 rounded-2xl" />
            </div>
            <div className="h-48 bg-gray-700/30 rounded-2xl" />
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-[#0F0F10] text-white p-6 max-w-4xl mx-auto">
        <button onClick={() => setSelectedCareer(null)}
          className="text-purple-400 hover:text-purple-300 text-sm mb-6 flex items-center gap-2">
          ← Back to Career Guide
        </button>

        {/* Hero */}
        <div className={`${colors.bg} border ${colors.border} rounded-2xl p-8 mb-6`}>
          <div className="flex items-start gap-4">
            <span className="text-5xl">{c.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-white">{c.title}</h1>
              <p className={`${colors.text} font-medium mt-1`}>{c.tagline}</p>
              <p className="text-gray-400 mt-3 leading-relaxed">{c.description}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Duration', value: c.duration, icon: '📅' },
              { label: 'Job Growth', value: c.jobGrowth, icon: '📈' },
              { label: 'Difficulty', value: c.difficulty, icon: '🎯' },
              { label: 'Scope', value: c.scope, icon: '🌟' },
            ].map((stat, i) => (
              <div key={i} className="bg-[#0F0F10]/50 rounded-xl p-3 text-center">
                <div className="text-xl mb-1">{stat.icon}</div>
                <div className="text-white font-semibold text-sm">{stat.value}</div>
                <div className="text-gray-500 text-xs">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Salary Ladder */}
        <div className="bg-[#1A1A1E] rounded-2xl p-6 mb-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4">💰 Salary at Each Stage</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { stage: 'Entry Level', salary: c.salary.entry, years: '0-3 years' },
              { stage: 'Mid Level', salary: c.salary.mid, years: '3-7 years' },
              { stage: 'Senior Level', salary: c.salary.senior, years: '7-15 years' },
              { stage: 'Top Level', salary: c.salary.top, years: '15+ years' },
            ].map((s, i) => (
              <div key={i} className={`${colors.bg} border ${colors.border} rounded-xl p-4 text-center`}>
                <div className={`text-lg font-bold ${colors.text}`}>{s.salary}</div>
                <div className="text-white text-sm font-medium mt-1">{s.stage}</div>
                <div className="text-gray-500 text-xs">{s.years}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Roadmap */}
        <div className="bg-[#1A1A1E] rounded-2xl p-6 mb-6 border border-gray-700/50">
          <h2 className="text-xl font-semibold mb-4">🗺️ Step-by-Step Roadmap</h2>
          <div className="space-y-3">
            {c.roadmap.map((step: string, i: number) => (
              <div key={i} className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full ${colors.bg} border ${colors.border} flex items-center justify-center text-sm font-bold ${colors.text} flex-shrink-0`}>
                  {i + 1}
                </div>
                <div className="bg-[#0F0F10] rounded-xl px-4 py-3 flex-1">
                  <p className="text-gray-300 text-sm">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Specializations + Job Roles */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1A1A1E] rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold mb-4">🎓 Specializations</h2>
            <div className="flex flex-wrap gap-2">
              {c.specializations.map((s: string, i: number) => (
                <span key={i} className={`${colors.badge} text-xs px-3 py-1.5 rounded-full`}>{s}</span>
              ))}
            </div>
          </div>
          <div className="bg-[#1A1A1E] rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold mb-4">💼 Job Roles</h2>
            <div className="flex flex-wrap gap-2">
              {c.jobRoles.map((r: string, i: number) => (
                <span key={i} className="bg-gray-700/50 text-gray-300 text-xs px-3 py-1.5 rounded-full">{r}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Colleges + Exams */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1A1A1E] rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold mb-4">🏫 Top Colleges</h2>
            <ul className="space-y-2">
              {c.topColleges.map((col: string, i: number) => (
                <li key={i} className="flex items-center gap-2 text-gray-300 text-sm">
                  <span className={`w-2 h-2 rounded-full ${colors.text} bg-current`}></span>
                  {col}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#1A1A1E] rounded-2xl p-6 border border-gray-700/50">
            <h2 className="text-lg font-semibold mb-4">📝 Required Exams</h2>
            <div className="flex flex-wrap gap-2">
              {c.requiredExams.map((exam: string, i: number) => (
                <span key={i} className={`${colors.badge} text-xs px-3 py-1.5 rounded-full font-medium`}>{exam}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="bg-[#1A1A1E] rounded-2xl p-6 mb-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold mb-4">🧠 Key Skills Required</h2>
          <div className="flex flex-wrap gap-2">
            {c.skills.map((skill: string, i: number) => (
              <span key={i} className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1.5 rounded-full">{skill}</span>
            ))}
          </div>
        </div>

        {/* Top Recruiters */}
        <div className="bg-[#1A1A1E] rounded-2xl p-6 mb-6 border border-gray-700/50">
          <h2 className="text-lg font-semibold mb-4">🏢 Top Recruiters</h2>
          <div className="flex flex-wrap gap-2">
            {c.topRecruiters.map((r: string, i: number) => (
              <span key={i} className="bg-gray-700 text-gray-300 text-xs px-3 py-1.5 rounded-full">{r}</span>
            ))}
          </div>
        </div>

        {/* Pros and Cons */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-[#1A1A1E] rounded-2xl p-6 border border-green-500/20">
            <h2 className="text-lg font-semibold text-green-400 mb-4">✅ Pros</h2>
            <ul className="space-y-2">
              {c.pros.map((pro: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-green-400 mt-0.5">+</span>{pro}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-[#1A1A1E] rounded-2xl p-6 border border-red-500/20">
            <h2 className="text-lg font-semibold text-red-400 mb-4">❌ Cons</h2>
            <ul className="space-y-2">
              {c.cons.map((con: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                  <span className="text-red-400 mt-0.5">−</span>{con}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Future Scope */}
        <div className={`${colors.bg} border ${colors.border} rounded-2xl p-6 mb-6`}>
          <h2 className="text-lg font-semibold mb-2">🚀 Future Scope</h2>
          <p className="text-gray-300 leading-relaxed">{c.futureScope}</p>
        </div>

        {/* AI Career Chat CTA */}
        <div className="bg-gradient-to-r from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-2xl p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">🤖 Ask AI About This Career</h2>
          <p className="text-gray-400 text-sm mb-4">Get personalized advice about {c.title} from Learnova AI</p>
          <button
            onClick={() => router.push(`/chat?prompt=Tell me everything about career in ${c.title} for an Indian student`)}
            className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-colors"
          >
            Chat with AI About {c.title}
          </button>
        </div>
      </div>
    );
  }

  // Compare View
  if (showCompare && compareList.length >= 2) {
    return (
      <div className="min-h-screen bg-[#0F0F10] text-white p-6 max-w-5xl mx-auto">
        <button onClick={() => setShowCompare(false)}
          className="text-purple-400 hover:text-purple-300 text-sm mb-6 flex items-center gap-2">
          ← Back to Career Guide
        </button>
        <h1 className="text-2xl font-bold mb-6">📊 Career Comparison</h1>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr>
                <th className="text-left text-gray-400 text-sm pb-4 w-40">Factor</th>
                {compareList.map((c) => (
                  <th key={c.id} className="text-center pb-4">
                    <div className="text-2xl">{c.icon}</div>
                    <div className="text-white font-semibold text-sm mt-1">{c.title}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="space-y-2">
              {[
                { label: 'Entry Salary', key: (c: any) => c.salary.entry },
                { label: 'Top Salary', key: (c: any) => c.salary.top },
                { label: 'Duration', key: (c: any) => c.duration },
                { label: 'Difficulty', key: (c: any) => c.difficulty },
                { label: 'Job Growth', key: (c: any) => c.jobGrowth },
                { label: 'Scope', key: (c: any) => c.scope },
              ].map((row, i) => (
                <tr key={i} className="border-t border-gray-700/50">
                  <td className="text-gray-400 text-sm py-3">{row.label}</td>
                  {compareList.map((c) => (
                    <td key={c.id} className="text-center py-3 text-white text-sm font-medium">{row.key(c)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Career Guide</h1>
        <p className="text-gray-400 mt-1">Explore careers, salaries, roadmaps and more for Indian students</p>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search careers, specializations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-[#1A1A1E] border border-gray-700/50 rounded-xl px-5 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors"
        />
        <span className="absolute right-4 top-3.5 text-gray-500">🔍</span>
      </div>

      {/* Compare Banner */}
      {compareList.length > 0 && (
        <div className="bg-purple-600/20 border border-purple-500/30 rounded-xl p-4 mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-purple-400 font-medium">Comparing {compareList.length} careers:</span>
            {compareList.map(c => <span key={c.id} className="text-white text-sm bg-purple-500/20 px-2 py-1 rounded-lg">{c.icon} {c.title}</span>)}
          </div>
          <div className="flex gap-2">
            {compareList.length >= 2 && (
              <button onClick={() => setShowCompare(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors">
                Compare Now
              </button>
            )}
            <button onClick={() => setCompareList([])}
              className="text-gray-400 hover:text-white text-sm px-3 py-2">
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      {!searchQuery && (
        <div className="flex gap-2 mb-6">
          {(['Science', 'Commerce', 'Arts'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedStream(tab)}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all ${
                selectedStream === tab
                  ? 'bg-purple-600 text-white'
                  : 'bg-[#1A1A1E] text-gray-400 hover:text-white border border-gray-700/50'
              }`}
            >
              {tab === 'Science' ? '🔬' : tab === 'Commerce' ? '💰' : '🎭'} {tab}
            </button>
          ))}
        </div>
      )}

      {/* Career Cards Grid */}
      <div className="grid md:grid-cols-2 gap-5">
        {filtered.map((career: any) => {
          const colors = colorMap[career.color];
          const isInCompare = compareList.find(c => c.id === career.id);
          return (
            <div
              key={career.id}
              className={`bg-[#1A1A1E] border rounded-2xl p-6 cursor-pointer hover:border-purple-500/50 transition-all duration-200 hover:scale-[1.01] ${
                isInCompare ? 'border-purple-500' : 'border-gray-700/50'
              }`}
              onClick={() => handleCareerClick(career)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{career.icon}</span>
                  <div>
                    <h3 className="font-semibold text-white">{career.title}</h3>
                    <p className={`text-xs ${colors.text}`}>{career.tagline}</p>
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); toggleCompare(career); }}
                  className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                    isInCompare
                      ? 'bg-purple-500/20 border-purple-500 text-purple-300'
                      : 'border-gray-600 text-gray-500 hover:border-purple-500 hover:text-purple-400'
                  }`}
                >
                  {isInCompare ? '✓ Added' : '+ Compare'}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className={`${colors.bg} rounded-xl p-3`}>
                  <p className="text-gray-500 text-xs">Entry Salary</p>
                  <p className={`${colors.text} font-bold text-sm`}>{career.salary.entry}</p>
                </div>
                <div className={`${colors.bg} rounded-xl p-3`}>
                  <p className="text-gray-500 text-xs">Top Salary</p>
                  <p className={`${colors.text} font-bold text-sm`}>{career.salary.top}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                <span>⏱️ {career.duration}</span>
                <span>📈 {career.jobGrowth}</span>
                <span>🎯 {career.difficulty}</span>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {career.requiredExams.slice(0, 3).map((exam: string, i: number) => (
                  <span key={i} className={`${colors.badge} text-xs px-2 py-1 rounded-lg`}>{exam}</span>
                ))}
                {career.requiredExams.length > 3 && (
                  <span className="text-gray-500 text-xs px-2 py-1">+{career.requiredExams.length - 3} more</span>
                )}
              </div>

              <button className={`w-full ${colors.bg} border ${colors.border} ${colors.text} py-2 rounded-xl text-sm font-medium hover:opacity-80 transition-opacity`}>
                View Full Details →
              </button>
            </div>
          );
        })}
      </div>

      {/* AI Career Counselor CTA */}
      <div className="mt-8 bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🤖</div>
        <h2 className="text-xl font-bold mb-2">Not sure which career is right for you?</h2>
        <p className="text-gray-400 text-sm mb-5">Tell Learnova AI your interests, strengths and goals — get a personalized career recommendation</p>
        <button
          onClick={() => router.push('/chat?prompt=Help me choose the right career based on my interests and strengths')}
          className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-xl font-medium transition-colors"
        >
          Get AI Career Counseling
        </button>
      </div>
    </div>
  );
}
