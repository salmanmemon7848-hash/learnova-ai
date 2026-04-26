'use client'

import { Lightbulb, Target, Clock, ArrowRight, Sparkles } from 'lucide-react'

interface DailyRecommendationProps {
  focusArea: string
  subject: string
  topic: string
  reason: string
  suggestedAction: string
  estimatedTime: number
  motivationalMessage: string
  onActionClick?: () => void
}

export default function DailyRecommendation({
  focusArea,
  subject,
  topic,
  reason,
  suggestedAction,
  estimatedTime,
  motivationalMessage,
  onActionClick,
}: DailyRecommendationProps) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl p-6 text-white"
      style={{
        background: 'linear-gradient(135deg, #534AB7 0%, #3C3489 100%)',
      }}
    >
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full translate-y-12 -translate-x-12" />

      {/* Header */}
      <div className="relative flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white bg-opacity-20 flex items-center justify-center">
            <Lightbulb className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Today's Focus</h3>
            <p className="text-sm text-white text-opacity-80">AI-Powered Recommendation</p>
          </div>
        </div>
        <div className="flex items-center gap-1 px-3 py-1 bg-white bg-opacity-20 rounded-full text-xs font-medium">
          <Sparkles className="w-3 h-3" />
          Personalized
        </div>
      </div>

      {/* Focus Area */}
      <div className="relative mb-4">
        <div className="flex items-center gap-2 mb-2">
          <Target className="w-5 h-5" />
          <h4 className="text-xl font-bold">{focusArea}</h4>
        </div>
        <p className="text-sm text-white text-opacity-90 leading-relaxed">{reason}</p>
      </div>

      {/* Action Plan */}
      <div className="relative bg-white bg-opacity-10 rounded-xl p-4 mb-4">
        <p className="text-sm font-semibold mb-2">📝 Suggested Action:</p>
        <p className="text-sm text-white text-opacity-90">{suggestedAction}</p>
        <div className="flex items-center gap-2 mt-3 text-xs text-white text-opacity-80">
          <Clock className="w-4 h-4" />
          <span>Estimated time: {estimatedTime} minutes</span>
        </div>
      </div>

      {/* Motivational Message */}
      <div className="relative mb-4">
        <p className="text-sm italic text-white text-opacity-90">"{motivationalMessage}"</p>
      </div>

      {/* CTA Button */}
      <button
        onClick={onActionClick}
        className="relative w-full py-3 bg-white text-[#534AB7] rounded-xl font-semibold hover:bg-opacity-90 transition-all flex items-center justify-center gap-2"
      >
        Start Practicing Now
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  )
}
