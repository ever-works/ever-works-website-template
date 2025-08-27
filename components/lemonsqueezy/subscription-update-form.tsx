"use client";

import { useState } from 'react';
import { useUpdateSubscription, subscriptionUpdateUtils } from '@/hooks/use-lemonsqueezy-update';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Pause,
  Play,
  X,
  RotateCcw,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

interface SubscriptionUpdateFormProps {
	subscriptionId: string;
	currentStatus?: string;
	currentPriceId?: string;
	onSuccess?: () => void;
	className?: string;
}

export function SubscriptionUpdateForm({
	subscriptionId,
	currentStatus = 'active',
	currentPriceId,
	onSuccess,
	className = ''
}: SubscriptionUpdateFormProps) {
	const [newPriceId, setNewPriceId] = useState(currentPriceId || '');
	const [customMetadata, setCustomMetadata] = useState('');
	
	const {
		updateSubscription,
		isUpdating,
		isSuccess,
		isError,
		error,
		data,
		reset
	} = useUpdateSubscription({
		onSuccess: () => {
			onSuccess?.();
			// Reset form after successful update
			setTimeout(() => reset(), 3000);
		},
		onError: (error) => {
			console.error('Subscription update failed:', error);
		}
	});

	const handleQuickAction = async (action: () => any) => {
		try {
			await updateSubscription(action());
		} catch (error) {
			console.error('Quick action failed:', error);
		}
	};

	const handleCustomUpdate = async () => {
		try {
			const params: any = { subscriptionId };
			
			if (newPriceId && newPriceId !== currentPriceId) {
				params.priceId = newPriceId;
			}
			
			if (customMetadata.trim()) {
				try {
					params.metadata = JSON.parse(customMetadata);
				} catch {
					params.metadata = { custom: customMetadata };
				}
			}
			
			await updateSubscription(params);
		} catch (error) {
			console.error('Custom update failed:', error);
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case 'active': return 'bg-green-100 text-green-800';
			case 'paused': return 'bg-yellow-100 text-yellow-800';
			case 'cancelled': return 'bg-red-100 text-red-800';
			case 'on_trial': return 'bg-blue-100 text-blue-800';
			case 'past_due': return 'bg-orange-100 text-orange-800';
			default: return 'bg-gray-100 text-gray-800';
		}
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<CreditCard className="w-5 h-5" />
					Update Subscription
				</CardTitle>
				<CardDescription>
					Manage your LemonSqueezy subscription settings and status
				</CardDescription>
			</CardHeader>
			
			<CardContent className="space-y-6">
				{/* Current Status Display */}
				<div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
					<span className="text-sm font-medium">Current Status:</span>
					<Badge className={getStatusColor(currentStatus)}>
						{currentStatus}
					</Badge>
				</div>

				{/* Quick Actions */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Quick Actions</h3>
					<div className="grid grid-cols-2 gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleQuickAction(() => subscriptionUpdateUtils.pause(subscriptionId))}
							disabled={isUpdating || currentStatus === 'paused'}
							className="flex items-center gap-2"
						>
							<Pause className="w-4 h-4" />
							Pause
						</Button>
						
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleQuickAction(() => subscriptionUpdateUtils.resume(subscriptionId))}
							disabled={isUpdating || currentStatus === 'active'}
							className="flex items-center gap-2"
						>
							<Play className="w-4 h-4" />
							Resume
						</Button>
						
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleQuickAction(() => subscriptionUpdateUtils.cancelAtPeriodEnd(subscriptionId))}
							disabled={isUpdating || currentStatus === 'cancelled'}
							className="flex items-center gap-2"
						>
							<X className="w-4 h-4" />
							Cancel
						</Button>
						
						<Button
							variant="outline"
							size="sm"
							onClick={() => handleQuickAction(() => subscriptionUpdateUtils.reactivate(subscriptionId))}
							disabled={isUpdating || currentStatus !== 'cancelled'}
							className="flex items-center gap-2"
						>
							<RotateCcw className="w-4 h-4" />
							Reactivate
						</Button>
					</div>
				</div>

				{/* Custom Update Form */}
				<div className="space-y-3">
					<h3 className="text-sm font-medium">Custom Update</h3>
					
					<div className="space-y-2">
						<Label htmlFor="price-id">New Price ID</Label>
						<Input
							id="price-id"
							placeholder="Enter new price ID"
							value={newPriceId}
							onChange={(e) => setNewPriceId(e.target.value)}
							disabled={isUpdating}
						/>
					</div>
					
					<div className="space-y-2">
						<Label htmlFor="metadata">Custom Metadata (JSON)</Label>
						<Input
							id="metadata"
							placeholder='{"key": "value"}'
							value={customMetadata}
							onChange={(e) => setCustomMetadata(e.target.value)}
							disabled={isUpdating}
						/>
					</div>
					
					<Button
						onClick={handleCustomUpdate}
						disabled={isUpdating || (!newPriceId && !customMetadata.trim())}
						className="w-full"
					>
						{isUpdating ? (
							<>
								<Loader2 className="w-4 h-4 mr-2 animate-spin" />
								Updating...
							</>
						) : (
							'Update Subscription'
						)}
					</Button>
				</div>

				{/* Status Messages */}
				{isSuccess && (
					<Alert className="border-green-200 bg-green-50">
						<CheckCircle className="w-4 h-4 text-green-600" />
						<AlertDescription className="text-green-800">
							Subscription updated successfully!
						</AlertDescription>
					</Alert>
				)}

				{isError && (
					<Alert className="border-red-200 bg-red-50">
						<AlertCircle className="w-4 h-4 text-red-600" />
						<AlertDescription className="text-red-800">
							{error?.message || 'Failed to update subscription'}
						</AlertDescription>
					</Alert>
				)}

				{/* Success Data Display */}
				{data && (
					<div className="p-3 bg-green-50 border border-green-200 rounded-lg">
						<h4 className="text-sm font-medium text-green-800 mb-2">Update Result:</h4>
						<pre className="text-xs text-green-700 overflow-auto">
							{JSON.stringify(data, null, 2)}
						</pre>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
