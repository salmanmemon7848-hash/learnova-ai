// Spaced Repetition Algorithm for Study Planner

export interface StudyPlan {
  id: string
  examTarget: string
  examDate: string
  startDate: string
  totalDays: number
  subjects: SubjectPlan[]
  revisionCycles: RevisionCycle[]
  restDays: number[]
  motivationalMessages: string[]
}

export interface SubjectPlan {
  subject: string
  topics: TopicPlan[]
  totalHours: number
  weakAreaBonus: number // Extra hours for weak topics
}

export interface TopicPlan {
  topic: string
  estimatedHours: number
  difficulty: 'Easy' | 'Medium' | 'Hard'
  isWeakArea: boolean
  scheduledDays: number[] // Days when this topic is scheduled
  revisionDays: number[] // Days for revision (spaced repetition)
}

export interface RevisionCycle {
  cycle: number
  daysAfterInitial: number[] // [1, 3, 7, 14, 30] days
  description: string
}

export interface PlannerInput {
  examTarget: string
  examDate: string
  subjects: {
    name: string
    topics: string[]
    currentLevel: 'Beginner' | 'Intermediate' | 'Advanced'
    weakTopics?: string[]
  }[]
  dailyHours: {
    weekday: number
    weekend: number
  }
  startDate?: string
}

// Spaced repetition intervals (in days)
export const SPACED_REPETITION_INTERVALS = [1, 3, 7, 14, 30]

// Indian motivational messages for students
export const MOTIVATIONAL_MESSAGES = [
  "Arjun ne bhi ek pointed focus se target kiya tha 🎯",
  "Every hour of study brings you closer to your dream college! 🚀",
  "Remember: APJ Abdul Kalam failed many exams but never gave up 💪",
  "Consistency is key! Even 1 hour daily beats 10 hours once a week 📚",
  "Your competition is sleeping, but you're studying. That's your advantage! 🔥",
  "Ratan Tata said: 'If you want to walk fast, walk alone. If you want to walk far, walk together.' Study smart! 🌟",
  "Topper secret: They revise more, not study more 📝",
  "Don't watch the clock; do what it does - keep moving! ⏰",
  "Success is the sum of small efforts repeated day in and day out ✨",
  "Aaj ka hard work kal ka success hai! 💯",
  "Shah Rukh Khan came from nowhere with just determination. You can too! 🎬",
  "Every question you solve is a step closer to your goal 🎯",
  "Rest days are important too - your brain needs time to consolidate learning 🧠",
  "You're not just studying, you're building your future! 🏗️",
  "Kaamyaabi unhi ko milti hai jo haar nahi maante! 🏆",
]

// Generate study plan using spaced repetition
export function generateStudyPlan(input: PlannerInput): StudyPlan {
  const { examTarget, examDate, subjects, dailyHours } = input
  
  const startDate = input.startDate || new Date().toISOString().split('T')[0]
  const start = new Date(startDate)
  const end = new Date(examDate)
  const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  
  if (totalDays < 7) {
    throw new Error('Exam date must be at least 7 days from start date')
  }

  // Calculate total available study hours
  const weekdays = countWeekdays(start, end)
  const weekends = totalDays - weekdays
  const totalAvailableHours = (weekdays * dailyHours.weekday) + (weekends * dailyHours.weekend)
  
  // Reserve 15% time for revisions
  const revisionTime = totalAvailableHours * 0.15
  const studyTime = totalAvailableHours * 0.85
  
  // Generate subject plans
  const subjectPlans: SubjectPlan[] = subjects.map(subject => {
    const topicPlans: TopicPlan[] = subject.topics.map(topic => {
      const isWeak = subject.weakTopics?.includes(topic) || false
      const difficulty = getTopicDifficulty(topic, subject.name)
      const baseHours = estimateTopicHours(topic, difficulty)
      const weakBonus = isWeak ? baseHours * 0.5 : 0 // 50% extra time for weak areas
      
      return {
        topic,
        estimatedHours: baseHours + weakBonus,
        difficulty,
        isWeakArea: isWeak,
        scheduledDays: [],
        revisionDays: [],
      }
    })
    
    const totalHours = topicPlans.reduce((sum, t) => sum + t.estimatedHours, 0)
    
    return {
      subject: subject.name,
      topics: topicPlans,
      totalHours,
      weakAreaBonus: topicPlans.filter(t => t.isWeakArea).reduce((sum, t) => sum + (t.estimatedHours * 0.5), 0),
    }
  })
  
  // Schedule topics across available days
  const schedule = distributeTopics(subjectPlans, totalDays, studyTime)
  
  // Add revision cycles using spaced repetition
  const revisionCycles = addRevisionCycles(schedule, totalDays)
  
  // Insert rest days (1 day per week)
  const restDays = generateRestDays(totalDays)
  
  return {
    id: Date.now().toString(),
    examTarget,
    examDate,
    startDate,
    totalDays,
    subjects: schedule,
    revisionCycles,
    restDays,
    motivationalMessages: MOTIVATIONAL_MESSAGES,
  }
}

// Estimate hours needed for a topic based on difficulty
function estimateTopicHours(topic: string, difficulty: 'Easy' | 'Medium' | 'Hard'): number {
  const baseHours = {
    Easy: 2,
    Medium: 4,
    Hard: 6,
  }
  
  // Some topics naturally take longer
  const multipliers: Record<string, number> = {
    'Calculus': 1.5,
    'Organic Chemistry': 1.5,
    'Electromagnetism': 1.4,
    'Genetics': 1.3,
    'Integration': 1.5,
    'Thermodynamics': 1.4,
  }
  
  const multiplier = multipliers[topic] || 1.0
  return baseHours[difficulty] * multiplier
}

// Determine topic difficulty
function getTopicDifficulty(topic: string, subject: string): 'Easy' | 'Medium' | 'Hard' {
  const hardTopics = [
    'Calculus', 'Electromagnetism', 'Organic Chemistry', 'Genetics',
    'Integration', 'Thermodynamics', 'Quantum Mechanics', 'Optics',
  ]
  
  const mediumTopics = [
    'Algebra', 'Kinematics', 'Chemical Bonding', 'Ecology',
    'Trigonometry', 'Probability', 'Coordination Compounds',
  ]
  
  if (hardTopics.some(t => topic.includes(t))) return 'Hard'
  if (mediumTopics.some(t => topic.includes(t))) return 'Medium'
  return 'Easy'
}

// Distribute topics across days
function distributeTopics(
  subjects: SubjectPlan[],
  totalDays: number,
  totalStudyTime: number
): SubjectPlan[] {
  const scheduled = JSON.parse(JSON.stringify(subjects)) as SubjectPlan[]
  let currentDay = 0
  
  // Calculate hours per day (average)
  const hoursPerDay = totalStudyTime / totalDays
  
  // Schedule topics subject by subject
  for (const subject of scheduled) {
    let subjectDayOffset = 0
    
    for (const topic of subject.topics) {
      const daysNeeded = Math.ceil(topic.estimatedHours / hoursPerDay)
      
      // Schedule this topic across consecutive days
      for (let i = 0; i < daysNeeded && currentDay + i < totalDays; i++) {
        topic.scheduledDays.push(currentDay + i)
      }
      
      currentDay += daysNeeded
      subjectDayOffset += daysNeeded
    }
  }
  
  return scheduled
}

// Add spaced repetition revision cycles
function addRevisionCycles(
  subjects: SubjectPlan[],
  totalDays: number
): RevisionCycle[] {
  const cycles: RevisionCycle[] = []
  
  SPACED_REPETITION_INTERVALS.forEach((interval, index) => {
    cycles.push({
      cycle: index + 1,
      daysAfterInitial: [],
      description: getRevisionCycleDescription(index + 1),
    })
  })
  
  // Add revision days for each topic
  for (const subject of subjects) {
    for (const topic of subject.topics) {
      if (topic.scheduledDays.length === 0) continue
      
      const lastStudyDay = Math.max(...topic.scheduledDays)
      
      // Add revision days based on spaced repetition intervals
      SPACED_REPETITION_INTERVALS.forEach(interval => {
        const revisionDay = lastStudyDay + interval
        if (revisionDay < totalDays) {
          topic.revisionDays.push(revisionDay)
        }
      })
    }
  }
  
  return cycles
}

// Generate rest days (1 per week)
function generateRestDays(totalDays: number): number[] {
  const restDays: number[] = []
  
  for (let day = 6; day < totalDays; day += 7) {
    restDays.push(day) // Every 7th day is rest
  }
  
  return restDays
}

// Get revision cycle description
function getRevisionCycleDescription(cycle: number): string {
  const descriptions = [
    'First Revision - 1 day after learning',
    'Second Revision - 3 days after learning',
    'Third Revision - 1 week after learning',
    'Fourth Revision - 2 weeks after learning',
    'Final Revision - 1 month after learning',
  ]
  
  return descriptions[cycle - 1] || `Revision Cycle ${cycle}`
}

// Count weekdays between two dates
function countWeekdays(start: Date, end: Date): number {
  let count = 0
  const current = new Date(start)
  
  while (current <= end) {
    const dayOfWeek = current.getDay()
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
      count++
    }
    current.setDate(current.getDate() + 1)
  }
  
  return count
}

// Reschedule plan when student falls behind
export function reschedulePlan(
  originalPlan: StudyPlan,
  completedDays: number[],
  currentDate: string
): StudyPlan {
  const today = new Date(currentDate)
  const newStartDate = today.toISOString().split('T')[0]
  
  // Find remaining topics
  const remainingSubjects = originalPlan.subjects.map(subject => ({
    ...subject,
    topics: subject.topics
      .filter(topic => {
        const lastScheduledDay = Math.max(...topic.scheduledDays)
        return lastScheduledDay >= completedDays.length
      })
      .map(topic => ({
        ...topic,
        scheduledDays: [], // Will be recalculated
        revisionDays: [],
      })),
  }))
  
  // Calculate remaining days
  const examDate = new Date(originalPlan.examDate)
  const remainingDays = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  
  if (remainingDays < 3) {
    throw new Error('Less than 3 days remaining. Focus on revision only!')
  }
  
  // Regenerate schedule with remaining time
  const newPlan: StudyPlan = {
    ...originalPlan,
    id: Date.now().toString(),
    startDate: newStartDate,
    totalDays: remainingDays,
    subjects: remainingSubjects as SubjectPlan[],
    restDays: generateRestDays(remainingDays),
  }
  
  // Redistribute remaining topics
  const totalRemainingHours = remainingSubjects.reduce(
    (sum, subj) => sum + subj.topics.reduce((s, t) => s + t.estimatedHours, 0),
    0
  )
  
  newPlan.subjects = distributeTopics(newPlan.subjects, remainingDays, totalRemainingHours)
  newPlan.revisionCycles = addRevisionCycles(newPlan.subjects, remainingDays)
  
  return newPlan
}

// Get today's schedule
export function getTodaysSchedule(plan: StudyPlan, dayNumber: number) {
  const isRestDay = plan.restDays.includes(dayNumber)
  
  if (isRestDay) {
    return {
      isRestDay: true,
      message: 'Rest Day! Take a break and let your brain consolidate learning 🧠',
      tasks: [],
    }
  }
  
  const tasks: any[] = []
  
  plan.subjects.forEach(subject => {
    subject.topics.forEach(topic => {
      // Check if this topic is scheduled for today
      if (topic.scheduledDays.includes(dayNumber)) {
        tasks.push({
          type: 'study',
          subject: subject.subject,
          topic: topic.topic,
          estimatedHours: topic.estimatedHours / topic.scheduledDays.length,
          isWeakArea: topic.isWeakArea,
        })
      }
      
      // Check if this is a revision day
      if (topic.revisionDays.includes(dayNumber)) {
        tasks.push({
          type: 'revision',
          subject: subject.subject,
          topic: topic.topic,
          estimatedHours: 1,
          cycleNumber: getRevisionCycleForDay(topic, dayNumber),
        })
      }
    })
  })
  
  // Get motivational message
  const messageIndex = dayNumber % MOTIVATIONAL_MESSAGES.length
  
  return {
    isRestDay: false,
    tasks,
    motivationalMessage: MOTIVATIONAL_MESSAGES[messageIndex],
    totalEstimatedHours: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
  }
}

// Get which revision cycle a day belongs to
function getRevisionCycleForDay(topic: TopicPlan, day: number): number {
  const lastStudyDay = Math.max(...topic.scheduledDays)
  const daysSinceStudy = day - lastStudyDay
  
  const cycleIndex = SPACED_REPETITION_INTERVALS.indexOf(daysSinceStudy)
  return cycleIndex !== -1 ? cycleIndex + 1 : 0
}
