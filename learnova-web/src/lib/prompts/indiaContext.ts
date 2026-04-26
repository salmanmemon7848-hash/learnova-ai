// India-specific context for Learnova AI

export const INDIAN_EXAM_PATTERNS = {
  CBSE: {
    name: 'CBSE Board Exams',
    subjects: ['Physics', 'Chemistry', 'Mathematics', 'Biology', 'English', 'Social Science'],
    markingScheme: 'Theory + Practical',
    grades: 'Class 9-12',
  },
  JEE_MAINS: {
    name: 'JEE Main',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    totalQuestions: 75,
    markingScheme: '+4 correct, -1 incorrect',
    duration: '3 hours',
    conductingBody: 'NTA',
  },
  JEE_ADVANCED: {
    name: 'JEE Advanced',
    subjects: ['Physics', 'Chemistry', 'Mathematics'],
    pattern: 'Paper 1 + Paper 2',
    conductingBody: 'IITs (rotating)',
  },
  NEET: {
    name: 'NEET UG',
    subjects: ['Physics', 'Chemistry', 'Biology (Botany + Zoology)'],
    totalQuestions: 180,
    markingScheme: '+4 correct, -1 incorrect',
    duration: '3 hours 20 minutes',
    conductingBody: 'NTA',
  },
  UPSC_PRELIMS: {
    name: 'UPSC Civil Services Prelims',
    papers: ['General Studies Paper I', 'CSAT Paper II'],
    totalQuestions: 200,
    markingScheme: '+2 correct, -0.66 incorrect (GS), +2.5 correct, -0.83 incorrect (CSAT)',
    conductingBody: 'UPSC',
  },
  SSC_CGL: {
    name: 'SSC CGL',
    subjects: ['General Intelligence', 'Quantitative Aptitude', 'English', 'General Awareness'],
    conductingBody: 'SSC',
  },
}

export const GOVERNMENT_SCHEMES = {
  education: [
    {
      name: 'National Scholarship Portal',
      url: 'https://scholarships.gov.in',
      description: 'Central government scholarships for students',
    },
    {
      name: 'PM Vidyalaxmi Scheme',
      description: 'Education loans for higher education without collateral',
    },
    {
      name: 'Digital India Bhashini',
      description: 'AI-powered language translation for education',
    },
  ],
  startup: [
    {
      name: 'Startup India',
      url: 'https://www.startupindia.gov.in',
      description: 'Tax exemptions, funding support, and mentorship for startups',
      benefits: ['3-year tax holiday', 'Self-certification compliance', 'Fast-track patent application'],
    },
    {
      name: 'Mudra Loan',
      description: 'Loans up to ₹10 lakhs for small businesses',
      categories: ['Shishu (up to ₹50,000)', 'Kishore (₹50,000 - ₹5 lakhs)', 'Tarun (₹5-10 lakhs)'],
    },
    {
      name: 'PM Vishwakarma Yojana',
      description: 'Support for traditional artisans and craftspeople',
      benefits: ['₹15,000 toolkit incentive', '₹1 lakh collateral-free loan', 'Skill training'],
    },
    {
      name: 'MSME Registration',
      description: 'Benefits for micro, small, and medium enterprises',
      benefits: ['Priority sector lending', 'Tax rebates', 'Patent registration subsidy'],
    },
    {
      name: 'Stand-Up India',
      description: 'Loans for SC/ST and women entrepreneurs',
      loanAmount: '₹10 lakhs to ₹1 crore',
    },
  ],
}

export const INDIAN_BUSINESS_CONTEXT = {
  paymentSystems: ['UPI (GPay, PhonePe, Paytm)', 'NEFT/RTGS', 'Cash on Delivery', 'Wallets'],
  ecommercePlatforms: ['Shopify India', 'WooCommerce', 'Meesho', 'Flipkart Seller', 'Amazon India'],
  complianceBasics: {
    gst: {
      threshold: '₹40 lakhs (goods), ₹20 lakhs (services)',
      composition: 'Available for turnover up to ₹1.5 crores',
      rates: ['0%', '5%', '12%', '18%', '28%'],
    },
    registrations: ['GST Registration', 'Shop & Establishment Act', 'FSSAI (for food)', 'Trade License'],
    taxRegime: ['Old Regime (with deductions)', 'New Regime (lower rates, fewer deductions)'],
  },
  marketInsights: {
    tier1Cities: ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata'],
    tier2Cities: ['Indore', 'Bhopal', 'Lucknow', 'Patna', 'Surat', 'Nagpur', 'Jaipur', 'Chandigarh'],
    digitalPenetration: '700M+ internet users, 95% UPI adoption in urban areas',
    consumerBehavior: 'Price-sensitive, value-conscious, WhatsApp-first communication',
  },
}

export const NCERT_SUBJECTS = {
  Physics: {
    class9: ['Motion', 'Force and Laws of Motion', 'Gravitation', 'Work and Energy', 'Sound'],
    class10: ['Light - Reflection and Refraction', 'Electricity', 'Magnetic Effects of Electric Current'],
    class11: ['Kinematics', 'Laws of Motion', 'Work, Energy and Power', 'Rotational Motion', 'Gravitation'],
    class12: ['Electrostatics', 'Current Electricity', 'Magnetism', 'Optics', 'Modern Physics'],
  },
  Chemistry: {
    class9: ['Atoms and Molecules', 'Structure of Atom', 'Isotopes'],
    class10: ['Chemical Reactions and Equations', 'Acids, Bases and Salts', 'Metals and Non-metals'],
    class11: ['Some Basic Concepts of Chemistry', 'Structure of Atom', 'Chemical Bonding', 'Thermodynamics'],
    class12: ['Solutions', 'Electrochemistry', 'Chemical Kinetics', 'Organic Chemistry', 'Inorganic Chemistry'],
  },
  Mathematics: {
    class9: ['Number System', 'Polynomials', 'Coordinate Geometry', 'Heron\'s Formula'],
    class10: ['Real Numbers', 'Polynomials', 'Quadratic Equations', 'Trigonometry', 'Statistics'],
    class11: ['Sets', 'Relations and Functions', 'Trigonometric Functions', 'Calculus Basics'],
    class12: ['Integrals', 'Differential Equations', 'Vector Algebra', 'Probability', 'Linear Programming'],
  },
  Biology: {
    class9: ['The Fundamental Unit of Life', 'Tissues', 'Diversity in Living Organisms'],
    class10: ['Life Processes', 'Control and Coordination', 'Heredity and Evolution'],
    class11: ['Diversity in Living World', 'Plant Physiology', 'Human Physiology'],
    class12: ['Reproduction', 'Genetics and Evolution', 'Biotechnology', 'Ecology'],
  },
}

export const INDIAN_CULTURAL_CONTEXT = {
  analogies: [
    'Like cricket - you need to understand the basics before playing big shots',
    'Think of it like making chai - the proportions matter more than the ingredients',
    'Similar to Bollywood - there\'s a formula, but creativity makes it special',
    'Like Indian railways - complex but runs on a system',
    'Just like bargaining in a local market - practice makes perfect',
  ],
  motivational: [
    'Arjun ne bhi ek pointed focus se target kiya tha 🎯',
    'Remember: Ratan Tata started with nothing but built an empire',
    'APJ Abdul Kalam failed many exams but never gave up',
    'Shah Rukh Khan came from nowhere with just determination',
    'Every topper was once a beginner who didn\'t quit',
  ],
}
