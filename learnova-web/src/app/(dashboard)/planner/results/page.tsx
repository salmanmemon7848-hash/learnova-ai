'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PlannerResultsPage() {
  const router = useRouter();
  const [plan, setPlan] = useState<any>(null);
  const [meta, setMeta] = useState<any>(null);

  useEffect(() => {
    const savedPlan = sessionStorage.getItem('generatedPlan');
    const savedMeta = sessionStorage.getItem('planMeta');
    if (!savedPlan) { router.push('/planner'); return; }
    setPlan(JSON.parse(savedPlan));
    if (savedMeta) setMeta(JSON.parse(savedMeta));
  }, []);

  if (!plan) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-400">Loading your plan...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0F0F10] text-white p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => router.push('/planner')}
          className="text-purple-400 hover:text-purple-300 text-sm mb-4 flex items-center gap-2"
        >
          ← Back to Planner
        </button>
        <h1 className="text-3xl font-bold text-white">Your Personalized Plan</h1>
        {meta && (
          <p className="text-gray-400 mt-2">
            Goal: <span className="text-purple-400 font-medium">{meta.goal}</span>
            {meta.duration && <span className="ml-4">Duration: <span className="text-purple-400">{meta.duration} days</span></span>}
          </p>
        )}
      </div>

      {/* Weekly Goals */}
      {plan.weeklyGoals && plan.weeklyGoals.length > 0 && (
        <div className="bg-[#1A1A1E] rounded-2xl p-6 mb-6 border border-purple-500/20">
          <h2 className="text-xl font-semibold text-purple-400 mb-4">🎯 Weekly Goals</h2>
          <ul className="space-y-2">
            {plan.weeklyGoals.map((goal: string, i: number) => (
              <li key={i} className="flex items-start gap-3">
                <span className="text-purple-400 font-bold mt-0.5">Week {i + 1}</span>
                <span className="text-gray-300">{goal}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Daily Plan */}
      {plan.dailyPlan && plan.dailyPlan.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">📅 Daily Schedule</h2>
          <div className="space-y-4">
            {plan.dailyPlan.map((day: any, i: number) => (
              <div key={i} className="bg-[#1A1A1E] rounded-2xl p-5 border border-gray-700/50 hover:border-purple-500/30 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-purple-400">Day {day.day}</h3>
                  <div className="flex items-center gap-3">
                    {day.focus && (
                      <span className="bg-purple-500/20 text-purple-300 text-xs px-3 py-1 rounded-full">
                        {day.focus}
                      </span>
                    )}
                    {day.hours && (
                      <span className="bg-gray-700 text-gray-300 text-xs px-3 py-1 rounded-full">
                        ⏱️ {day.hours}h
                      </span>
                    )}
                  </div>
                </div>
                <ul className="space-y-2">
                  {day.tasks.map((task: string, j: number) => (
                    <li key={j} className="flex items-start gap-2 text-gray-300">
                      <span className="text-green-400 mt-1 text-xs">✓</span>
                      <span className="text-sm">{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {plan.tips && plan.tips.length > 0 && (
        <div className="bg-[#1A1A1E] rounded-2xl p-6 mb-6 border border-green-500/20">
          <h2 className="text-xl font-semibold text-green-400 mb-4">💡 Study Tips</h2>
          <ul className="space-y-2">
            {plan.tips.map((tip: string, i: number) => (
              <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                <span className="text-green-400 font-bold">•</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => router.push('/planner')}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl font-medium transition-colors"
        >
          Generate New Plan
        </button>
        <button
          onClick={() => window.print()}
          className="flex-1 bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-medium transition-colors"
        >
          Save / Print Plan
        </button>
      </div>

    </div>
  );
}
