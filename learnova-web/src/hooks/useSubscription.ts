'use client'

import { useState, useEffect } from 'react'
import { PLAN_LIMITS } from '@/lib/plans'
import { useRole } from '@/contexts/RoleContext'

export function useSubscription() {
  const [plan, setPlan] = useState<string>('free')
  const { role } = useRole()
  const userType = role === 'founder' ? 'founder' : 'student'
  const [isLoading, setIsLoading] = useState(true)
  const [upgradePopupFeature, setUpgradePopupFeature] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/subscription')
      .then(res => res.json())
      .then(data => {
        if (data.plan) setPlan(data.plan)
        setIsLoading(false)
      })
      .catch(() => setIsLoading(false))
  }, [])

  const limits = (PLAN_LIMITS[userType] as any)?.[plan] || (PLAN_LIMITS[userType] as any)?.['free']

  const isFeatureAllowed = (feature: string) => {
    if (!limits) return false;
    const limit = (limits as any)[feature]
    return limit !== 0
  }

  const getRemainingUsage = (feature: string) => {
    if (!limits) return 0;
    const limit = (limits as any)[feature]
    if (limit === 'one-time' || limit === 0) return 0;
    return typeof limit === 'number' ? limit : 0; 
  }

  const showUpgradePopup = (featureName: string) => {
    setUpgradePopupFeature(featureName)
  }

  const closeUpgradePopup = () => setUpgradePopupFeature(null)

  return {
    plan,
    userType,
    isLoading,
    isFeatureAllowed,
    getRemainingUsage,
    showUpgradePopup,
    upgradePopupFeature,
    closeUpgradePopup
  }
}
