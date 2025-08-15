import { Calendar, CreditCard, Clock, TrendingUp, Crown, CheckCircle, AlertCircle } from 'lucide-react';

interface SubscriptionInfo {
  id: string;
  planId: string;
  planName: string;
  status: string;
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  paymentProvider: string;
  subscriptionId: string;
  amount: number;
  currency: string;
  billingInterval: string;
}

const formatDate = (date: string) => new Date(date).toLocaleDateString(undefined, { 
  year: 'numeric', 
  month: 'short', 
  day: 'numeric' 
});

const formatAmount = (amount: number, currency: string) => {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'CAD': 'C$',
    'AUD': 'A$'
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol}${amount.toFixed(2)}`;
};

const getStatusConfig = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return {
        color: 'text-emerald-600 dark:text-emerald-400',
        bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
        borderColor: 'border-emerald-200 dark:border-emerald-700/50',
        icon: CheckCircle,
        label: 'Active'
      };
    case 'trialing':
      return {
        color: 'text-theme-primary-600 dark:text-theme-primary-400',
        bgColor: 'bg-theme-primary-50 dark:bg-theme-primary-900/20',
        borderColor: 'border-theme-primary-200 dark:border-theme-primary-700/50',
        icon: Clock,
        label: 'Trial'
      };
    case 'past_due':
      return {
        color: 'text-orange-600 dark:text-orange-400',
        bgColor: 'bg-orange-50 dark:bg-orange-900/20',
        borderColor: 'border-orange-200 dark:border-orange-700/50',
        icon: AlertCircle,
        label: 'Past Due'
      };
    case 'cancelled':
      return {
        color: 'text-red-600 dark:text-red-400',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-700/50',
        icon: AlertCircle,
        label: 'Cancelled'
      };
    default:
      return {
        color: 'text-slate-600 dark:text-slate-400',
        bgColor: 'bg-slate-50 dark:bg-slate-900/20',
        borderColor: 'border-slate-200 dark:border-slate-700/50',
        icon: Clock,
        label: status.charAt(0).toUpperCase() + status.slice(1)
      };
  }
};

const getPlanIcon = (planName: string) => {
  const lowerPlan = planName.toLowerCase();
  if (lowerPlan.includes('premium') || lowerPlan.includes('pro')) {
    return Crown;
  }
  if (lowerPlan.includes('enterprise') || lowerPlan.includes('business')) {
    return TrendingUp;
  }
  return Calendar;
};

export function SubscriptionCard({ subscription }: { subscription: SubscriptionInfo }) {
  const statusConfig = getStatusConfig(subscription.status);
  const StatusIcon = statusConfig.icon;
  const PlanIcon = getPlanIcon(subscription.planName);
  
  const isActive = subscription.status.toLowerCase() === 'active';
  const isTrialing = subscription.status.toLowerCase() === 'trialing';

  return (
    <div className="relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-theme-primary-50 dark:from-slate-900/50 dark:via-slate-800 dark:to-theme-primary-900/30 opacity-60"></div>
      
      {/* Main Card */}
      <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              isActive ? 'bg-gradient-to-br from-emerald-500 to-teal-500' :
              isTrialing ? 'bg-gradient-to-br from-theme-primary-500 to-theme-primary-600' :
              'bg-gradient-to-br from-slate-500 to-gray-500'
            } shadow-lg group-hover:scale-105 transition-transform duration-300`}>
              <PlanIcon className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
                {subscription.planName}
              </h3>
              
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor}`}>
                  <StatusIcon className="w-4 h-4" />
                  {statusConfig.label}
                </span>
                
                {isActive && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full border border-emerald-200 dark:border-emerald-700/50">
                    <CheckCircle className="w-3 h-3" />
                    Current
                  </span>
                )}
                
                {isTrialing && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-theme-primary-100 dark:bg-theme-primary-900/30 text-theme-primary-700 dark:text-theme-primary-300 text-xs font-medium rounded-full border border-theme-primary-200 dark:border-theme-primary-700/50">
                    <Clock className="w-3 h-3" />
                    Trial Period
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Price Section */}
          <div className="text-right">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-1 group-hover:text-slate-800 dark:group-hover:text-white transition-colors">
              {formatAmount(subscription.amount, subscription.currency)}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-300 font-medium">
              per {subscription.billingInterval}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-2 bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-600/50">
              ID: {subscription.subscriptionId.slice(-8)}
            </div>
          </div>
        </div>
        
        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Started</span>
            </div>
            <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
              {formatDate(subscription.startDate)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl p-4 border border-emerald-200 dark:border-emerald-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-800/50 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Next Billing</span>
            </div>
            <div className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
              {formatDate(subscription.nextBillingDate)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-900/20 dark:to-violet-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-purple-100 dark:bg-purple-800/50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-sm font-medium text-purple-700 dark:text-purple-300">Billing Cycle</span>
            </div>
            <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
              {subscription.billingInterval.charAt(0).toUpperCase() + subscription.billingInterval.slice(1)}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-4 border border-orange-200 dark:border-orange-700/50">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-orange-100 dark:bg-orange-800/50 rounded-lg flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Payment Method</span>
            </div>
            <div className="text-lg font-semibold text-orange-900 dark:text-orange-100">
              {subscription.paymentProvider.charAt(0).toUpperCase() + subscription.paymentProvider.slice(1)}
            </div>
          </div>
        </div>
        
        {/* Footer Section */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
              <span className="font-medium">Subscription ID:</span>
              <code className="bg-slate-100 dark:bg-slate-700/50 px-2 py-1 rounded text-xs font-mono border border-slate-200 dark:border-slate-600/50">
                {subscription.id}
              </code>
            </div>
            
            <div className="flex items-center gap-3">
              <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700/50 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600/50 transition-colors border border-slate-200 dark:border-slate-600/50">
                <Calendar className="w-4 h-4" />
                View Details
              </button>
              
              <button className="inline-flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-theme-primary-600 to-theme-primary-700 rounded-lg hover:from-theme-primary-700 hover:to-theme-primary-800 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                <TrendingUp className="w-4 h-4" />
                Manage
              </button>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-theme-primary-100 to-theme-primary-200 dark:from-theme-primary-900/30 dark:to-theme-primary-800/30 rounded-full opacity-20 -translate-y-16 translate-x-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 rounded-full opacity-20 translate-y-12 -translate-x-12"></div>
      </div>
    </div>
  );
} 