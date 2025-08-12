'use client';
import { useState } from 'react';
import { PaymentCard } from '@/components/settings/billing/PaymentCard';
import { SubscriptionCard } from '@/components/settings/billing/SubscriptionCard';
import { SubscriptionHistoryCard } from '@/components/settings/billing/SubscriptionHistoryCard';
import { useBillingData } from '@/hooks/use-billing-data';
import { Container } from '@/components/ui/container';
import { CreditCard, Zap, ChevronRight, Plus, Download } from 'lucide-react';
import { BillingStats } from '@/components/settings/billing/BillingStats';
import { TabNavigation } from '@/components/settings/billing/TabNavigation';
import { SearchAndFilters } from '@/components/settings/billing/SearchAndFilters';
import {
  SubscriptionEmptyState,
  PaymentsEmptyState,
  SubscriptionsEmptyState,
  OverviewEmptyState
} from '@/components/settings/billing/EmptyState';

export default function BillingPage() {
	const {
		subscription,
		payments,
		loading,
		refresh,
		refreshSubscription,
		refreshPayments,
		isRefreshing,
		isRefreshingSubscription,
		isRefreshingPayments
	} = useBillingData();

	const [activeTab, setActiveTab] = useState<'overview' | 'payments' | 'subscriptions'>('overview');
	const [searchTerm, setSearchTerm] = useState('');


	if (!subscription && !loading) {
		return (
			<Container maxWidth="7xl" padding="default">
				<div className="text-center py-16">
					<div className="max-w-md mx-auto">
						<div className="w-24 h-24 bg-gradient-to-br from-theme-primary-100 to-theme-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
							<CreditCard className="w-12 h-12 text-theme-primary-600" />
						</div>
						<h2 className="text-2xl font-bold text-gray-900 mb-3">Welcome to Ever Works!</h2>
						<p className="text-gray-600 mb-8">
							You're currently on the free plan. Upgrade to unlock premium features and start building
							your success.
						</p>
						<div className="space-y-3">
							<button className="w-full bg-gradient-to-r from-theme-primary-600 to-theme-primary-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-theme-primary-700 hover:to-theme-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5">
								<Plus className="w-5 h-5 inline mr-2" />
								Upgrade Now
							</button>
							<button className="w-full bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors">
								View Plans
							</button>
						</div>
					</div>
				</div>
			</Container>
		);
	}

	// Filter payments based on search
	const filteredPayments = payments.filter(
		(payment) =>
			payment?.plan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment?.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment?.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
			payment?.planId?.toLowerCase().includes(searchTerm.toLowerCase())
	);

	// Calculate summary statistics
	const totalSpent = payments.reduce((sum, payment) => sum + payment.amount, 0);
	const activePayments = payments.filter((p) => p.status === 'Paid').length;
	const monthlyAverage = payments.length > 0 ? totalSpent / payments.length : 0;

	return (
		<Container maxWidth="7xl" padding="default">
			{/* Header Section */}
			<div className="mb-8 py-16">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-gray-600 dark:text-gray-100 mb-2">
							Billing & Subscription
						</h1>
						<p className="text-gray-600 dark:text-gray-400">
							Manage your subscription, view payment history, and monitor your billing status
						</p>
					</div>

					<div className="flex items-center gap-3">
						<button
							onClick={refresh}
							disabled={isRefreshing}
							className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 dark:text-slate-100"
						>
							<Zap className="w-4 h-4" />
							{isRefreshing ? 'Refreshing...' : 'Refresh All'}
						</button>

						<button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-theme-primary-600 rounded-lg hover:bg-theme-primary-700 transition-colors">
							<Download className="w-4 h-4" />
							Export
						</button>
					</div>
				</div>
			</div>

			{/* Loading State */}
			{loading && (
				<div className="text-center py-16 dark:bg-slate-800 dark:text-slate-100">
					<div className="inline-flex items-center gap-3 px-6 py-3 bg-theme-primary-50 border border-theme-primary-200 rounded-full">
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-theme-primary-600"></div>
						<span className="text-theme-primary-700 font-medium">Loading billing information...</span>
					</div>
				</div>
			)}

			{!loading && (
				<>
					<BillingStats
						totalSpent={totalSpent}
						activePayments={activePayments}
						monthlyAverage={monthlyAverage}
						hasActiveSubscription={subscription?.hasActiveSubscription || false}
						totalPayments={payments.length}
						currency={subscription?.currentSubscription?.currency || 'USD'}
						planName={subscription?.currentSubscription?.planName || 'Basic Plan'}
					/>

					{/* Navigation Tabs */}
					<TabNavigation
						activeTab={activeTab}
						paymentsCount={payments.length}
						subscriptionsCount={subscription?.subscriptionHistory?.length || 0}
						onTabChange={(tabId) => setActiveTab(tabId as 'overview' | 'payments' | 'subscriptions')}
					/>

					{/* Tab Content */}
					{activeTab === 'overview' && (
						<div className="space-y-8">
							{/* Current Subscription Section */}
							<div className="bg-white dark:bg-slate-800  border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
								<div className="flex items-center justify-between mb-6">
									<h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">
										Current Subscription
									</h2>
									<button
										onClick={refreshSubscription}
										disabled={isRefreshingSubscription}
										className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-theme-primary-600 hover:text-theme-primary-700 underline disabled:opacity-50"
									>
										{isRefreshingSubscription ? 'Refreshing...' : 'Refresh'}
									</button>
								</div>

								{subscription?.hasActiveSubscription && subscription.currentSubscription ? (
									<SubscriptionCard subscription={subscription.currentSubscription} />
								) : (
									<SubscriptionEmptyState />
								)}
							</div>

							{/* Recent Activity */}
							<div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100 mb-6">
									Recent Activity
								</h2>

								{payments.length === 0 ? (
									<OverviewEmptyState />
								) : (
									<div className="space-y-4">
										{payments.slice(0, 3).map((payment) => (
											<div
												key={payment.id}
												className="flex items-center justify-between p-4 bg-gray-50 dark:bg-slate-800 rounded-lg hover:bg-gray-100 transition-colors shadow-sm border border-gray-200 dark:border-slate-700"
											>
												<div className="flex items-center gap-4">
													<div className="w-10 h-10 bg-theme-primary-100 dark:bg-theme-primary-10 rounded-lg flex items-center justify-center">
														<CreditCard className="w-5 h-5 text-theme-primary-600 dark:text-theme-primary-700" />
													</div>
													<div>
														<p className="font-medium text-gray-900 dark:text-slate-100">
															{payment.plan}
														</p>
														<p className="text-sm text-gray-500 dark:text-slate-400">
															{payment.description}
														</p>
													</div>
												</div>
												<div className="text-right">
													<p className="font-semibold text-gray-900 dark:text-slate-100">
														${payment.amount.toFixed(2)}
													</p>
													<p className="text-sm text-gray-500 dark:text-slate-400">
														{new Date(payment.date).toLocaleDateString('en-US', {
															month: 'long',
															day: 'numeric',
															year: 'numeric'
														})}
													</p>
												</div>
											</div>
										))}

										{payments.length > 3 && (
											<button className="w-full text-center py-3 text-theme-primary-600 hover:text-theme-primary-700 font-medium transition-colors">
												View All Activity
												<ChevronRight className="w-4 h-4 inline ml-2" />
											</button>
										)}
									</div>
								)}
							</div>
						</div>
					)}

					{activeTab === 'payments' && (
						<div className="space-y-6">
							<SearchAndFilters
								searchTerm={searchTerm}
								onSearchChange={setSearchTerm}
								onRefresh={refreshPayments}
								isRefreshing={isRefreshingPayments}
								totalResults={filteredPayments.length}
							/>

							{filteredPayments.length === 0 ? (
								<PaymentsEmptyState />
							) : (
								<div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
									<div className="space-y-4">
										{filteredPayments.map((payment) => (
											<PaymentCard key={payment.id} payment={payment} />
										))}
									</div>
								</div>
							)}
						</div>
					)}

					{activeTab === 'subscriptions' && (
						<div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl p-6 shadow-sm">
							<div className="flex items-center justify-between mb-6">
								<h2 className="text-xl font-semibold text-gray-900 dark:text-slate-100">Subscription History</h2>
								<button
									onClick={refreshSubscription}
									disabled={isRefreshingSubscription}
									className="inline-flex items-center gap-2 px-3 py-2 text-sm text-theme-primary-600 hover:text-theme-primary-700 underline disabled:opacity-50"
								>
									{isRefreshingSubscription ? 'Refreshing...' : 'Refresh'}
								</button>
							</div>

							{!subscription?.subscriptionHistory || subscription.subscriptionHistory.length === 0 ? (
								<SubscriptionsEmptyState />
							) : (
								<div className="space-y-4">
									{subscription.subscriptionHistory.map((sub) => (
										<SubscriptionHistoryCard key={sub.id} subscription={sub} />
									))}
								</div>
							)}
						</div>
					)}
				</>
			)}
		</Container>
	);
}
