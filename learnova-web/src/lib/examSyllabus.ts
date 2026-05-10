// ═══════════════════════════════════════════════════════════
// THINKIOR — Indian Exam Syllabus Map
// Used by: Practice Tests page + /api/exam route
// ═══════════════════════════════════════════════════════════

export type QuestionType = 'MCQ' | 'Numerical';

export interface ExamConfig {
  category: string;
  questionTypes: QuestionType[];
  subjects: Record<string, string[]>;
}

export const EXAM_SYLLABUS: Record<string, ExamConfig> = {
  // ── Engineering Entrance ───────────────────────────────
  'JEE Main': {
    category: 'Engineering Entrance',
    questionTypes: ['MCQ', 'Numerical'],
    subjects: {
      Physics: [
        'Mechanics', 'Electrostatics', 'Current Electricity', 'Optics',
        'Modern Physics', 'Thermodynamics', 'Magnetic Effects', 'Waves',
        'Kinematics', 'Laws of Motion', 'Work, Energy & Power', 'Gravitation',
      ],
      Chemistry: [
        'Chemical Bonding', 'Equilibrium', 'Organic Chemistry (GOC)',
        'Hydrocarbons', 'Coordination Compounds', 'Electrochemistry',
        'p-block Elements', 'd-block Elements', 'Thermodynamics',
        'Atomic Structure', 'Solid State', 'Solutions',
      ],
      Mathematics: [
        'Calculus (Limits)', 'Calculus (Derivatives)', 'Calculus (Integration)',
        'Coordinate Geometry', 'Complex Numbers', 'Matrices & Determinants',
        'Probability', 'Vectors & 3D', 'Trigonometry', 'Sequences & Series',
        'Binomial Theorem', 'Permutations & Combinations',
      ],
    },
  },

  'JEE Advanced': {
    category: 'Engineering Entrance',
    questionTypes: ['MCQ', 'Numerical'],
    subjects: {
      Physics: [
        'Mechanics', 'Electrostatics', 'Current Electricity', 'Optics',
        'Modern Physics', 'Thermodynamics', 'Magnetic Effects', 'Waves & Sound',
        'Rotation & Rigid Bodies', 'Fluid Mechanics',
      ],
      Chemistry: [
        'Chemical Bonding', 'Equilibrium', 'Organic Reactions',
        'Coordination Compounds', 'Electrochemistry', 'p-block Elements',
        'd-block Elements', 'Thermochemistry', 'Nuclear Chemistry',
      ],
      Mathematics: [
        'Calculus', 'Coordinate Geometry', 'Algebra', 'Vectors & 3D',
        'Trigonometry', 'Probability', 'Matrices', 'Complex Numbers',
        'Differential Equations', 'Permutations & Combinations',
      ],
    },
  },

  // ── Medical Entrance ───────────────────────────────────
  'NEET UG': {
    category: 'Medical Entrance',
    questionTypes: ['MCQ'],
    subjects: {
      Physics: [
        'Mechanics', 'Electrostatics', 'Optics', 'Modern Physics',
        'Current Electricity', 'Thermodynamics', 'Waves',
      ],
      Chemistry: [
        'Chemical Bonding', 'Biomolecules', 'Polymers', 'Organic Reactions',
        'Coordination Compounds', 'Equilibrium', 'Electrochemistry',
        'Atomic Structure', 'p-block Elements', 'Thermodynamics',
      ],
      Biology: [
        'Cell Biology', 'Genetics & Evolution', 'Human Physiology',
        'Plant Physiology', 'Ecology', 'Reproduction',
        'Biotechnology', 'Diversity in Living World',
      ],
    },
  },

  // ── Government / Civil Services ────────────────────────
  'UPSC CSE Prelims': {
    category: 'Civil Services',
    questionTypes: ['MCQ'],
    subjects: {
      'General Studies I': [
        'History of India', 'Indian Culture & Heritage', 'Indian Geography',
        'Indian Polity & Governance', 'Economic Development', 'Current Events',
        'Environment & Ecology', 'Science & Technology', 'Indian Society',
      ],
      'CSAT (Paper II)': [
        'Reading Comprehension', 'Logical Reasoning', 'Quantitative Aptitude',
        'Data Interpretation', 'Decision Making', 'General Mental Ability',
      ],
    },
  },

  'SSC CGL': {
    category: 'Government Exams',
    questionTypes: ['MCQ'],
    subjects: {
      'General Intelligence & Reasoning': [
        'Analogies', 'Classification', 'Series', 'Coding-Decoding',
        'Puzzles', 'Syllogism', 'Blood Relations', 'Non-verbal Reasoning',
        'Statement & Conclusions',
      ],
      'General Awareness': [
        'History', 'Geography', 'Polity', 'Economy', 'General Science', 'Current Affairs',
      ],
      'Quantitative Aptitude': [
        'Arithmetic', 'Algebra', 'Geometry', 'Trigonometry',
        'Data Interpretation', 'Number System', 'Percentage', 'Profit & Loss',
      ],
      'English Language': [
        'Grammar', 'Vocabulary', 'Reading Comprehension', 'Error Detection',
        'Sentence Correction', 'Idioms & Phrases',
      ],
    },
  },

  'SSC CHSL': {
    category: 'Government Exams',
    questionTypes: ['MCQ'],
    subjects: {
      'General Intelligence': [
        'Analogies', 'Classification', 'Series', 'Coding-Decoding', 'Non-verbal Reasoning',
      ],
      'General Awareness': [
        'History', 'Geography', 'Polity', 'Economy', 'General Science', 'Current Affairs',
      ],
      'Quantitative Aptitude': [
        'Arithmetic', 'Algebra', 'Geometry', 'Data Interpretation',
      ],
      'English Language': [
        'Grammar', 'Vocabulary', 'Reading Comprehension', 'Error Detection',
      ],
    },
  },

  'IBPS PO': {
    category: 'Banking Exams',
    questionTypes: ['MCQ'],
    subjects: {
      'Reasoning Ability': [
        'Puzzles', 'Seating Arrangement', 'Blood Relations', 'Syllogism',
        'Coding-Decoding', 'Inequality', 'Direction Sense', 'Input-Output',
      ],
      'Quantitative Aptitude': [
        'Data Interpretation', 'Number Series', 'Simplification', 'Percentage',
        'Profit & Loss', 'Time & Work', 'Time, Speed & Distance',
      ],
      'English Language': [
        'Reading Comprehension', 'Cloze Test', 'Error Detection',
        'Sentence Rearrangement', 'Fill in the Blanks',
      ],
      'General Awareness': [
        'Banking Awareness', 'Financial Awareness', 'Current Affairs', 'Static GK',
      ],
    },
  },

  'IBPS Clerk': {
    category: 'Banking Exams',
    questionTypes: ['MCQ'],
    subjects: {
      'Reasoning Ability': [
        'Puzzles', 'Seating Arrangement', 'Blood Relations', 'Syllogism', 'Coding-Decoding',
      ],
      'Quantitative Aptitude': [
        'Simplification', 'Number Series', 'Data Interpretation', 'Arithmetic',
      ],
      'English Language': [
        'Reading Comprehension', 'Error Detection', 'Fill in the Blanks', 'Cloze Test',
      ],
      'General Awareness': [
        'Banking Awareness', 'Current Affairs', 'Static GK',
      ],
    },
  },

  'RRB NTPC': {
    category: 'Government Exams',
    questionTypes: ['MCQ'],
    subjects: {
      'General Awareness': [
        'History', 'Geography', 'Polity', 'Economy', 'Science', 'Current Affairs', 'Railways GK',
      ],
      'Mathematics': [
        'Number System', 'Fractions', 'Percentage', 'Profit & Loss',
        'Time & Work', 'Geometry', 'Trigonometry', 'Data Interpretation',
      ],
      'General Intelligence & Reasoning': [
        'Analogies', 'Alphabetical Series', 'Coding-Decoding',
        'Puzzles', 'Statement & Conclusions', 'Blood Relations',
      ],
    },
  },

  'NDA': {
    category: 'Defence Exams',
    questionTypes: ['MCQ'],
    subjects: {
      Mathematics: [
        'Algebra', 'Trigonometry', 'Calculus', 'Coordinate Geometry',
        'Statistics', 'Vectors', 'Matrices',
      ],
      'General Ability Test': [
        'English Grammar', 'Reading Comprehension', 'Physics', 'Chemistry',
        'Biology', 'History', 'Geography', 'Current Events',
      ],
    },
  },

  'CUET': {
    category: 'Central University',
    questionTypes: ['MCQ'],
    subjects: {
      'Language (English)': [
        'Reading Comprehension', 'Vocabulary', 'Grammar', 'Verbal Ability',
      ],
      'Domain — Science': [
        'Physics', 'Chemistry', 'Mathematics', 'Biology',
      ],
      'Domain — Commerce': [
        'Accountancy', 'Business Studies', 'Economics', 'Mathematics',
      ],
      'Domain — Arts': [
        'History', 'Geography', 'Political Science', 'Economics', 'Sociology',
      ],
      'General Test': [
        'General Knowledge', 'Current Affairs', 'Quantitative Reasoning', 'Logical Reasoning',
      ],
    },
  },

  // ── State Level ────────────────────────────────────────
  'MHT-CET': {
    category: 'State Level — Maharashtra',
    questionTypes: ['MCQ', 'Numerical'],
    subjects: {
      Physics: [
        'Circular Motion', 'Gravitation', 'Rotational Motion', 'Oscillations',
        'Electrostatics', 'Current Electricity', 'Magnetic Effects', 'EMI', 'Optics', 'Modern Physics',
      ],
      Chemistry: [
        'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics',
        'Organic Chemistry', 'Coordination Compounds', 'p-block Elements',
      ],
      Mathematics: [
        'Trigonometric Functions', 'Pair of Lines', 'Circles', 'Conics',
        'Vectors', '3D Geometry', 'Linear Programming', 'Probability',
      ],
    },
  },

  'KCET': {
    category: 'State Level — Karnataka',
    questionTypes: ['MCQ'],
    subjects: {
      Physics: [
        'Mechanics', 'Thermodynamics', 'Electrostatics', 'Current Electricity', 'Optics', 'Modern Physics',
      ],
      Chemistry: [
        'Chemical Bonding', 'Equilibrium', 'Organic Chemistry', 'Electrochemistry', 'Coordination Compounds',
      ],
      Mathematics: [
        'Calculus', 'Algebra', 'Coordinate Geometry', 'Probability', 'Vectors',
      ],
      Biology: [
        'Cell Biology', 'Genetics', 'Human Physiology', 'Plant Physiology', 'Ecology',
      ],
    },
  },

  'WBJEE': {
    category: 'State Level — West Bengal',
    questionTypes: ['MCQ'],
    subjects: {
      Mathematics: [
        'Algebra', 'Trigonometry', 'Calculus', 'Coordinate Geometry', 'Probability', 'Vectors',
      ],
      Physics: [
        'Mechanics', 'Electrostatics', 'Current Electricity', 'Optics', 'Modern Physics', 'Thermodynamics',
      ],
      Chemistry: [
        'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry', 'Coordination Compounds',
      ],
    },
  },

  'COMEDK': {
    category: 'State Level — Karnataka',
    questionTypes: ['MCQ'],
    subjects: {
      Physics: [
        'Mechanics', 'Electrostatics', 'Current Electricity', 'Optics', 'Modern Physics',
      ],
      Chemistry: [
        'Physical Chemistry', 'Organic Chemistry', 'Inorganic Chemistry',
      ],
      Mathematics: [
        'Calculus', 'Algebra', 'Trigonometry', 'Coordinate Geometry',
      ],
    },
  },

  // ── Board Exams ────────────────────────────────────────
  'CBSE Class 10': {
    category: 'Board Exams',
    questionTypes: ['MCQ'],
    subjects: {
      Mathematics: [
        'Real Numbers', 'Polynomials', 'Pair of Linear Equations', 'Quadratic Equations',
        'Arithmetic Progressions', 'Triangles', 'Coordinate Geometry', 'Trigonometry',
        'Circles', 'Surface Areas & Volumes', 'Statistics', 'Probability',
      ],
      Science: [
        'Chemical Reactions', 'Acids, Bases & Salts', 'Metals & Non-metals',
        'Carbon Compounds', 'Life Processes', 'Reproduction', 'Heredity & Evolution',
        'Light', 'Electricity', 'Magnetic Effects of Current',
      ],
      'Social Science': [
        'Nationalism in India', 'Rise of Nationalism in Europe', 'Age of Industrialisation',
        'Resources & Development', 'Water Resources', 'Democratic Politics',
        'Development', 'Money & Credit', 'Consumer Rights',
      ],
      English: [
        'Reading Comprehension', 'Grammar', 'Letter Writing', 'Literature (First Flight)',
        'Literature (Footprints Without Feet)',
      ],
    },
  },

  'CBSE Class 12': {
    category: 'Board Exams',
    questionTypes: ['MCQ'],
    subjects: {
      Physics: [
        'Electrostatics', 'Current Electricity', 'Magnetism', 'EMI & AC Circuits',
        'Optics', 'Modern Physics', 'Semiconductors', 'Communication Systems',
      ],
      Chemistry: [
        'Solid State', 'Solutions', 'Electrochemistry', 'Chemical Kinetics',
        'Surface Chemistry', 'Organic Compounds', 'Biomolecules', 'Polymers',
      ],
      Mathematics: [
        'Relations & Functions', 'Inverse Trigonometry', 'Matrices', 'Determinants',
        'Continuity & Differentiability', 'Applications of Derivatives',
        'Integrals', 'Differential Equations', 'Vectors', '3D Geometry',
        'Linear Programming', 'Probability',
      ],
      Biology: [
        'Reproduction', 'Genetics & Evolution', 'Human Health & Disease',
        'Biotechnology', 'Ecology', 'Biodiversity',
      ],
      Accountancy: [
        'Partnership Accounts', 'Company Accounts', 'Cash Flow Statement',
        'Analysis of Financial Statements', 'Accounting Ratios',
      ],
      Economics: [
        'National Income', 'Money & Banking', 'Balance of Payments',
        'Determination of Income', 'Market Equilibrium',
      ],
    },
  },

  'ICSE Class 10': {
    category: 'Board Exams',
    questionTypes: ['MCQ'],
    subjects: {
      Mathematics: [
        'Commercial Mathematics', 'Algebra', 'Geometry', 'Mensuration',
        'Trigonometry', 'Statistics', 'Probability',
      ],
      Physics: [
        'Force', 'Work, Energy & Power', 'Light', 'Sound', 'Electricity & Magnetism', 'Modern Physics',
      ],
      Chemistry: [
        'Periodic Table', 'Chemical Bonding', 'Acids, Bases & Salts',
        'Electrolysis', 'Metallurgy', 'Organic Chemistry',
      ],
      Biology: [
        'Cell Biology', 'Genetics', 'Human Anatomy & Physiology',
        'Plant Physiology', 'Ecology',
      ],
    },
  },

  'ISC Class 12': {
    category: 'Board Exams',
    questionTypes: ['MCQ'],
    subjects: {
      Physics: [
        'Electrostatics', 'Current Electricity', 'Magnetism', 'Optics',
        'Modern Physics', 'Electronics',
      ],
      Chemistry: [
        'Solid State', 'Solutions', 'Electrochemistry', 'Organic Chemistry',
        'Coordination Compounds', 'Chemistry in Everyday Life',
      ],
      Mathematics: [
        'Relations & Functions', 'Algebra', 'Calculus', 'Vectors',
        '3D Geometry', 'Probability', 'Linear Programming',
      ],
      Biology: [
        'Reproduction', 'Genetics & Evolution', 'Human Health',
        'Biotechnology', 'Ecology',
      ],
    },
  },
};

export const EXAM_CATEGORIES = [
  'Engineering Entrance',
  'Medical Entrance',
  'Civil Services',
  'Government Exams',
  'Banking Exams',
  'Defence Exams',
  'Central University',
  'State Level — Maharashtra',
  'State Level — Karnataka',
  'State Level — West Bengal',
  'Board Exams',
];

export function getExamsByCategory(category: string): string[] {
  return Object.entries(EXAM_SYLLABUS)
    .filter(([, config]) => config.category === category)
    .map(([name]) => name);
}

export function getAllExams(): string[] {
  return Object.keys(EXAM_SYLLABUS);
}

export function getSubjects(exam: string): string[] {
  return Object.keys(EXAM_SYLLABUS[exam]?.subjects ?? {});
}

export function getTopics(exam: string, subject: string): string[] {
  return EXAM_SYLLABUS[exam]?.subjects[subject] ?? [];
}
