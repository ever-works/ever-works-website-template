"use client";
import { useEffect, useState } from 'react';
import { PaymentCard } from '@/components/settings/billing/PaymentCard';
import { SubscriptionCard } from '@/components/settings/billing/SubscriptionCard';

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
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setPayments([
        { id: '1', date: '2024-05-01T12:30:00', amount: 29.99, plan: 'Pro', status: 'Paid' },
        { id: '2', date: '2024-04-01T09:00:00', amount: 29.99, plan: 'Pro', status: 'Paid' },
        { id: '3', date: '2024-03-01T07:00:00', amount: 29.99, plan: 'Pro', status: 'Failed' },
      ]);
      setSubscription({
        plan: 'Pro',
        startDate: '2024-03-01T08:00:00',
        renewalDate: '2024-06-01T08:00:00',
        status: 'Active',
      });
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Billing & Subscription</h1>
      {loading ? (
        <div className="text-center py-8" role="status" aria-live="polite">Loading...</div>
      ) : (
        <>
          {subscription && <SubscriptionCard subscription={subscription} />}
          <h2 className="text-lg font-semibold mb-4">Payment History</h2>
          {payments.length === 0 ? (
            <div className="text-gray-500">No payment history found.</div>
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