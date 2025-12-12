'use client';

import { ArrowLeft, ArrowRight, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { NAVIGATION_CLASSES, STEP_DEFINITIONS } from '../validation/form-validators';

interface FormNavigationProps {
	currentStep: number;
	canProceed: boolean;
	completedRequiredFields: number;
	requiredFieldsCount: number;
	onPrevious: () => void;
	onNext: () => void;
	onBack: () => void;
	isSubmitting?: boolean;
}

export function FormNavigation({
	currentStep,
	canProceed,
	completedRequiredFields,
	requiredFieldsCount,
	onPrevious,
	onNext,
	onBack,
	isSubmitting = false
}: FormNavigationProps) {
	const isLastStep = currentStep === STEP_DEFINITIONS.length;

	return (
		<div className={NAVIGATION_CLASSES.container} style={{ animationDelay: '0.5s' }}>
			<div className="flex gap-4">
				{currentStep > 1 && (
					<Button
						type="button"
						onClick={onPrevious}
						variant="outline"
						className={NAVIGATION_CLASSES.button.base}
					>
						<div className="flex items-center gap-3">
							<ArrowLeft className="w-5 h-5" />
							<span>Previous</span>
						</div>
					</Button>
				)}

				{currentStep === 1 && (
					<Button
						type="button"
						onClick={onBack}
						variant="outline"
						className={NAVIGATION_CLASSES.button.base}
					>
						<div className="flex items-center gap-3">
							<ArrowLeft className="w-5 h-5" />
							<span>Back to Plans</span>
						</div>
					</Button>
				)}
			</div>

			<div className="flex gap-4">
				{!isLastStep ? (
					<Button
						type="button"
						onClick={onNext}
						disabled={!canProceed}
						className={cn(
							!canProceed
								? NAVIGATION_CLASSES.button.next.disabled
								: NAVIGATION_CLASSES.button.next.enabled
						)}
					>
						<div className="flex items-center gap-3">
							<span>Next Step</span>
							<ArrowRight className="w-5 h-5" />
						</div>
					</Button>
				) : (
					<Button
						type="submit"
						disabled={completedRequiredFields < requiredFieldsCount || isSubmitting}
						className={cn(
							completedRequiredFields < requiredFieldsCount || isSubmitting
								? NAVIGATION_CLASSES.button.submit.disabled
								: NAVIGATION_CLASSES.button.submit.enabled
						)}
					>
						<div className="flex items-center gap-3">
							{isSubmitting ? (
								<>
									<Loader2 className="w-5 h-5 animate-spin" />
									<span>Submitting...</span>
								</>
							) : (
								<>
									<span>Submit Product</span>
									<Check className="w-5 h-5" />
								</>
							)}
						</div>
					</Button>
				)}
			</div>
		</div>
	);
}
