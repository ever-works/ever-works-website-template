/**
 * Subscription Service
 * Handles all subscription-related business logic
 */

import * as queries from '@/lib/db/queries';
import {
    SubscriptionStatus, PlanType,
    type Subscription,
    type NewSubscription
} from '@/lib/db/schema';

export interface CreateSubscriptionData {
  userId: string;
  planId: 'free' | 'pro' | 'sponsor';
  paymentProvider: 'stripe' | 'lemonsqueezy'|'solidgate';
  subscriptionId: string;
  priceId?: string;
  customerId?: string;
  currency?: string;
  amount?: number;
  interval?: string;
  intervalCount?: number;
  startDate: Date;
  endDate?: Date;
  trialStart?: Date;
  trialEnd?: Date;
  metadata?: any;
}

export interface UpdateSubscriptionData {
  planId?: string;
  status?: string;
  endDate?: Date;
  amount?: number;
  interval?: string;
  intervalCount?: number;
  priceId?: string;
  metadata?: any;
}

export class SubscriptionService {
  /**
   * Create a new subscription
   */
  async createSubscription(data: CreateSubscriptionData): Promise<Subscription> {
    const newSubscription: NewSubscription = {
      userId: data.userId,
      planId: data.planId,
      status: SubscriptionStatus.PENDING,
      startDate: data.startDate,
      endDate: data.endDate,
      paymentProvider: data.paymentProvider,
      subscriptionId: data.subscriptionId,
      priceId: data.priceId,
      customerId: data.customerId,
      currency: data.currency || 'usd',
      amount: data.amount,
      interval: data.interval || 'month',
      intervalCount: data.intervalCount || 1,
      trialStart: data.trialStart,
      trialEnd: data.trialEnd,
      metadata: data.metadata ? JSON.stringify(data.metadata) : null
    };

    const subscription = await queries.createSubscription(newSubscription);

    // Log the creation
    await queries.logSubscriptionChange(
      subscription.id,
      'created',
      undefined,
      subscription.status,
      undefined,
      subscription.planId,
      'Subscription created',
      { source: 'subscription_service' }
    );

    return subscription;
  }

  /**
   * Get subscription by ID
   */
  async getSubscriptionById(subscriptionId: string): Promise<Subscription | null> {
    return await queries.getSubscriptionWithUser(subscriptionId);
  }

  /**
   * Get user's active subscription
   */
  async getUserActiveSubscription(userId: string): Promise<Subscription | null> {
    return await queries.getUserActiveSubscription(userId);
  }

  /**
   * Get all user subscriptions
   */
  async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    return await queries.getUserSubscriptions(userId);
  }

  /**
   * Get subscription by provider subscription ID
   */
  async getSubscriptionByProviderSubscriptionId(
    paymentProvider: string,
    subscriptionId: string
  ): Promise<Subscription | null> {
    return await queries.getSubscriptionByProviderSubscriptionId(paymentProvider, subscriptionId);
  }

  /**
   * Check if user has active subscription
   */
  async hasActiveSubscription(userId: string): Promise<boolean> {
    return await queries.hasActiveSubscription(userId);
  }

  /**
   * Get user's current plan
   */
  async getUserPlan(userId: string): Promise<string> {
    return await queries.getUserPlan(userId);
  }

  /**
   * Get subscription history
   */
  async getSubscriptionHistory(subscriptionId: string) {
    return await queries.getSubscriptionHistory(subscriptionId);
  }

  /**
   * Get subscriptions expiring soon
   */
  async getSubscriptionsExpiringSoon(days: number = 7): Promise<Subscription[]> {
    return await queries.getSubscriptionsExpiringSoon(days);
  }

  /**
   * Get subscription statistics
   */
  async getSubscriptionStats() {
    return await queries.getSubscriptionStats();
  }

  /**
   * Update subscription
   */
  async updateSubscription(
    subscriptionId: string,
    data: UpdateSubscriptionData
  ): Promise<Subscription | null> {
    const updateData: any = {
      ...data,
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined
    };

    return await queries.updateSubscription(subscriptionId, updateData);
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    reason?: string,
    cancelAtPeriodEnd: boolean = false
  ): Promise<Subscription | null> {
    return await queries.cancelSubscription(subscriptionId, reason, cancelAtPeriodEnd);
  }

  /**
   * Check if plan allows feature
   */
  async canAccessFeature(userId: string, feature: string): Promise<boolean> {
    const plan = await queries.getUserPlan(userId);
    
    const planFeatures = this.getPlanFeatures(plan);
    return planFeatures.includes(feature);
  }

  /**
   * Get plan features
   */
  private getPlanFeatures(planId: string): string[] {
    const features: Record<string, string[]> = {
      [PlanType.FREE]: ['basic_access'],
      [PlanType.PRO]: ['basic_access', 'advanced_features', 'pro_features', 'priority_support'],
      [PlanType.SPONSOR]: ['basic_access', 'advanced_features', 'pro_features', 'priority_support', 'premium_features', 'enterprise_features']
    };

    return features[planId] || features[PlanType.FREE];
  }

  /**
   * Get plan display name
   */
  getPlanDisplayName(planId: string): string {
    const planNames: Record<string, string> = {
      [PlanType.FREE]: 'Free Plan',
      [PlanType.PRO]: 'Pro Plan',
      [PlanType.SPONSOR]: 'Sponsor Plan'
    };

    return planNames[planId] || 'Unknown Plan';
  }

  /**
   * Get plan limits
   */
  getPlanLimits(planId: string): Record<string, number> {
    const limits: Record<string, Record<string, number>> = {
      [PlanType.FREE]: {
        projects: 1,
        storage: 100, // MB
        users: 1,
        apiCalls: 1000
      },
      [PlanType.PRO]: {
        projects: 5,
        storage: 1000, // MB
        users: 5,
        apiCalls: 10000
      },
      [PlanType.SPONSOR]: {
        projects: 100,
        storage: 50000, // MB
        users: 100,
        apiCalls: 500000
      },
    };

    return limits[planId] || limits[PlanType.FREE];
  }
}

// Export singleton instance
export const subscriptionService = new SubscriptionService();
