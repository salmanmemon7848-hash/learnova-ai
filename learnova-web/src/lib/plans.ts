export const PLAN_LIMITS = {
  student: {
    free: {
      aiChat: 10, doubtSolver: 3, practiceTest: 1,
      eduFinder: 0, mockInterview: 0, careerGuide: 0,
    },
    pro: {
      aiChat: 20, doubtSolver: 5, practiceTest: 10,
      eduFinder: 5, mockInterview: 0, careerGuide: 0,
    },
    max: {
      aiChat: 20, doubtSolver: 10, practiceTest: 20,
      eduFinder: 10, mockInterview: 5, careerGuide: 5,
    },
  },
  founder: {
    starter: {
      aiChat: 10, businessIdeas: 1, businessValidator: 0,
      competitorResearch: 0, mockInterview: 0,
    },
    builder: {
      aiChat: 20, businessIdeas: 10, businessValidator: 10,
      competitorResearch: 0, mockInterview: 0,
    },
    founder_pro: {
      aiChat: 20, businessIdeas: 10, businessValidator: 10,
      competitorResearch: 5, mockInterview: 5,
    },
  }
}
