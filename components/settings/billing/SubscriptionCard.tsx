
interface SubscriptionInfo {
  plan: string;
  startDate: string;
  renewalDate: string;
  status: string;
}

const formatDate = (date: string) => new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

export function SubscriptionCard({ subscription }: { subscription: SubscriptionInfo }) {
  return (
    <div className="flex items-center justify-between bg-blue-950 rounded-lg p-4 mb-6 shadow border border-blue-900">
      <div className="flex items-center gap-3">
        <span className="text-2xl">📅</span>
        <div>
          <div className="font-semibold">Current Subscription: {subscription.plan}</div>
          <div className="text-sm text-gray-300">
            Renewal: <span className="font-medium">{formatDate(subscription.renewalDate)}</span> • Status: <span className="text-blue-400 font-medium">{subscription.status}</span>
          </div>
        </div>
      </div>
      <div className="text-xs text-gray-400 text-right min-w-[110px]">Started: {formatDate(subscription.startDate)}</div>
    </div>
  );
} 