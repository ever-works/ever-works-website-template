'use client';

import { Check, Type, Tag, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STEP_INDICATOR_CLASSES, STEP_DEFINITIONS } from '../validation/form-validators';
import type { StepDefinition } from '../validation/form-validators';

interface StepIndicatorProps {
	currentStep: number;
	onStepClick: (stepId: number) => void;
}

const STEP_ICONS = {
	1: Type,
	2: Tag,
	3: Eye
};

export function StepIndicator({ currentStep, onStepClick }: StepIndicatorProps) {
	const steps: StepDefinition[] = STEP_DEFINITIONS.map((step) => ({
		...step,
		icon: STEP_ICONS[step.id as keyof typeof STEP_ICONS]
	}));

	return (
		<div className={STEP_INDICATOR_CLASSES.wrapper}>
			{steps.map((step, index) => {
				const IconComponent = step.icon || Type;
				const isActive = currentStep === step.id;
				const isCompleted = currentStep > step.id;
				const isAccessible = currentStep >= step.id;

				return (
					<div key={step.id} className="flex items-center">
						<div className={STEP_INDICATOR_CLASSES.stepContainer}>
							<button
								onClick={() => isAccessible && onStepClick(step.id)}
								disabled={!isAccessible}
								type="button"
								className={cn(
									STEP_INDICATOR_CLASSES.button.base,
									isActive && STEP_INDICATOR_CLASSES.button.active,
									isCompleted && STEP_INDICATOR_CLASSES.button.completed,
									isActive &&
										!isCompleted &&
										`bg-linear-to-r ${step.color} text-white shadow-lg`,
									!isActive &&
										!isCompleted &&
										!isAccessible &&
										STEP_INDICATOR_CLASSES.button.inaccessible,
									!isActive &&
										!isCompleted &&
										isAccessible &&
										STEP_INDICATOR_CLASSES.button.accessible
								)}
							>
								{isCompleted ? <Check className="w-5 h-5" /> : <IconComponent className="w-5 h-5" />}
							</button>
							<span
								className={cn(
									STEP_INDICATOR_CLASSES.label.base,
									isActive && STEP_INDICATOR_CLASSES.label.active,
									isCompleted && STEP_INDICATOR_CLASSES.label.completed,
									!isActive && !isCompleted && STEP_INDICATOR_CLASSES.label.default
								)}
							>
								{step.title}
							</span>
						</div>
						{index < steps.length - 1 && (
							<div
								className={cn(
									STEP_INDICATOR_CLASSES.connector.base,
									isCompleted
										? STEP_INDICATOR_CLASSES.connector.completed
										: STEP_INDICATOR_CLASSES.connector.default
								)}
							/>
						)}
					</div>
				);
			})}
		</div>
	);
}
