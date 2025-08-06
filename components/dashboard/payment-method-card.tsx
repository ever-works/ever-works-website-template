'use client';

import { Edit, Trash2, Star, Calendar, Shield, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { getCardBrandInfo, PaymentMethodData } from '@/hooks/use-payment-methods';
import { Badge } from '@heroui/react';

interface PaymentMethodCardProps {
	paymentMethod: PaymentMethodData;
	isDefault?: boolean;
	onEdit: (paymentMethod: PaymentMethodData) => void;
	onDelete?: (paymentMethodId: string) => void;
	onSetDefault?: (paymentMethodId: string) => void;
	isDeleting?: boolean;
	isSettingDefault?: boolean;
	className?: string;
}

const formatExpiryDate = (month: number, year: number) => {
	return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
};



export function PaymentMethodCard({
	paymentMethod,
	isDefault,
	onEdit,
	onDelete,
	onSetDefault,
	isSettingDefault
}: PaymentMethodCardProps) {
	const t = useTranslations('billing');
	const { card } = paymentMethod;
	const info = getCardBrandInfo(card.brand);
	const expiryDate = formatExpiryDate(card.exp_month, card.exp_year);

	return (
		<div className="relative group">
			<div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-gray-200 dark:border-gray-600 hover:shadow-md transition-all duration-200">
				<div className="flex items-start justify-between">
					<div className="flex items-start space-x-4 flex-1">
						<div
							className={`w-12 h-8 bg-gradient-to-r ${info.color} rounded-md flex items-center justify-center text-white text-lg font-bold shadow-sm`}
						>
							{info.text}
						</div>

						<div className="flex-1">
							<div className="flex items-center space-x-2 mb-1">
								<h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
									{card.brand} •••• {card.last4}
								</h4>
								{isDefault && (
									<Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
										<Star className="h-3 w-3 mr-1" />
										{t('DEFAULT')}
									</Badge>
								)}
							</div>

							<div className="space-y-1">
								{/* Cardholder name */}
								{paymentMethod.billing_details?.name && (
									<div className="text-sm font-medium text-gray-700 dark:text-gray-300">
										{paymentMethod.billing_details.name}
									</div>
								)}

								<div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
									<div className="flex items-center space-x-1">
										<div className="flex items-center space-x-1">
											<Calendar className="h-3 w-3" />
											<span>{t('EXPIRES', { date: expiryDate })}</span>
										</div>

										<div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
											<span className="capitalize">
												{card.funding} • {card.brand}
											</span>
										</div>
									</div>
									<div className="flex items-center space-x-1">
										<Shield className="h-3 w-3" />
										<span>
											{t('ADDED_ON', {
												date: new Date(paymentMethod.created * 1000).toLocaleDateString()
											})}
										</span>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Actions */}
					<div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
						{!isDefault && onSetDefault && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => onSetDefault(paymentMethod.id)}
								disabled={isSettingDefault}
								className="text-xs"
							>
								{isSettingDefault ? (
									<>
										<Loader2 className="h-3 w-3 mr-1 animate-spin" />
										Loading...
									</>
								) : (
									t('SET_AS_DEFAULT')
								)}
							</Button>
						)}
						{onEdit && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => onEdit(paymentMethod)}
								className="p-2"
							>
								<Edit className="h-3 w-3" />
							</Button>
						)}
						{onDelete && (
							<Button
								variant="outline"
								size="sm"
								onClick={() => onDelete(paymentMethod.id)}
								className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
							>
								<Trash2 className="h-3 w-3" />
							</Button>
						)}
					</div>
				</div>

				{(() => {
					const currentDate = new Date();
					// const expiryDate = new Date(expiryYear, expiryMonth - 1);
					const monthsUntilExpiry =
						(card.exp_year - currentDate.getFullYear()) * 12 + (card.exp_month - currentDate.getMonth());

					if (monthsUntilExpiry < 0) {
						return (
							<div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
								<p className="text-xs text-red-800 dark:text-red-200 font-medium">
									{t('CARD_EXPIRED')}
								</p>
							</div>
						);
					} else if (monthsUntilExpiry <= 2) {
						return (
							<div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
								<p className="text-xs text-yellow-800 dark:text-yellow-200 font-medium">
									{t('CARD_EXPIRES_SOON', { months: monthsUntilExpiry })}
								</p>
							</div>
						);
					}
					return null;
				})()}
			</div>
		</div>
	);
}
