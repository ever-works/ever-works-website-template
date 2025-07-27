
interface PaymentHistoryItem {
  id: string;
  date: string;
  amount: number;
  plan: string;
  status: string;
}

const formatDate = (date: string) => new Date(date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
const formatAmount = (amount: number) => `$${amount.toFixed(2)}`;

export function PaymentCard({ payment }: { payment: PaymentHistoryItem }) {
  const statusColor = payment.status === 'Paid'
    ? 'text-green-400'
    : payment.status === 'Failed'
    ? 'text-red-400'
    : 'text-gray-400';
  return (
    <div className="flex items-center justify-between bg-gray-900 rounded-lg p-4 mb-4 shadow border border-gray-800">
      <div className="flex items-center gap-3">
        <span className="text-2xl">💳</span>
        <div>
          <div className="font-semibold">Paid {payment.plan} Plan</div>
          <div className="text-sm text-gray-400">
            Amount: {formatAmount(payment.amount)} • Status: <span className={statusColor}>{payment.status}</span>
          </div>
          <a href="#" className="text-blue-400 text-xs underline mt-1 inline-block">View Invoice →</a>
        </div>
      </div>
      <div className="text-xs text-gray-500 text-right min-w-[110px]">{formatDate(payment.date)}</div>
    </div>
  );
} 