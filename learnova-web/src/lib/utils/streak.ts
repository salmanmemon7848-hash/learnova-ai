// Streak tracking utilities for Thinkior AI

export interface StreakData {
  currentStreak: number
  longestStreak: number
  lastActiveDate: string // YYYY-MM-DD in IST
  milestonesShown: number[] // Track which milestones have been shown
}

// Get current date in IST timezone as YYYY-MM-DD string
export function getISTDateString(): string {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(new Date())
}

// Get yesterday's date in IST
function getYesterdayIST(): string {
  const today = new Date()
  // Convert to IST
  const istOffset = 5.5 * 60 * 60 * 1000 // IST is UTC+5:30
  const istTime = today.getTime() + (today.getTimezoneOffset() * 60 * 1000) + istOffset
  const istDate = new Date(istTime)
  istDate.setDate(istDate.getDate() - 1)
  
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  return formatter.format(istDate)
}

// Load streak data from localStorage
export function loadStreak(): StreakData {
  const defaultStreak: StreakData = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    milestonesShown: [],
  }
  
  try {
    const stored = localStorage.getItem('learnova_streak')
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Failed to load streak:', error)
  }
  
  return defaultStreak
}

// Save streak data to localStorage
export function saveStreak(streak: StreakData): void {
  try {
    localStorage.setItem('learnova_streak', JSON.stringify(streak))
  } catch (error) {
    console.error('Failed to save streak:', error)
  }
}

// Update streak when user sends a message
export function updateStreak(): { streak: StreakData; newMilestone?: number } {
  const streak = loadStreak()
  const today = getISTDateString()
  const yesterday = getYesterdayIST()
  let newMilestone: number | undefined
  
  if (streak.lastActiveDate === today) {
    // Already active today, no change
    return { streak }
  }
  
  if (streak.lastActiveDate === yesterday) {
    // Consecutive day
    streak.currentStreak += 1
  } else {
    // Streak broken or first time
    streak.currentStreak = 1
  }
  
  streak.lastActiveDate = today
  
  // Update longest streak
  if (streak.currentStreak > streak.longestStreak) {
    streak.longestStreak = streak.currentStreak
  }
  
  // Check for milestones
  const milestoneDays = [3, 7, 30]
  for (const milestone of milestoneDays) {
    if (streak.currentStreak === milestone && !streak.milestonesShown.includes(milestone)) {
      newMilestone = milestone
      streak.milestonesShown.push(milestone)
      break // Only show one milestone at a time
    }
  }
  
  saveStreak(streak)
  
  return { streak, newMilestone }
}

// Get milestone message
export function getMilestoneMessage(days: number): string {
  switch (days) {
    case 3:
      return "3-day streak! You're building a study habit. 🔥"
    case 7:
      return "1 week streak! You're serious about your goals."
    case 30:
      return "30 days! You're in the top 1% of students."
    default:
      return `${days}-day streak! Keep going!`
  }
}

// Generate WhatsApp share link for streak
export function getStreakWhatsAppLink(days: number): string {
  const text = `I've been studying for ${days} days straight on Thinkior AI! 🔥 Join me: https://learnova-ai-zeta.vercel.app`
  return getWhatsAppLink(text)
}

// Generate WhatsApp share link for exam score
export function getExamWhatsAppLink(score: number, total: number, subject: string): string {
  const text = `I just scored ${score}/${total} on a ${subject} mock test on Thinkior AI! 📚 Try it free: https://learnova-ai-zeta.vercel.app`
  return getWhatsAppLink(text)
}

// Generate WhatsApp share link for business validation
export function getBusinessWhatsAppLink(score: string): string {
  const text = `My startup idea scored ${score}/10 on Thinkior AI's India validator! 🚀 https://learnova-ai-zeta.vercel.app`
  return getWhatsAppLink(text)
}

// Helper to generate platform-specific WhatsApp link
function getWhatsAppLink(text: string): string {
  const encodedText = encodeURIComponent(text)
  
  // Check if mobile (simple detection)
  const isMobile = /Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
  
  if (isMobile) {
    return `whatsapp://send?text=${encodedText}`
  } else {
    return `https://web.whatsapp.com/send?text=${encodedText}`
  }
}

// Check if milestone should be shown
export function shouldShowMilestone(streak: StreakData, days: number): boolean {
  return streak.currentStreak === days && !streak.milestonesShown.includes(days)
}
