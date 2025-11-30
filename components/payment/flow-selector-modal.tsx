'use client';

import { useMemo, memo } from 'react';
import { PaymentFlow } from '@/lib/payment/types/payment';
import { Card } from '@/components/ui/card';
import { Modal, ModalContent, ModalBody } from '@/components/ui/modal';
import { CreditCard, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaymentFlowSelectorModalProps {
	selectedFlow: PaymentFlow;
	title?: string;
	isOpen: boolean;
	onClose: () => void;
}

const FLOWS_DATA = [
	{
		flow: PaymentFlow.PAY_AT_START,
		title: 'Pay Now',
		description:
			'Payment required before submission. Your payment will be processed immediately when you select this option.',
		icon: CreditCard,
		gradient: 'from-theme-primary-500 to-theme-primary-600',
		benefits: ['Immediate processing', 'Priority review', 'Faster approval']
	},
	{
		flow: PaymentFlow.PAY_AT_END,
		title: 'Pay Later',
		description:
			"Payment after approval. You'll only be charged once your submission is approved and published.",
		icon: Clock,
		gradient: 'from-theme-primary-500 to-theme-primary-600',
		benefits: ['No upfront cost', 'Review before payment', 'Risk-free trial']
	}
] as const;

export const PaymentFlowSelectorModal = memo(function PaymentFlowSelectorModal({
	selectedFlow,
	title = 'Payment Flow Explanation', 
	isOpen,
	onClose
}: PaymentFlowSelectorModalProps) {
	const flows = useMemo(() => FLOWS_DATA, []);

	const modalContent = useMemo(() => {
		return flows.map((flowOption) => {
			const IconComponent = flowOption.icon;
			const isSelected = selectedFlow === flowOption.flow;

			return (
				<Card
					key={flowOption.flow}
					className={cn(
						'transition-all duration-200 hover:shadow-md w-full',
						isSelected
							? 'bg-blue-50/50 dark:bg-theme-primary-900/20 border-2 border-blue-400 dark:border-theme-primary-600 shadow-sm'
							: 'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600'
					)}
				>
					<div className="p-5 flex items-start gap-4">
						<div
							className={cn(
								'w-12 h-12 rounded-xl bg-theme-primary-500 dark:bg-theme-primary-600 flex items-center justify-center shrink-0 transition-all duration-200',
								isSelected && 'ring-2 ring-theme-primary-300 dark:ring-theme-primary-500 ring-offset-2 ring-offset-blue-50 dark:ring-offset-theme-primary-900/20'
							)}
						>
							<IconComponent className="w-6 h-6 text-white" />
						</div>
						<div className="flex-1 min-w-0">
							<div className="flex items-center gap-2.5 mb-2">
								<h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									{flowOption.title}
								</h3>
								{isSelected && (
									<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
								)}
							</div>
							<p className="text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed">
								{flowOption.description}
							</p>
							<div className="space-y-2">
								{flowOption.benefits.map((benefit, index) => (
									<div
										key={`${flowOption.flow}-${index}`}
										className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300"
									>
										<CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 flex-shrink-0" />
										<span>{benefit}</span>
									</div>
								))}
							</div>
						</div>
					</div>
				</Card>
			);
		});
	}, [flows, selectedFlow]);

	if (!isOpen) return null;

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			isDismissable={true}
			title={title}
			subtitle={'Learn about payment options and choose what works best for you'}
			size="lg"
			backdrop="opaque"
			hideCloseButton={false}
			className="bg-white dark:bg-gray-900 p-4"
		>
			<ModalContent>
					<ModalBody className="space-y-3">
						{modalContent}
					</ModalBody>
			</ModalContent>
		</Modal>
	);
});
