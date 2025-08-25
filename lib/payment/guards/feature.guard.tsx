import React, { memo, useMemo } from 'react'

export type PlanType = "FREE" | "STANDARD" | "PREMIUM"

const PLAN_HIERARCHY: readonly PlanType[] = ["FREE", "STANDARD", "PREMIUM"] as const

export interface User {
  readonly id: string
  readonly plan: PlanType
  readonly featureOverrides?: readonly string[] // Feature flags for special access
  readonly isAdmin?: boolean // Admin override
}

export interface FeatureGuardProps {
  readonly user: User | null | undefined
  readonly requiredPlan: PlanType
  readonly children: React.ReactNode
  readonly fallback?: React.ReactNode
  readonly showFallback?: boolean
  readonly onAccessDenied?: (userPlan: PlanType, requiredPlan: PlanType) => void
  readonly featureId?: string // Unique identifier for the feature
  readonly allowOverride?: boolean // Whether to check for overrides
}

// Utility type for plan comparison
type PlanComparison = {
  readonly userLevel: number
  readonly requiredLevel: number
  readonly hasAccess: boolean
  readonly isOverride?: boolean
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

/**
 * Checks if user has override access to a specific feature
 */
export const hasFeatureOverride = (user: User, featureId: string): boolean => {
  return user.isAdmin || user.featureOverrides?.includes(featureId) || false
}

/**
 * Global feature override configuration
 */
export const FEATURE_OVERRIDES = {
  // Temporarily allow FREE users to access PREMIUM features
  ALLOW_FREE_PREMIUM: process.env.NODE_ENV === 'development' || false,
  
  // Specific features that FREE users can access
  FREE_ACCESS_FEATURES: [
    'premium-analytics',
    'advanced-export',
    'priority-support'
  ] as const
} as const

const FeatureGuard: React.FC<FeatureGuardProps> = memo(({ 
  user, 
  requiredPlan, 
  children, 
  fallback = null,
  showFallback = false,
  onAccessDenied,
  featureId,
  allowOverride = true
}) => {
  const accessResult = useMemo(() => {
    if (!user) {
      return { hasAccess: false, userPlan: null as PlanType | null, isOverride: false }
    }
    
    const comparison = comparePlans(user.plan, requiredPlan)
    let hasAccess = comparison.hasAccess
    let isOverride = false
    
    // Check for overrides if access is denied and overrides are allowed
    if (!hasAccess && allowOverride) {
      // Admin override
      if (user.isAdmin) {
        hasAccess = true
        isOverride = true
      }
      // Feature-specific override
      else if (featureId && hasFeatureOverride(user, featureId)) {
        hasAccess = true
        isOverride = true
      }
      // Global override for development
      else if (FEATURE_OVERRIDES.ALLOW_FREE_PREMIUM && user.plan === 'FREE') {
        hasAccess = true
        isOverride = true
      }
      // Specific feature overrides
      else if (featureId && FEATURE_OVERRIDES.FREE_ACCESS_FEATURES.includes(featureId as any)) {
        hasAccess = true
        isOverride = true
      }
    }
    
    // Call callback only if access is still denied after overrides
    if (!hasAccess && onAccessDenied) {
      onAccessDenied(user.plan, requiredPlan)
    }
    
    return { 
      hasAccess, 
      userPlan: user.plan,
      isOverride
    }
  }, [user?.plan, user?.featureOverrides, user?.isAdmin, requiredPlan, onAccessDenied, featureId, allowOverride])

  if (!accessResult.hasAccess) {
    return showFallback ? <>{fallback}</> : null
  }

  return <>{children}</>
})

FeatureGuard.displayName = 'FeatureGuard'

export default FeatureGuard
