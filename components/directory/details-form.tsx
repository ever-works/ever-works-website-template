'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
	Check,
	ArrowRight,
	ArrowLeft,
	Tag,
	Type,
	FileText,
	Eye,
	Star,
	Sparkles,
	MoreHorizontal,
	ChevronUp
} from 'lucide-react';
import { cn, getVideoEmbedUrl } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import InputLink from './input-link';
import { useDetailForm } from '@/hooks/use-detail-form';
import { useEditorFieldSync } from '@/hooks/use-editor-sync';
import { Container } from '../ui/container';
import { PricingSection } from '../pricing/pricing-section';
import { Category, ItemData, Tag as TagType } from '@/lib/content';
import { useEditor } from '@/hooks/use-editor';
import { ToolbarContent } from '../editor/toolbar-content';
import { Toolbar } from '../tiptap-ui-primitive/toolbar';
import { useEditorToolbar } from '../editor/use-editor-toolbar';
import { EditorContent } from '../editor/editor-content';

interface ProductLink {
	id: string;
	url: string;
	label: string;
	type: 'main' | 'secondary';
	icon?: string;
}

interface FormData {
	name: string;
	link: string;
	links: ProductLink[];
	category: string;
	tags: string[];
	description: string;
	introduction: string;
	video_url?: string; // Added video_url to FormData
	[key: string]: any;
}

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

const STEPS = [
	{
		id: 1,
		title: 'Basic Information',
		description: 'Basic Information Description',
		icon: Type,
		fields: ['name', 'mainLink'],
		color: 'from-theme-primary-500 to-purple-500'
	},
	{
		id: 2,
		title: 'Payment',
		description: 'Payment Description',
		icon: Tag,
		fields: ['Payment'],
		color: 'from-purple-500 to-pink-500'
	},
	{
		id: 3,
		title: 'Review',
		description: 'Review Description',
		icon: Eye,
		fields: [],
		color: 'from-orange-500 to-red-500'
	}
];

export function DetailsForm({ initialData = {}, onSubmit, onBack, listingProps }: DetailsFormProps) {
	const t = useTranslations();
	const [showAllTags, setShowAllTags] = useState(false);
	const [tagsToShow] = useState(18);
	const editor = useEditor();
	const { toolbarRef } = useEditorToolbar(editor!);

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

	const isLastStep = currentStep === STEPS.length;
	const canProceed = validateStep(currentStep) || isLastStep;

	return (
		<div className="relative min-h-screen overflow-hidden">
			{/* Enhanced Background Effects */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute top-0 -left-4 w-96 h-96 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 dark:from-blue-600/20 dark:via-purple-600/20 dark:to-cyan-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob"></div>
				<div className="absolute top-0 -right-4 w-96 h-96 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 dark:from-purple-600/20 dark:via-pink-600/20 dark:to-orange-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000"></div>
				<div className="absolute -bottom-8 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 via-blue-500/10 to-indigo-500/10 dark:from-green-600/20 dark:via-blue-600/20 dark:to-indigo-600/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000"></div>
			</div>
			<Container maxWidth="7xl" padding="default">
				<div className="relative z-10 px-2 py-12">
					{/* Enhanced Header Section */}
					<div className="text-center mb-16 animate-fade-in-up">
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 mb-6 ">
							<div className="w-8 h-8 rounded-full bg-theme-primary-500 flex items-center justify-center">
								<Sparkles className="w-4 h-4 text-white animate-pulse" />
							</div>
							<span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
								{t('directory.DETAILS_FORM.STEP_INDICATOR', {
									step: currentStep
								})}
							</span>
						</div>

						<h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
							{t('directory.DETAILS_FORM.TITLE')}
						</h1>

						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
							{t('directory.DETAILS_FORM.DESCRIPTION')}
						</p>
					</div>

					{/* Steps Progress Bar */}
					<div className="mb-12 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
						<div className="max-w-7xl mx-auto">
							<div className="flex items-center justify-between mb-8">
								{STEPS.map((step, index) => {
									const IconComponent = step.icon;
									const isActive = currentStep === step.id;
									const isCompleted = currentStep > step.id;
									const isAccessible = currentStep >= step.id;

									return (
										<div key={step.id} className="flex items-center">
											<div className="flex flex-col items-center">
												<button
													onClick={() => isAccessible && setCurrentStep(step.id)}
													disabled={!isAccessible}
													className={cn(
														'w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 mb-2',
														isActive && 'scale-110 shadow-lg',
														isCompleted && 'bg-green-500 text-white shadow-lg',
														isActive &&
															!isCompleted &&
															`bg-gradient-to-r ${step.color} text-white shadow-lg`,
														!isActive &&
															!isCompleted &&
															!isAccessible &&
															'bg-gray-200 dark:bg-gray-700 text-gray-400',
														!isActive &&
															!isCompleted &&
															isAccessible &&
															'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
													)}
												>
													{isCompleted ? (
														<Check className="w-5 h-5" />
													) : (
														<IconComponent className="w-5 h-5" />
													)}
												</button>
												<span
													className={cn(
														'text-sm font-medium text-center',
														isActive &&
															'text-theme-primary-600 dark:text-theme-primary-400',
														isCompleted && 'text-green-600 dark:text-green-400',
														!isActive && !isCompleted && 'text-gray-500 dark:text-gray-400'
													)}
												>
													{step.title}
												</span>
											</div>
											{index < STEPS.length - 1 && (
												<div
													className={cn(
														'flex-1 h-0.5 mx-4 transition-colors duration-300',
														isCompleted ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
													)}
												/>
											)}
										</div>
									);
								})}
							</div>

							{/* Progress Bar */}
							<div className="relative w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden shadow-inner">
								<div
									className="h-full bg-theme-primary-500 rounded-full transition-all duration-700 ease-out shadow-lg"
									style={{ width: `${progressPercentage}%` }}
								>
									<div className="absolute inset-0 bg-white/20 rounded-full animate-shimmer"></div>
								</div>
							</div>
						</div>
					</div>

					{/* Enhanced Form */}
					<form onSubmit={handleSubmit} className="space-y-8 ">
						{/* Step Content */}
						{currentStep === 1 && (
							<div className="relative group animate-fade-in-up">
								<div className="absolute inset-0 bg-theme-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								<div className="relative  py-8">
									<div className="flex items-center gap-3 mb-8">
										<div className="w-12 h-12 rounded-2xl bg-theme-primary-500 flex items-center justify-center">
											<Type className="w-6 h-6 text-white" />
										</div>
										<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
											{t('directory.DETAILS_FORM.BASIC_INFORMATION')}
										</h3>
									</div>

									<div className="grid gap-8">
										<InputLink
											formData={formData}
											setFormData={setFormData}
											animatingLinkId={animatingLinkId}
											setAnimatingLinkId={setAnimatingLinkId}
											focusedField={focusedField}
											setFocusedField={setFocusedField}
											completedFields={completedFields}
											handleLinkChange={handleLinkChange}
											getIconComponent={getIconComponent}
											t={t}
											addLink={addLink}
											removeLink={removeLink}
										/>

										{/* Product Name */}
										<div className="space-y-3">
											<label
												htmlFor="name"
												className="block text-sm font-bold text-gray-700 dark:text-gray-300"
											>
												{t('directory.DETAILS_FORM.PRODUCT_NAME')} *
											</label>
											<div className="relative">
												<input
													id="name"
													name="name"
													type="text"
													value={formData.name}
													onChange={handleInputChange}
													onFocus={() => setFocusedField('name')}
													onBlur={() => setFocusedField(null)}
													placeholder={t('directory.DETAILS_FORM.PRODUCT_NAME_PLACEHOLDER')}
													required
													className={cn(
														'w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:focus:border-theme-primary-400 hover:border-gray-300 dark:hover:border-gray-500 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400',
														focusedField === 'name' &&
															'scale-[1.02] shadow-xl ring-4 ring-theme-primary-500/20'
													)}
												/>
											</div>
										</div>
										<div className="space-y-3">
											<label
												htmlFor="video_url"
												className="block text-sm font-bold text-gray-700 dark:text-gray-300"
											>
												Video URL (YouTube or Vimeo)
											</label>
											<div className="relative">
												<input
													id="video_url"
													name="video_url"
													type="url"
													value={formData.video_url || ''}
													onChange={(e) =>
														setFormData((prev) => ({
															...prev,
															video_url: e.target.value
														}))
													}
													placeholder="https://www.youtube.com/watch?v=..."
													className={cn(
														'w-full h-12 px-4 pr-12 text-base bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-xl transition-all duration-300 outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400',
														'focus:border-theme-primary-500 dark:focus:border-theme-primary-400 focus:ring-4 focus:ring-theme-primary-20'
													)}
												/>
											</div>
											{/* Video Preview - only for whitelisted hosts */}
											{formData.video_url &&
												(() => {
													try {
														const parsedUrl = new URL(formData.video_url);
														const allowedHosts = [
															'youtube.com',
															'www.youtube.com',
															'youtu.be',
															'vimeo.com',
															'www.vimeo.com'
														];
														if (!allowedHosts.includes(parsedUrl.hostname)) {
															return null;
														}
														return (
															<div className="mt-4">
																<div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-lg">
																	<iframe
																		src={getVideoEmbedUrl(formData.video_url)}
																		title="Video Preview"
																		style={{ border: 0 }}
																		allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
																		allowFullScreen
																		className="absolute top-0 left-0 w-full h-full"
																	></iframe>
																</div>
															</div>
														);
													} catch {
														return null;
													}
												})()}
										</div>
										{/* Category */}
										<div className="space-y-3">
											<label
												htmlFor="category"
												className="block text-sm font-bold text-gray-700 dark:text-gray-300"
											>
												{t('directory.DETAILS_FORM.CATEGORY')} *
											</label>
											<div className="relative">
												<select
													id="category"
													name="category"
													value={formData.category}
													onChange={handleInputChange}
													onFocus={() => setFocusedField('category')}
													onBlur={() => setFocusedField(null)}
													required
													className={cn(
														'w-full h-14 px-6 pr-14 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:focus:border-theme-primary-400 hover:border-gray-300 dark:hover:border-gray-500 appearance-none cursor-pointer outline-none text-gray-900 dark:text-white',
														focusedField === 'category' &&
															'scale-[1.02] shadow-xl ring-4 ring-theme-primary-500/20'
													)}
												>
													<option value="" disabled className="text-gray-500">
														{t('directory.DETAILS_FORM.CATEGORY_PLACEHOLDER')}
													</option>
													{listingProps?.categories?.map((category) => (
														<option
															key={category.id}
															value={category.id}
															className="py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
														>
															{category.name}
														</option>
													))}
												</select>
											</div>
										</div>

										{/* Tags */}
										<div className="space-y-6">
											<div>
												<h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
													{t('directory.DETAILS_FORM.TAGS_LABELS')}
												</h4>
												<p className="text-sm text-gray-600 dark:text-gray-400">
													{t('directory.DETAILS_FORM.TAGS_DESCRIPTION')}
												</p>
											</div>

											<div className="flex flex-wrap gap-3">
												{listingProps?.tags
													?.slice(0, showAllTags ? undefined : tagsToShow)
													.map((tag) => (
														<button
															key={tag.id}
															type="button"
															onClick={() => handleTagToggle(tag.id)}
															className={cn(
																'px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 border-2 capitalize',
																formData.tags.includes(tag.id)
																	? 'text-white border-transparent shadow-lg bg-theme-primary-500'
																	: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
															)}
														>
															{tag.name}
														</button>
													))}

												{listingProps?.tags &&
													listingProps.tags.length > tagsToShow &&
													!showAllTags && (
														<button
															type="button"
															onClick={() => setShowAllTags(true)}
															className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 border-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2"
														>
															<MoreHorizontal className="w-4 h-4" />
															{`Show ${listingProps.tags.length - tagsToShow} more`}
														</button>
													)}

												{showAllTags &&
													listingProps?.tags &&
													listingProps.tags.length > tagsToShow && (
														<button
															type="button"
															onClick={() => setShowAllTags(false)}
															className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-300 hover:scale-105 border-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 flex items-center gap-2"
														>
															<ChevronUp className="w-4 h-4" />
															{t('common.SHOW_LESS')}
														</button>
													)}
											</div>

											{formData.tags.length > 0 && (
												<div className="p-4 bg-theme-primary-50 dark:bg-gray-800 rounded-2xl border border-theme-primary-200 dark:border-theme-primary-800">
													<div className="flex items-center gap-2 mb-2">
														<Star className="w-4 h-4 text-theme-primary-500 dark:text-theme-primary-400" />
														<span className="text-sm font-semibold text-theme-primary-700 dark:text-theme-primary-300">
															{t('directory.DETAILS_FORM.SELECTED_TAGS', {
																count: formData.tags.length
															})}
														</span>
													</div>
													<div className="flex flex-wrap gap-2">
														{formData.tags.map((tag) => (
															<span
																key={tag}
																className="px-3 py-1 text-xs font-medium bg-theme-primary-500 text-white rounded-lg capitalize"
															>
																{tag}
															</span>
														))}
													</div>
												</div>
											)}
										</div>
										<div className="space-y-3">
											<label
												htmlFor="description"
												className="block text-sm font-bold text-gray-700 dark:text-gray-300"
											>
												{t('directory.DETAILS_FORM.SHORT_DESCRIPTION')} *
											</label>
											<div className="relative">
												<textarea
													id="description"
													name="description"
													value={formData.description}
													onChange={handleInputChange}
													onFocus={() => setFocusedField('description')}
													onBlur={() => setFocusedField(null)}
													placeholder={t(
														'directory.DETAILS_FORM.SHORT_DESCRIPTION_PLACEHOLDER'
													)}
													maxLength={150}
													required
													rows={3}
													className={cn(
														'w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:focus:border-theme-primary-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400',
														focusedField === 'description' &&
															'scale-[1.02] shadow-xl ring-4 ring-theme-primary-500/20'
													)}
												/>
												<div className="absolute bottom-4 right-6 text-xs text-gray-500 dark:text-gray-400">
													{formData.description.length}/150
												</div>
											</div>
										</div>
										<div className="space-y-3">
											<label
												htmlFor="introduction"
												className="block text-sm font-bold text-gray-700 dark:text-gray-300"
											>
												{t('directory.DETAILS_FORM.DETAILED_INTRODUCTION')}
											</label>
											<div className="relative">
												{/* <textarea
													id="introduction"
													name="introduction"
													value={formData.introduction}
													onChange={handleInputChange}
													onFocus={() => setFocusedField('introduction')}
													onBlur={() => setFocusedField(null)}
													placeholder={t(
														'directory.DETAILS_FORM.DETAILED_INTRODUCTION_PLACEHOLDER'
													)}
													rows={6}
													className={cn(
														'w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:focus:border-theme-primary-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400',
														focusedField === 'introduction' &&
															'scale-[1.02] shadow-xl ring-4 ring-theme-primary-500/20',
													)}
												/>*/}
												{editor && (
													<EditorContent
														style={{
															className: cn(
																'w-full px-6 py-4 text-lg bg-gray-50/80 dark:bg-gray-900/50 border-2 border-gray-200/60 dark:border-gray-600/50 rounded-2xl transition-all duration-300 focus:ring-4 focus:ring-theme-primary-500/20 focus:border-theme-primary-500 dark:focus:border-theme-primary-400 hover:border-gray-300 dark:hover:border-gray-500 resize-none outline-none text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400',
																focusedField === 'introduction' &&
																	'scale-[1.02] shadow-xl ring-4 ring-theme-primary-500/20'
															)
														}}
														toolbar={
															<Toolbar
																className="bg-gray-50/80 dark:bg-gray-900/50"
																ref={toolbarRef}
															>
																<ToolbarContent editor={editor} />
															</Toolbar>
														}
														editor={editor}
														role="presentation"
														placeholder="Write your introduction here..."
													/>
												)}
											</div>

											<p className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
												<FileText className="w-3 h-3" />
												{t('directory.DETAILS_FORM.MARKDOWN_SUPPORT')}
											</p>
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Step 2: Payment */}
						{currentStep === 2 && <PricingSection isReview={true} />}

						{currentStep === 3 && (
							<div className="relative group animate-fade-in-up">
								<div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 to-red-500/20 dark:from-orange-400/30 dark:to-red-400/30 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								<div className="relative bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-gray-700/30 p-8 shadow-2xl">
									<div className="flex items-center gap-3 mb-8">
										<div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center">
											<Eye className="w-6 h-6 text-white" />
										</div>
										<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
											Review & Submit
										</h3>
									</div>

									<div className="space-y-6">
										{/* Review Summary */}
										<div className="grid gap-6">
											<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
												<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
													{t('directory.DETAILS_FORM.PRODUCT_NAME')}
												</h4>
												<p className="text-gray-600 dark:text-gray-300">
													{formData.name || 'Not provided'}
												</p>
											</div>

											<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
												<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
													{t('directory.DETAILS_FORM.PRODUCT_LINK')}
												</h4>
												<p className="text-gray-600 dark:text-gray-300">
													{formData.link || 'Not provided'}
												</p>
											</div>

											<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
												<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
													{t('directory.DETAILS_FORM.CATEGORY')}
												</h4>
												<p className="text-gray-600 dark:text-gray-300">
													{formData.category || 'Not provided'}
												</p>
											</div>

											<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
												<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
													{t('directory.DETAILS_FORM.TAGS_LABELS')}
												</h4>
												<div className="flex flex-wrap gap-2">
													{formData.tags.length > 0 ? (
														formData.tags.map((tag) => (
															<span
																key={tag}
																className="px-2 py-1 text-xs bg-theme-primary-500 text-white rounded"
															>
																{tag}
															</span>
														))
													) : (
														<p className="text-gray-600 dark:text-gray-300">
															{t('tagsModal.NO_TAGS_SELECTED')}
														</p>
													)}
												</div>
											</div>

											<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
												<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
													{t('directory.DETAILS_FORM.SHORT_DESCRIPTION')}
												</h4>
												<p className="text-gray-600 dark:text-gray-300">
													{formData.description || 'Not provided'}
												</p>
											</div>

											{formData.introduction && (
												<div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
													<h4 className="font-semibold text-gray-900 dark:text-white mb-2">
														{t('directory.DETAILS_FORM.DETAILED_INTRODUCTION')}
													</h4>
													<p className="text-gray-600 dark:text-gray-300">
														{formData.introduction}
													</p>
												</div>
											)}
										</div>
									</div>
								</div>
							</div>
						)}

						{/* Navigation Buttons */}
						<div
							className="flex flex-col sm:flex-row justify-between gap-6 pt-8 animate-fade-in-up"
							style={{ animationDelay: '0.5s' }}
						>
							<div className="flex gap-4">
								{currentStep > 1 && (
									<Button
										type="button"
										onClick={prevStep}
										variant="outline"
										className="h-14 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 border-2"
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
										className="h-14 px-8 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 border-2"
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
										onClick={nextStep}
										disabled={!canProceed}
										className={cn(
											'h-14 px-12 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl min-w-[200px]',
											!canProceed
												? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
												: 'bg-theme-primary-500 text-white hover:shadow-theme-primary-500/30'
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
										disabled={completedRequiredFields < requiredFieldsCount}
										className={cn(
											'h-14 px-12 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-2xl min-w-[200px]',
											completedRequiredFields < requiredFieldsCount
												? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
												: 'bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 hover:from-green-600 hover:via-emerald-600 hover:to-green-700 text-white hover:shadow-green-500/30'
										)}
									>
										<div className="flex items-center gap-3">
											<span>Submit Product</span>
											<Check className="w-5 h-5" />
										</div>
									</Button>
								)}
							</div>
						</div>
					</form>
				</div>
			</Container>
		</div>
	);
}
