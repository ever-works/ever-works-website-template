"use client";
import { useEffect, useState } from 'react';
import { PaymentCard } from '@/components/settings/billing/PaymentCard';
import { SubscriptionCard } from '@/components/settings/billing/SubscriptionCard';
import { useCurrentUser } from '@/hooks/use-current-user';
import { apiUtils, serverClient } from '@/lib/api/server-api-client';

interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: string;
}

interface SubscriptionInfo {
  plan: string;
  startDate: string;
  renewalDate: string;
  status: string;
}

export default function BillingPage() {
  const { user } = useCurrentUser();
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBillingData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setError(null);

        // Fetch subscription data
        const subscriptionResponse = await serverClient.get<SubscriptionInfo>('/api/user/subscription');
        if (apiUtils.isSuccess(subscriptionResponse)) {
          setSubscription(subscriptionResponse.data);
        } else {
          console.warn('Failed to fetch subscription:', apiUtils.getErrorMessage(subscriptionResponse));
        }

        // Fetch payment history
        const paymentsResponse = await serverClient.get<PaymentHistoryItem[]>('/api/user/payments');
        if (apiUtils.isSuccess(paymentsResponse)) {
          setPayments(paymentsResponse.data);
        } else {
          console.warn('Failed to fetch payments:', apiUtils.getErrorMessage(paymentsResponse));
        }
      } catch (err) {
        console.error('Failed to fetch billing data:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to load billing information. Please try again.';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingData();
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
        <div className="text-center py-8">
          <p>Please sign in to view your billing information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading billing information...</p>
        </div>
      ) : (
        <>
          {subscription ? (
            <SubscriptionCard subscription={subscription} />
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Welcome to Ever Works!</h3>
              <p className="text-blue-700 mb-4">You&apos;re currently on the free plan. Upgrade to unlock premium features.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Upgrade Now
              </button>
            </div>
          )}

          <h2 className="text-lg font-semibold mb-4">Payment History</h2>
          {payments.length === 0 ? (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
              <div className="text-gray-400 text-4xl mb-2">💳</div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No payment history</h3>
              <p className="text-gray-500">Your payment transactions will appear here once you make a purchase.</p>
            </div>
          ) : (
            <div>
              {payments.map((p) => (
                <PaymentCard key={p.id} payment={p} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}