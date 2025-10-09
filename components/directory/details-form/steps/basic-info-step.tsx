'use client';

import { useState } from 'react';
import { Type, FileText, Star, MoreHorizontal, ChevronUp } from 'lucide-react';
import { cn, getVideoEmbedUrl } from '@/lib/utils';
import type { Editor } from '@tiptap/react';
import { EditorContent, Toolbar, ToolbarContent, useEditorToolbar } from '@/lib/editor';
import { LinkInput } from '../components/link-input';
import type { Category, Tag as TagType } from '@/lib/content';
import type { FormData } from '../validation/form-validators';
import {
	STEP_CARD_CLASSES,
	FORM_FIELD_CLASSES,
	TAG_CLASSES,
	VIDEO_PREVIEW_CLASSES,
	MAX_DESCRIPTION_LENGTH,
	DEFAULT_TAGS_TO_SHOW,
	isValidVideoUrl
} from '../validation/form-validators';

interface BasicInfoStepProps {
	formData: FormData;
	setFormData: React.Dispatch<React.SetStateAction<FormData>>;
	animatingLinkId: string | null;
	setAnimatingLinkId: (id: string | null) => void;
	focusedField: string | null;
	setFocusedField: (field: string | null) => void;
	completedFields: Set<string>;
	handleLinkChange: (id: string, field: 'label' | 'url', value: string) => void;
	handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
	handleTagToggle: (tagId: string) => void;
	getIconComponent: () => React.ComponentType<{ className?: string }>;
	categories?: Category[];
	tags?: TagType[];
	editor: Editor | null;
	t: (key: string, values?: Record<string, unknown>) => string;
	addLink: () => void;
	removeLink: (id: string) => void;
}

export function BasicInfoStep({
	formData,
	setFormData,
	animatingLinkId,
	setAnimatingLinkId,
	focusedField,
	setFocusedField,
	completedFields,
	handleLinkChange,
	handleInputChange,
	handleTagToggle,
	getIconComponent,
	categories,
	tags,
	editor,
	t,
	addLink,
	removeLink
}: BasicInfoStepProps) {
	const [showAllTags, setShowAllTags] = useState(false);
	const [tagsToShow] = useState(DEFAULT_TAGS_TO_SHOW);
	const { toolbarRef } = useEditorToolbar(editor ?? ({} as Editor));

	return (
		<div className={STEP_CARD_CLASSES.wrapper}>
			<div className={STEP_CARD_CLASSES.background} />
			<div className={STEP_CARD_CLASSES.content}>
				<div className={STEP_CARD_CLASSES.header.wrapper}>
					<div className={STEP_CARD_CLASSES.header.icon}>
						<Type className={STEP_CARD_CLASSES.header.iconInner} />
					</div>
					<h3 className={STEP_CARD_CLASSES.header.title}>
						{t('directory.DETAILS_FORM.BASIC_INFORMATION')}
					</h3>
				</div>

				<div className="grid gap-8">
					<LinkInput
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
						<label htmlFor="name" className={FORM_FIELD_CLASSES.label}>
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
									FORM_FIELD_CLASSES.input.base,
									focusedField === 'name' && FORM_FIELD_CLASSES.input.focused
								)}
							/>
						</div>
					</div>

					{/* Video URL */}
					<div className="space-y-3">
						<label htmlFor="video_url" className={FORM_FIELD_CLASSES.label}>
							Video URL (YouTube or Vimeo)
						</label>
						<div className="relative">
							<input
								id="video_url"
								name="video_url"
								type="url"
								value={formData.video_url || ''}
								onChange={handleInputChange}
								placeholder="https://www.youtube.com/watch?v=..."
								className={cn(
									FORM_FIELD_CLASSES.videoInput.base,
									FORM_FIELD_CLASSES.videoInput.focus
								)}
							/>
						</div>
						{/* Video Preview - only for whitelisted hosts */}
						{formData.video_url && isValidVideoUrl(formData.video_url) && (
							<div className={VIDEO_PREVIEW_CLASSES.container}>
								<div className={VIDEO_PREVIEW_CLASSES.wrapper}>
									<iframe
										src={getVideoEmbedUrl(formData.video_url)}
										title="Video Preview"
										style={{ border: 0 }}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										className={VIDEO_PREVIEW_CLASSES.iframe}
									></iframe>
								</div>
							</div>
						)}
					</div>

					{/* Category */}
					<div className="space-y-3">
						<label htmlFor="category" className={FORM_FIELD_CLASSES.label}>
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
									FORM_FIELD_CLASSES.select.base,
									focusedField === 'category' && FORM_FIELD_CLASSES.select.focused
								)}
							>
								<option value="" disabled className="text-gray-500">
									{t('directory.DETAILS_FORM.CATEGORY_PLACEHOLDER')}
								</option>
								{categories?.map((category) => (
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

						<div className={TAG_CLASSES.container}>
							{tags?.slice(0, showAllTags ? undefined : tagsToShow).map((tag) => (
								<button
									key={tag.id}
									type="button"
									onClick={() => handleTagToggle(tag.id)}
									className={cn(
										TAG_CLASSES.button.base,
										formData.tags.includes(tag.id)
											? TAG_CLASSES.button.selected
											: TAG_CLASSES.button.unselected
									)}
								>
									{tag.name}
								</button>
							))}

							{tags && tags.length > tagsToShow && !showAllTags && (
								<button
									type="button"
									onClick={() => setShowAllTags(true)}
									className={TAG_CLASSES.showMore}
								>
									<MoreHorizontal className="w-4 h-4" />
									{t('common.SHOW_MORE', { count: tags.length - tagsToShow })}
								</button>
							)}

							{showAllTags && tags && tags.length > tagsToShow && (
								<button
									type="button"
									onClick={() => setShowAllTags(false)}
									className={TAG_CLASSES.showMore}
								>
									<ChevronUp className="w-4 h-4" />
									{t('common.SHOW_LESS')}
								</button>
							)}
						</div>

						{formData.tags.length > 0 && (
							<div className={TAG_CLASSES.selectedSummary.container}>
								<div className={TAG_CLASSES.selectedSummary.header}>
									<Star className={TAG_CLASSES.selectedSummary.icon} />
									<span className={TAG_CLASSES.selectedSummary.label}>
										{t('directory.DETAILS_FORM.SELECTED_TAGS', {
											count: formData.tags.length
										})}
									</span>
								</div>
								<div className={TAG_CLASSES.selectedSummary.tags}>
									{formData.tags.map((tagId) => {
										const tag = tags?.find((t) => t.id === tagId);
										return (
											<span key={tagId} className={TAG_CLASSES.selectedSummary.tag}>
												{tag?.name || tagId}
											</span>
										);
									})}
								</div>
							</div>
						)}
					</div>

					{/* Short Description */}
					<div className="space-y-3">
						<label htmlFor="description" className={FORM_FIELD_CLASSES.label}>
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
								placeholder={t('directory.DETAILS_FORM.SHORT_DESCRIPTION_PLACEHOLDER')}
								maxLength={MAX_DESCRIPTION_LENGTH}
								required
								rows={3}
								className={cn(
									FORM_FIELD_CLASSES.textarea.base,
									focusedField === 'description' && FORM_FIELD_CLASSES.textarea.focused
								)}
							/>
							<div className="absolute bottom-4 right-6 text-xs text-gray-500 dark:text-gray-400">
								{formData.description.length}/{MAX_DESCRIPTION_LENGTH}
							</div>
						</div>
					</div>

					{/* Detailed Introduction */}
					<div className="space-y-3">
						<label htmlFor="introduction" className={FORM_FIELD_CLASSES.label}>
							{t('directory.DETAILS_FORM.DETAILED_INTRODUCTION')}
						</label>
						<div className="relative">
							{editor && (
								<EditorContent
									className={cn(
										FORM_FIELD_CLASSES.textarea.base,
										focusedField === 'introduction' && FORM_FIELD_CLASSES.textarea.focused
									)}
									toolbar={
										<Toolbar className="bg-gray-50/80 dark:bg-gray-900/50" ref={toolbarRef}>
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
	);
}
