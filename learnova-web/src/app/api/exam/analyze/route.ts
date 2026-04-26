import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      examId,
      examType,
      subject,
      topic,
      questions,
      answers,
      timeTaken,
    } = body

    // Calculate score
    let correctAnswers = 0
    let wrongAnswers = 0
    let unattempted = 0
    const questionDetails: any[] = []
    const weakTopics: string[] = []

    questions.forEach((q: any, index: number) => {
      const userAnswer = answers[index]
      // Fix: Compare as numbers to avoid string vs number issues
      const isCorrect = Number(userAnswer) === Number(q.correctAnswer)
      const isAttempted = userAnswer !== null && userAnswer !== undefined

      if (!isAttempted) {
        unattempted++
      } else if (isCorrect) {
        correctAnswers++
      } else {
        wrongAnswers++
        if (q.topic) weakTopics.push(q.topic)
      }

      questionDetails.push({
        questionId: q.id,
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        isAttempted,
        explanation: q.explanation,
        topic: q.topic,
        estimatedTime: q.estimatedTime,
      })
    })

    const totalQuestions = questions.length
    const score = correctAnswers
    const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0

    // Save exam attempt to Supabase
    const { data: examAttempt, error: examError } = await supabase
      .from('ExamAttempt')
      .insert({
        userId: session.user.id,
        examType: examType || 'Custom',
        subject: subject || 'General',
        topic: topic || null,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        timeTaken: Math.round(timeTaken / 1000),
        questionDetails: {
          questions: questionDetails,
          accuracy,
          unattempted,
        },
        weakTopics: [...new Set(weakTopics)],
      })
      .select()
      .single()

    if (examError) {
      console.error('Error saving exam attempt:', examError)
    }

    // Award XP and update streak
    const xpEarned = Math.round(correctAnswers * 10)
    const today = new Date().toISOString().split('T')[0]

    // Save streak entry
    await supabase
      .from('StudyStreak')
      .upsert({
        userId: session.user.id,
        date: today,
        activity: 'exam',
        xpEarned,
      })

    // Calculate percentile (simplified - based on accuracy)
    let percentile = 50
    if (accuracy >= 90) percentile = 95
    else if (accuracy >= 80) percentile = 85
    else if (accuracy >= 70) percentile = 75
    else if (accuracy >= 60) percentile = 65
    else if (accuracy >= 50) percentile = 55
    else if (accuracy >= 40) percentile = 45
    else if (accuracy >= 30) percentile = 35
    else percentile = 25

    // Generate insights
    const insights = generateInsights({
      accuracy,
      correctAnswers,
      wrongAnswers,
      unattempted,
      totalQuestions,
      timeTaken,
      weakTopics: [...new Set(weakTopics)],
      questionDetails,
    })

    return NextResponse.json({
      success: true,
      analysis: {
        examAttemptId: examAttempt?.id,
        score,
        totalQuestions,
        correctAnswers,
        wrongAnswers,
        unattempted,
        accuracy,
        percentile,
        timeTaken: Math.round(timeTaken / 1000),
        xpEarned,
        weakTopics: [...new Set(weakTopics)],
        questionDetails,
        insights,
      },
    })
  } catch (error) {
    console.error('Exam analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze exam' },
      { status: 500 }
    )
  }
}

// Generate personalized insights
function generateInsights(data: any) {
  const { accuracy, correctAnswers, wrongAnswers, unattempted, totalQuestions, timeTaken, weakTopics, questionDetails } = data
  const insights: string[] = []

  // Overall performance
  if (accuracy >= 90) {
    insights.push('🌟 Outstanding performance! You\'re exam-ready!')
  } else if (accuracy >= 75) {
    insights.push('💪 Great job! Just a bit more practice and you\'ll be perfect!')
  } else if (accuracy >= 60) {
    insights.push('📈 Good progress! Focus on weak areas to improve further.')
  } else if (accuracy >= 40) {
    insights.push('📚 Decent attempt. Regular practice will boost your score significantly.')
  } else {
    insights.push('💡 Keep practicing! Review concepts and try again.')
  }

  // Time analysis
  const avgTimePerQuestion = timeTaken / totalQuestions
  if (avgTimePerQuestion > 120) {
    insights.push('⏰ You\'re spending too much time per question. Practice speed techniques.')
  } else if (avgTimePerQuestion < 30) {
    insights.push('⚡ Great speed! Make sure you\'re not rushing and making careless mistakes.')
  }

  // Unattempted questions
  if (unattempted > totalQuestions * 0.2) {
    insights.push(`⚠️ You left ${unattempted} questions unattempted. Work on time management.`)
  }

  // Weak topics
  if (weakTopics.length > 0) {
    insights.push(`🎯 Focus on improving: ${weakTopics.slice(0, 3).join(', ')}`)
  }

  // Accuracy trend
  if (wrongAnswers > correctAnswers) {
    insights.push('⚡ Be careful with negative marking. Only attempt questions you\'re confident about.')
  }

  return insights
}
