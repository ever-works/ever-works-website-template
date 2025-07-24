'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle, Loader2, Star, CreditCard, Calendar, Gift, Folder, Zap, Shield, Smartphone, Download, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCurrentUser } from '@/hooks/use-current-user';

interface SubscriptionDetails {
  id: string;
  planName: string;
  price: number;
  interval: string;
  trialEnd?: number;
  status: string;
  customerEmail: string;
  nextPaymentDate?: number;
}

export default function SubscriptionSuccessPage() {
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useCurrentUser();

  const sessionId = searchParams.get('session_id');
  const subscriptionId = searchParams.get('subscription');
  const type = searchParams.get('type');

  useEffect(() => {
    if (sessionId) {
      fetchCheckoutSession(sessionId);
    } else if (subscriptionId && type === 'free') {
      setSubscriptionDetails({
        id: subscriptionId,
        planName: 'Free',
        price: 0,
        interval: 'month',
        status: 'active',
        customerEmail: user?.email || ''
      });
      setIsLoading(false);
    } else {
      setError('Invalid subscription details');
      setIsLoading(false);
    }
  }, [sessionId, subscriptionId, type, user?.email]);

  const getPlanFeatures = (planName: string) => {
    const features = {
      Free: [
        { icon: Folder, text: 'Basic Directory Template', color: 'text-blue-400' },
        { icon: BookOpen, text: 'Documentation Access', color: 'text-green-400' },
        { icon: Shield, text: 'Community Support', color: 'text-purple-400' }
      ],
      Pro: [
        { icon: Zap, text: 'Premium Directory Templates', color: 'text-yellow-400' },
        { icon: Smartphone, text: 'Mobile-First Design', color: 'text-blue-400' },
        { icon: Shield, text: 'Advanced Security Features', color: 'text-green-400' },
        { icon: Download, text: 'Source Code Access', color: 'text-purple-400' },
        { icon: CreditCard, text: 'Payment Integration', color: 'text-orange-400' },
        { icon: BookOpen, text: 'Priority Support', color: 'text-red-400' }
      ],
      Enterprise: [
        { icon: Zap, text: 'All Premium Features', color: 'text-yellow-400' },
        { icon: Folder, text: 'Custom Directory Solutions', color: 'text-blue-400' },
        { icon: Shield, text: 'Enterprise Security', color: 'text-green-400' },
        { icon: BookOpen, text: 'Dedicated Support', color: 'text-purple-400' },
        { icon: Download, text: 'White-label License', color: 'text-orange-400' }
      ]
    };
    return features[planName as keyof typeof features] || features.Free;
  };

  const fetchCheckoutSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/stripe/checkout?session_id=${sessionId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription details');
      }
      
      const data = await response.json();
      
      if (data.session) {
        const session = data.session;
        const subscription = data.subscription;
        
        setSubscriptionDetails({
          id: subscription?.id || sessionId,
          planName: session.metadata?.planName || 'Pro',
          price: session.amount_total / 100,
          interval: session.metadata?.billingInterval || 'month',
          trialEnd: subscription?.trial_end,
          status: subscription?.status || 'active',
          customerEmail: session.customer_details?.email || '',
          nextPaymentDate: subscription?.current_period_end
        });
      }
    } catch (err) {
      console.error('Error fetching checkout session:', err);
      setError('Failed to load subscription details');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-theme-primary mx-auto mb-4" />
          <p className="text-slate-300">Loading your subscription details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <Card className="bg-slate-800 border-slate-700 p-8 max-w-md">
          <div className="text-center">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-500 text-2xl">!</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
            <p className="text-slate-400 mb-6">{error}</p>
            <Button
              onClick={() => router.push('/pricing')}
              className="bg-theme-primary hover:bg-theme-primary/90 text-white"
            >
              Back to Pricing
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="px-6 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              🎉 Welcome to Ever Works {subscriptionDetails?.planName}!
            </h1>
            <p className="text-xl text-slate-300">
              Your directory template subscription has been successfully activated
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-theme-primary/20 rounded-full">
              <Folder className="w-4 h-4 text-theme-primary" />
              <span className="text-theme-primary font-medium">Ready to build amazing directories</span>
            </div>
          </div>

          {/* Subscription Details */}
          <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Left Column - Subscription Info */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-theme-primary" />
                  Subscription Details
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Plan</span>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">{subscriptionDetails?.planName}</span>
                      {subscriptionDetails?.planName !== 'Free' && (
                        <Star className="w-4 h-4 text-yellow-400" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Price</span>
                    <span className="text-white font-medium">
                      {subscriptionDetails?.price === 0 ? 'Free' : `$${subscriptionDetails?.price}/${subscriptionDetails?.interval}`}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Status</span>
                    <span className={cn(
                      "px-2 py-1 rounded-full text-xs font-medium",
                      subscriptionDetails?.status === 'active'
                        ? "bg-green-500/20 text-green-400"
                        : "bg-yellow-500/20 text-yellow-400"
                    )}>
                      {subscriptionDetails?.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Email</span>
                    <span className="text-white font-medium text-sm">{subscriptionDetails?.customerEmail}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Plan Features */}
              <div>
                <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-theme-primary" />
                  Your Plan Includes
                </h3>
                <div className="space-y-3">
                  {getPlanFeatures(subscriptionDetails?.planName || 'Free').map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <feature.icon className={cn("w-4 h-4", feature.color)} />
                      <span className="text-slate-300 text-sm">{feature.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>

          {/* Next Steps */}
          <Card className="bg-slate-800 border-slate-700 p-8 mb-8">
            <h3 className="text-xl font-bold text-white mb-6">What&apos;s Next?</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {subscriptionDetails?.trialEnd && (
                <div className="flex items-start gap-3 p-4 bg-blue-500/20 rounded-lg">
                  <Gift className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div>
                    <p className="text-blue-300 font-medium">Free Trial Active</p>
                    <p className="text-blue-200 text-sm">
                      Your trial ends on {new Date(subscriptionDetails.trialEnd * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {subscriptionDetails?.nextPaymentDate && (
                <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-slate-400 mt-0.5" />
                  <div>
                    <p className="text-slate-300 font-medium">Next Payment</p>
                    <p className="text-slate-400 text-sm">
                      {new Date(subscriptionDetails.nextPaymentDate * 1000).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-lg">
                <Download className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-300 font-medium">Download Templates</p>
                  <p className="text-slate-400 text-sm">
                    Access your directory templates and start building
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-700/50 rounded-lg">
                <BookOpen className="w-5 h-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-slate-300 font-medium">Documentation</p>
                  <p className="text-slate-400 text-sm">
                    Learn how to customize and deploy your directory
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-theme-primary hover:bg-theme-primary/90 text-white px-8 py-3"
            >
              <Folder className="w-4 h-4 mr-2" />
              Access Templates
            </Button>
            <Button
              onClick={() => router.push('/help')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              View Documentation
            </Button>
            <Button
              onClick={() => router.push('/pricing/manage')}
              variant="outline"
              className="border-slate-600 text-slate-300 hover:bg-slate-800 px-8 py-3"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Subscription
            </Button>
          </div>

          {/* Security Notice */}
          <div className="mt-12 text-center">
            <p className="text-slate-500 text-sm">
              🔒 This subscription is secured by Stripe. You can cancel anytime from your dashboard.
              <br />
              Start building your directory with the original Ever Works template.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 