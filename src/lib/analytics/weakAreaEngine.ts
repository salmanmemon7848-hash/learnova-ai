// Weak Area Engine - Analytics and Personalized Recommendations

import { prisma } from '@/lib/prisma'

export interface AcademicDNA {
  strongTopics: TopicPerformance[]
  averageTopics: TopicPerformance[]
  weakTopics: TopicPerformance[]
  overallAccuracy: number
  totalAttempts: number
  subjectsAnalyzed: string[]
}

export interface TopicPerformance {
  subject: string
  topic: string
  attempts: number
  correct: number
  accuracy: number
  lastAttempt: Date
}

export interface DailyRecommendation {
  focusArea: string
  subject: string
  topic: string
  reason: string
  suggestedAction: string
  estimatedTime: number // minutes
  motivationalMessage: string
}

export interface WeeklyStats {
  totalQuestionsAttempted: number
  overallAccuracy: number
  totalStudyTime: number // minutes
  daysStudied: number
  currentStreak: number
  xpEarned: number
  subjectBreakdown: SubjectStats[]
  improvementTrend: number // percentage change from last week
}

export interface SubjectStats {
  subject: string
  attempts: number
  accuracy: number
  timeSpent: number
  topics: TopicPerformance[]
}

export interface ReadinessScore {
  overall: number
  bySubject: {
    subject: string
    readiness: number
    weakAreas: string[]
  }[]
  examTarget: string
  estimatedPreparationDays: number
}

// Get user's Academic DNA profile
export async function getAcademicDNA(userId: string): Promise<AcademicDNA> {
  const tracking = await prisma.weakAreaTracking.findMany({
    where: { userId },
    orderBy: [{ subject: 'asc' }, { topic: 'asc' }],
  })

  const strongTopics: TopicPerformance[] = []
  const averageTopics: TopicPerformance[] = []
  const weakTopics: TopicPerformance[] = []

  let totalAttempts = 0
  let totalCorrect = 0
  const subjectsSet = new Set<string>()

  tracking.forEach((item) => {
    const topicPerf: TopicPerformance = {
      subject: item.subject,
      topic: item.topic,
      attempts: item.attempts,
      correct: item.correct,
      accuracy: item.accuracy,
      lastAttempt: item.lastAttempt,
    }

    subjectsSet.add(item.subject)
    totalAttempts += item.attempts
    totalCorrect += item.correct

    if (item.category === 'strong') {
      strongTopics.push(topicPerf)
    } else if (item.category === 'weak') {
      weakTopics.push(topicPerf)
    } else {
      averageTopics.push(topicPerf)
    }
  })

  const overallAccuracy = totalAttempts > 0 ? (totalCorrect / totalAttempts) * 100 : 0

  return {
    strongTopics,
    averageTopics,
    weakTopics,
    overallAccuracy,
    totalAttempts,
    subjectsAnalyzed: Array.from(subjectsSet),
  }
}

// Generate personalized daily recommendation
export async function getDailyRecommendation(userId: string): Promise<DailyRecommendation> {
  const dna = await getAcademicDNA(userId)

  // Get user's exam target
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { examTarget: true, name: true },
  })

  // Priority: Weak topics with most attempts (indicates struggling but trying)
  const priorityWeak = dna.weakTopics
    .filter((t) => t.attempts >= 3)
    .sort((a, b) => b.attempts - a.attempts)[0]

  // If no priority weak, pick any weak topic
  const focusTopic = priorityWeak || dna.weakTopics[0]

  if (!focusTopic) {
    // No weak topics yet - suggest reviewing average topics
    const avgTopic = dna.averageTopics[0]
    if (avgTopic) {
      return {
        focusArea: avgTopic.topic,
        subject: avgTopic.subject,
        topic: avgTopic.topic,
        reason: 'This topic is average - push it to strong!',
        suggestedAction: 'Practice 10-15 questions on this topic',
        estimatedTime: 30,
        motivationalMessage: getMotivationalMessage('average'),
      }
    }

    // No data yet - suggest getting started
    return {
      focusArea: 'Getting Started',
      subject: 'General',
      topic: 'Begin with basics',
      reason: 'Start solving doubts or taking exams to get personalized recommendations',
      suggestedAction: 'Try the AI Doubt Solver or take a practice exam',
      estimatedTime: 20,
      motivationalMessage: 'Every topper was once a beginner. Start today! 🚀',
    }
  }

  const examContext = user?.examTarget ? ` for ${user.examTarget}` : ''
  const urgency = focusTopic.attempts >= 5 ? 'urgently needs' : 'needs'

  return {
    focusArea: `${focusTopic.subject} - ${focusTopic.topic}`,
    subject: focusTopic.subject,
    topic: focusTopic.topic,
    reason: `You've scored ${focusTopic.accuracy.toFixed(0)}% in this topic across ${focusTopic.attempts} attempts. This ${urgency} attention${examContext}.`,
    suggestedAction: `Solve 10-15 questions on ${focusTopic.topic} using Doubt Solver or Exam Simulator`,
    estimatedTime: focusTopic.attempts >= 5 ? 45 : 30,
    motivationalMessage: getMotivationalMessage('weak'),
  }
}

// Calculate weekly statistics
export async function getWeeklyStats(userId: string): Promise<WeeklyStats> {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

  // Get exam attempts this week
  const examAttempts = await prisma.examAttempt.findMany({
    where: {
      userId,
      createdAt: { gte: weekAgo },
    },
  })

  // Get streak data this week
  const streakData = await prisma.studyStreak.findMany({
    where: {
      userId,
      date: { gte: weekAgo },
    },
  })

  // Get weak area tracking updates this week
  const weakAreaUpdates = await prisma.weakAreaTracking.findMany({
    where: {
      userId,
      lastAttempt: { gte: weekAgo },
    },
  })

  // Calculate totals
  const totalQuestionsAttempted = examAttempts.reduce((sum, exam) => sum + exam.totalQuestions, 0)
  const totalCorrect = examAttempts.reduce((sum, exam) => sum + exam.correctAnswers, 0)
  const overallAccuracy = totalQuestionsAttempted > 0 ? (totalCorrect / totalQuestionsAttempted) * 100 : 0
  const totalStudyTime = streakData.reduce((sum, day) => sum + day.minutesStudied, 0)
  const daysStudied = streakData.length
  const xpEarned = streakData.reduce((sum, day) => sum + day.xpEarned, 0)

  // Get current streak
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { streakCount: true },
  })

  // Subject breakdown
  const subjectMap = new Map<string, SubjectStats>()

  examAttempts.forEach((exam) => {
    const existing = subjectMap.get(exam.subject)
    if (existing) {
      existing.attempts += exam.totalQuestions
      existing.accuracy = ((existing.accuracy * (existing.attempts - exam.totalQuestions) + (exam.correctAnswers / exam.totalQuestions) * 100) / existing.attempts)
    } else {
      subjectMap.set(exam.subject, {
        subject: exam.subject,
        attempts: exam.totalQuestions,
        accuracy: (exam.correctAnswers / exam.totalQuestions) * 100,
        timeSpent: Math.round(exam.timeTaken / 60),
        topics: [],
      })
    }
  })

  const subjectBreakdown = Array.from(subjectMap.values())

  // Calculate improvement trend (compare with previous week)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)
  const previousWeekAttempts = await prisma.examAttempt.findMany({
    where: {
      userId,
      createdAt: { gte: twoWeeksAgo, lt: weekAgo },
    },
  })

  const previousQuestions = previousWeekAttempts.reduce((sum, exam) => sum + exam.totalQuestions, 0)
  const previousCorrect = previousWeekAttempts.reduce((sum, exam) => sum + exam.correctAnswers, 0)
  const previousAccuracy = previousQuestions > 0 ? (previousCorrect / previousQuestions) * 100 : 0

  const improvementTrend = previousAccuracy > 0 ? ((overallAccuracy - previousAccuracy) / previousAccuracy) * 100 : 0

  return {
    totalQuestionsAttempted,
    overallAccuracy,
    totalStudyTime,
    daysStudied,
    currentStreak: user?.streakCount || 0,
    xpEarned,
    subjectBreakdown,
    improvementTrend,
  }
}

// Calculate readiness score for target exam
export async function getReadinessScore(userId: string): Promise<ReadinessScore> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { examTarget: true },
  })

  const examTarget = user?.examTarget || 'General'
  const dna = await getAcademicDNA(userId)

  // Define subject weightage based on exam
  const examWeights: Record<string, Record<string, number>> = {
    JEE: { Physics: 0.33, Chemistry: 0.33, Mathematics: 0.34 },
    NEET: { Physics: 0.25, Chemistry: 0.25, Biology: 0.5 },
    UPSC: { 'General Studies': 0.6, 'CSAT': 0.4 },
    CBSE: { Physics: 0.2, Chemistry: 0.2, Mathematics: 0.2, Biology: 0.2, English: 0.2 },
  }

  const weights = examWeights[examTarget] || { General: 1.0 }

  // Calculate readiness by subject
  const bySubject = dna.subjectsAnalyzed.map((subject) => {
    const subjectTopics = [
      ...dna.strongTopics,
      ...dna.averageTopics,
      ...dna.weakTopics,
    ].filter((t) => t.subject === subject)

    const avgAccuracy = subjectTopics.length > 0
      ? subjectTopics.reduce((sum, t) => sum + t.accuracy, 0) / subjectTopics.length
      : 0

    const weakAreas = dna.weakTopics
      .filter((t) => t.subject === subject)
      .map((t) => t.topic)

    // Readiness = accuracy weighted by attempts (more attempts = more reliable)
    const totalAttempts = subjectTopics.reduce((sum, t) => sum + t.attempts, 0)
    const confidence = Math.min(totalAttempts / 20, 1.0) // Cap at 20 attempts
    const readiness = avgAccuracy * confidence

    return {
      subject,
      readiness: Math.round(readiness),
      weakAreas,
    }
  })

  // Calculate overall readiness
  let overallReadiness = 0
  let totalWeight = 0

  bySubject.forEach((subj) => {
    const weight = weights[subj.subject] || 0.1
    overallReadiness += subj.readiness * weight
    totalWeight += weight
  })

  overallReadiness = totalWeight > 0 ? overallReadiness / totalWeight : 0

  // Estimate preparation days needed
  const daysNeeded = overallReadiness >= 80 ? 0 : Math.ceil((80 - overallReadiness) * 3)

  return {
    overall: Math.round(overallReadiness),
    bySubject,
    examTarget,
    estimatedPreparationDays: daysNeeded,
  }
}

// Get motivational messages based on performance
function getMotivationalMessage(context: 'weak' | 'average' | 'strong'): string {
  const messages = {
    weak: [
      'Arjun ne bhi ek pointed focus se target kiya tha 🎯',
      'Every weak area is an opportunity to score extra marks!',
      'Don\'t worry - consistent practice will make this your strength 💪',
      'Remember: APJ Abdul Kalam failed many exams but never gave up',
    ],
    average: [
      'You\'re almost there! Push this to strong with focused practice 🚀',
      'Just a bit more effort and this will become your strength!',
      'Great progress! Let\'s make it excellent 📈',
    ],
    strong: [
      'Excellent work! This is your power area now 🌟',
      'You\'ve mastered this! Keep maintaining it 👏',
      'Topper performance! Now help others understand this too 🎓',
    ],
  }

  const options = messages[context]
  return options[Math.floor(Math.random() * options.length)]
}

// Update user level based on XP
export async function updateUserLevel(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xpPoints: true },
  })

  if (!user) return 'Beginner'

  const xp = user.xpPoints
  let newLevel = 'Beginner'

  if (xp >= 5000) newLevel = 'Genius'
  else if (xp >= 2500) newLevel = 'Legend'
  else if (xp >= 1000) newLevel = 'Topper'
  else if (xp >= 500) newLevel = 'Scholar'

  if (newLevel !== user.xpPoints.toString()) {
    await prisma.user.update({
      where: { id: userId },
      data: { userLevel: newLevel },
    })
  }

  return newLevel
}
