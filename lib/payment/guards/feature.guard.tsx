import React, { memo, useMemo } from 'react'

export type PlanType = "FREE" | "STANDARD" | "PREMIUM"

const PLAN_HIERARCHY: readonly PlanType[] = ["FREE", "STANDARD", "PREMIUM"] as const

export interface User {
  readonly id: string
  readonly email: string
  readonly name: string
  readonly image: string
  readonly role: string
  readonly createdAt: Date
  readonly updatedAt: Date
  readonly plan: PlanType
}

export interface FeatureGuardProps {
  readonly user: User | null | undefined
  readonly requiredPlan: PlanType
  readonly children: React.ReactNode
  readonly fallback?: React.ReactNode
  readonly showFallback?: boolean
  readonly onAccessDenied?: (userPlan: PlanType, requiredPlan: PlanType) => void
}

// Utility type for plan comparison
type PlanComparison = {
  readonly userLevel: number
  readonly requiredLevel: number
  readonly hasAccess: boolean
}

/**
 * Utility function to compare plan levels
 * @param userPlan - The user's current plan
 * @param requiredPlan - The plan required for access
 * @returns Object containing comparison details
 */
export const comparePlans = (userPlan: PlanType, requiredPlan: PlanType): PlanComparison => {
  const userLevel = PLAN_HIERARCHY.indexOf(userPlan)
  const requiredLevel = PLAN_HIERARCHY.indexOf(requiredPlan)
  
  return {
    userLevel,
    requiredLevel,
    hasAccess: userLevel >= requiredLevel
  }
}

/**
 * Checks if a user has access to a given feature
 * @param userPlan - The user's current plan
 * @param requiredPlan - The plan required for access
 * @returns boolean indicating access
 */
export const hasAccess = (userPlan: PlanType, requiredPlan: PlanType): boolean => {
  return comparePlans(userPlan, requiredPlan).hasAccess
}


const FeatureGuard: React.FC<FeatureGuardProps> = memo(({ 
  user, 
  requiredPlan, 
  children, 
  fallback = null,
  showFallback = false,
  onAccessDenied
}) => {
  const accessResult = useMemo(() => {
    if (!user) {
      return { hasAccess: false, userPlan: null as PlanType | null }
    }
    
    const comparison = comparePlans(user.plan, requiredPlan)
    
    if (!comparison.hasAccess && onAccessDenied) {
      onAccessDenied(user.plan, requiredPlan)
    }
    
    return { 
      hasAccess: comparison.hasAccess, 
      userPlan: user.plan 
    }
  }, [user?.plan, requiredPlan, onAccessDenied])

  if (!accessResult.hasAccess) {
    return showFallback ? <>{fallback}</> : null
  }

  return <>{children}</>
})

FeatureGuard.displayName = 'FeatureGuard'

export default FeatureGuard
