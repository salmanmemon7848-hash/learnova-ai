export interface CareerPreview {
  id: string;
  icon?: string;
  title: string;
  tagline?: string;
  colorIndex?: number;
  whyMatch?: string;
  entrySalary?: string;
  topSalary?: string;
  previewExams?: string[];
  demandLabel?: string;
}

export interface Phase1Response {
  phase: string;
  mode: string;
  streamCard?: any;
  streamOptions?: any[];
  careerPreviews?: CareerPreview[];
  personalizedMessage?: string;
  matchScore?: number;
  matchScoreLabel?: string;
  matchScoreReason?: string;
}

export interface Phase2Response {
  phase: string;
  careerId: string;
  hero?: {
    icon: string;
    title: string;
    tagline: string;
    stream: string;
    matchScore: number;
    oneLiner: string;
  };
  counselorTake?: {
    heading: string;
    content: string;
  };
  salaryMap?: {
    entry: string;
    mid: string;
    senior: string;
    top: string;
    cityNote: string;
    timeToMidSalary: string;
    salaryInsight: string;
  };
  demandData?: {
    growthPercent: number;
    growthLabel: string;
    growthSource: string;
    indiaShortfall: string;
    automationRisk: string;
    topHiringCities: string[];
    topHiringCompanies: string[];
  };
  educationPath?: {
    primaryRoute: {
      degree: string;
      duration: string;
      exams: string[];
      topColleges: string[];
      note: string;
    };
    alternateRoutes: {
      route: string;
      why: string;
      cost: string;
      timeline: string;
    }[];
    pgOptions: string[];
  };
  skillsRequired?: {
    technical: string[];
    soft: string[];
    certifications: string[];
  };
  careerRoadmap?: {
    heading: string;
    steps: {
      phase: string;
      actions: string[];
    }[];
  };
  scholarships?: {
    heading: string;
    list: {
      name: string;
      amount: string;
      eligibility: string;
      apply: string;
    }[];
  };
  govtSchemes?: {
    scheme: string;
    benefit: string;
    link: string;
  }[];
  honestChallenges?: {
    heading: string;
    points: string[];
  };
  alternateIfNotPossible?: {
    heading: string;
    careers: string[];
  };
  personalizedClosing?: {
    heading: string;
    content: string;
  };
}

export interface Phase1Result extends Phase1Response {}
export interface Phase2Result extends Phase2Response {}


export type AnyCareerResponse = Phase1Response | Phase2Response | { mode?: string; careers?: any[]; streamOptions?: any[]; personalizedMessage?: string };
