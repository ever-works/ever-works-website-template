'use client';

import { Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDetailForm } from '@/hooks/use-detail-form';
import { useEditorFieldSync } from '@/lib/editor/hooks/use-editor-sync';
import { Container } from '../ui/container';
import type { Category, ItemData, Tag as TagType } from '@/lib/content';
import { useEditor } from '@/lib/editor/hooks/use-editor';
import { StepIndicator } from './details-form/components/step-indicator';
import { FormNavigation } from './details-form/components/form-navigation';
import { BasicInfoStep } from './details-form/steps/basic-info-step';
import { PaymentStep } from './details-form/steps/payment-step';
import { ReviewStep } from './details-form/steps/review-step';
import type { FormData } from './details-form/validation/form-validators';
import {
	STEP_DEFINITIONS,
	PROGRESS_BAR_CLASSES,
	HEADER_CLASSES,
	BACKGROUND_CLASSES
} from './details-form/validation/form-validators';

type ListingProps = {
	categories?: Category[];
	tags?: TagType[];
	items?: ItemData[];
};

interface DetailsFormProps {
	initialData?: Partial<FormData>;
	onSubmit: (data: FormData) => void;
	onBack: () => void;
	listingProps?: ListingProps;
}

export function DetailsForm({ initialData = {}, onSubmit, onBack, listingProps }: DetailsFormProps) {
	const t = useTranslations();
	const editor = useEditor();

	const {
		currentStep,
		formData,
		focusedField,
		completedFields,
		animatingLinkId,
		handleInputChange,
		handleLinkChange,
		addLink,
		removeLink,
		handleTagToggle,
		handleSubmit,
		nextStep,
		prevStep,
		progressPercentage,
		completedRequiredFields,
		requiredFieldsCount,
		getIconComponent,
		validateStep,
		setCurrentStep,
		setFormData,
		setAnimatingLinkId,
		setFocusedField
	} = useDetailForm(initialData, onSubmit);

	useEditorFieldSync(editor, formData, 'introduction', setFormData, {
		fieldName: 'introduction',
		enableLogging: true
	});

	const isLastStep = currentStep === STEP_DEFINITIONS.length;
	const canProceed = validateStep(currentStep) || isLastStep;

	return (
		<div className="relative min-h-screen overflow-hidden">
			{/* Enhanced Background Effects */}
			<div className={BACKGROUND_CLASSES.container}>
				<div className={BACKGROUND_CLASSES.blob1}></div>
				<div className={BACKGROUND_CLASSES.blob2}></div>
				<div className={BACKGROUND_CLASSES.blob3}></div>
			</div>
			<Container maxWidth="7xl" padding="default">
				<div className="relative z-10 px-2 py-12">
					{/* Enhanced Header Section */}
					<div className={HEADER_CLASSES.wrapper}>
						<div className={HEADER_CLASSES.badge}>
							<div className={HEADER_CLASSES.badgeIcon}>
								<Sparkles className={HEADER_CLASSES.badgeIconInner} />
							</div>
							<span className={HEADER_CLASSES.badgeText}>
								{t('directory.DETAILS_FORM.STEP_INDICATOR', {
									step: currentStep
								})}
							</span>
						</div>

						<h1 className={HEADER_CLASSES.title}>{t('directory.DETAILS_FORM.TITLE')}</h1>

						<p className={HEADER_CLASSES.description}>{t('directory.DETAILS_FORM.DESCRIPTION')}</p>
					</div>

					{/* Steps Progress Bar */}
					<div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
						<div className="max-w-7xl mx-auto">
							<StepIndicator currentStep={currentStep} onStepClick={setCurrentStep} />

							{/* Progress Bar */}
							<div className={PROGRESS_BAR_CLASSES.container}>
								<div
									className={PROGRESS_BAR_CLASSES.bar}
									style={{ width: `${progressPercentage}%` }}
								>
									<div className={PROGRESS_BAR_CLASSES.shimmer}></div>
								</div>
							</div>
						</div>
					</div>

					{/* Enhanced Form */}
					<form onSubmit={handleSubmit} className="space-y-8 ">
						{/* Step Content */}
						{currentStep === 1 && (
							<BasicInfoStep
								formData={formData}
								setFormData={setFormData}
								animatingLinkId={animatingLinkId}
								setAnimatingLinkId={setAnimatingLinkId}
								focusedField={focusedField}
								setFocusedField={setFocusedField}
								completedFields={completedFields}
								handleLinkChange={handleLinkChange}
								handleInputChange={handleInputChange}
								handleTagToggle={handleTagToggle}
								getIconComponent={getIconComponent}
								categories={listingProps?.categories}
								tags={listingProps?.tags}
								editor={editor}
								t={t as (key: string, values?: Record<string, unknown>) => string}
								addLink={addLink}
								removeLink={removeLink}
							/>
						)}

						{/* Step 2: Payment */}
						{currentStep === 2 && <PaymentStep />}

						{/* Step 3: Review */}
						{currentStep === 3 && (
							<ReviewStep
								formData={formData}
								t={t as (key: string, values?: Record<string, unknown>) => string}
							/>
						)}

						{/* Navigation Buttons */}
						<FormNavigation
							currentStep={currentStep}
							canProceed={canProceed}
							completedRequiredFields={completedRequiredFields}
							requiredFieldsCount={requiredFieldsCount}
							onPrevious={prevStep}
							onNext={nextStep}
							onBack={onBack}
							onSubmit={handleSubmit}
						/>
					</form>
				</div>
			</Container>
		</div>
	);
}
