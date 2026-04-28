'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, AlertCircle, CheckCircle, MinusCircle } from 'lucide-react'

interface TopicPerformance {
  subject: string
  topic: string
  attempts: number
  correct: number
  accuracy: number
  lastAttempt: Date
}

interface AcademicDNAProps {
  strongTopics: TopicPerformance[]
  averageTopics: TopicPerformance[]
  weakTopics: TopicPerformance[]
  overallAccuracy: number
  totalAttempts: number
}

export default function AcademicDNA({
  strongTopics,
  averageTopics,
  weakTopics,
  overallAccuracy,
  totalAttempts,
}: AcademicDNAProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>('weak')

  if (totalAttempts === 0) {
    return (
      <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-card)] p-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }} mb-4>Your Academic DNA</h3>
        <div className="text-center py-8">
          <div className="w-16 h-16 rounded-full bg-[var(--accent-purple-glow)] flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" style={{ color: '#534AB7' }} />
          </div>
          <p className="text-[#5A5A72] font-medium">No data yet</p>
          <p className="text-sm text-[#5A5A72] mt-1">
            Start solving doubts or taking exams to see your Academic DNA
          </p>
        </div>
      </div>
    )
  }

  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 75) return '#1D9E75' // Green
    if (accuracy >= 50) return '#BA7517' // Orange
    return '#E74C3C' // Red
  }

  const getAccuracyIcon = (accuracy: number) => {
    if (accuracy >= 75) return <CheckCircle className="w-4 h-4" />
    if (accuracy >= 50) return <MinusCircle className="w-4 h-4" />
    return <AlertCircle className="w-4 h-4" />
  }

  const TopicSection = ({
    title,
    topics,
    color,
    icon,
    sectionKey,
  }: {
    title: string
    topics: TopicPerformance[]
    color: string
    icon: React.ReactNode
    sectionKey: string
  }) => {
    const isExpanded = expandedSection === sectionKey

    return (
      <div className="mb-4 last:mb-0">
        <button
          onClick={() => setExpandedSection(isExpanded ? null : sectionKey)}
          className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-[var(--bg-tertiary)] transition-colors"
          style={{ borderLeft: `4px solid ${color}` }}
        >
          <div className="flex items-center gap-3">
            <div style={{ color }}>{icon}</div>
            <div className="text-left">
              <p className="font-semibold" style={{ color: 'var(--text-primary)' }}>{title}</p>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{topics.length} topics</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium" style={{ color }}>
              {topics.length}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            ) : (
              <ChevronDown className="w-5 h-5" style={{ color: 'var(--text-secondary)' }} />
            )}
          </div>
        </button>

        {isExpanded && topics.length > 0 && (
          <div className="mt-2 ml-4 space-y-2">
            {topics.map((topic, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-3 bg-[var(--bg-tertiary)] rounded-lg"
              >
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{topic.topic}</p>
                  <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>{topic.subject} • {topic.attempts} attempts</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1" style={{ color: getAccuracyColor(topic.accuracy) }}>
                    {getAccuracyIcon(topic.accuracy)}
                    <span className="text-sm font-semibold">{topic.accuracy.toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-card)] p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Your Academic DNA</h3>
        <div className="text-right">
          <p className="text-2xl font-bold" style={{ color: getAccuracyColor(overallAccuracy) }}>
            {overallAccuracy.toFixed(0)}%
          </p>
          <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Overall Accuracy</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs" style={{ color: 'var(--text-secondary)' }} mb-2>
          <span>Strong ({strongTopics.length})</span>
          <span>Average ({averageTopics.length})</span>
          <span>Weak ({weakTopics.length})</span>
        </div>
        <div className="flex h-3 rounded-full overflow-hidden" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
          {totalAttempts > 0 && (
            <>
              <div
                className="transition-all duration-500"
                style={{
                  width: `${(strongTopics.length / (strongTopics.length + averageTopics.length + weakTopics.length)) * 100}%`,
                  backgroundColor: '#1D9E75',
                }}
              />
              <div
                className="transition-all duration-500"
                style={{
                  width: `${(averageTopics.length / (strongTopics.length + averageTopics.length + weakTopics.length)) * 100}%`,
                  backgroundColor: '#BA7517',
                }}
              />
              <div
                className="transition-all duration-500"
                style={{
                  width: `${(weakTopics.length / (strongTopics.length + averageTopics.length + weakTopics.length)) * 100}%`,
                  backgroundColor: '#E74C3C',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Topic Sections */}
      <div className="space-y-2">
        <TopicSection
          title="🔴 Weak Areas"
          topics={weakTopics}
          color="#E74C3C"
          icon={<TrendingDown className="w-5 h-5" />}
          sectionKey="weak"
        />
        <TopicSection
          title="🟡 Average"
          topics={averageTopics}
          color="#BA7517"
          icon={<MinusCircle className="w-5 h-5" />}
          sectionKey="average"
        />
        <TopicSection
          title="🟢 Strong"
          topics={strongTopics}
          color="#1D9E75"
          icon={<TrendingUp className="w-5 h-5" />}
          sectionKey="strong"
        />
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4" style={{ borderTop: '1px solid var(--border-card)' }}>
        <p className="text-xs text-center" style={{ color: 'var(--text-secondary)' }}>
          💡 Focus on weak areas to improve your overall score fastest
        </p>
      </div>
    </div>
  )
}
