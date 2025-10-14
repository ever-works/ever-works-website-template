'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button, Input, Select, SelectItem } from '@heroui/react';
import { X, Building2, Globe, Link as LinkIcon, Hash } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { CreateCompanyInput } from '@/lib/validations/company';

// Define form schema for validation (before transformation)
const companyFormSchema = z.object({
	name: z.string().min(1, 'Company name is required').max(255),
	website: z.string().optional(),
	domain: z.string().optional(),
	slug: z.string().regex(/^[a-z0-9-]*$/, 'Slug must contain only lowercase letters, numbers, and hyphens').optional().or(z.literal('')),
	status: z.enum(['active', 'inactive']),
});

type CompanyFormData = z.infer<typeof companyFormSchema>;

interface CompanyModalProps {
	isOpen: boolean;
	isSubmitting: boolean;
	onSubmit: (data: CreateCompanyInput) => Promise<void>;
	onClose: () => void;
}

/**
 * Company Modal Component
 * Handles company creation with react-hook-form and zod validation
 */
export function CompanyModal({ isOpen, isSubmitting, onSubmit, onClose }: CompanyModalProps) {
	const t = useTranslations('admin.ADMIN_COMPANIES_PAGE');

	const {
		register,
		handleSubmit,
		formState: { errors },
		reset,
		setValue,
		watch,
	} = useForm<CompanyFormData>({
		resolver: zodResolver(companyFormSchema),
		defaultValues: {
			name: '',
			website: '',
			domain: '',
			slug: '',
			status: 'active',
		},
	});

	const statusValue = watch('status');

	const handleFormSubmit = async (data: CompanyFormData) => {
		// Transform empty strings to undefined for optional fields
		const submitData: CreateCompanyInput = {
			name: data.name,
			website: data.website || undefined,
			domain: data.domain || undefined,
			slug: data.slug || undefined,
			status: data.status,
		};
		await onSubmit(submitData);
		reset();
	};

	const handleClose = () => {
		reset();
		onClose();
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
			<div className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-xl shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto">
				{/* Header */}
				<div className="bg-gradient-to-r from-theme-primary to-theme-accent px-6 py-4 flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
							<Building2 className="w-6 h-6 text-white" />
						</div>
						<div>
							<h2 className="text-xl font-bold text-white">{t('ADD_COMPANY')}</h2>
							<p className="text-white/80 text-sm">{t('ADD_COMPANY_SUBTITLE')}</p>
						</div>
					</div>
					<Button
						isIconOnly
						variant="light"
						onPress={handleClose}
						className="text-white hover:bg-white/20"
						isDisabled={isSubmitting}
					>
						<X className="w-5 h-5" />
					</Button>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
					{/* Name - Required */}
					<div>
						<Input
							{...register('name')}
							label={t('COMPANY_NAME')}
							placeholder={t('COMPANY_NAME_PLACEHOLDER')}
							isRequired
							isInvalid={!!errors.name}
							errorMessage={errors.name?.message}
							startContent={<Building2 className="w-4 h-4 text-gray-400" />}
							classNames={{
								input: 'text-sm',
								label: 'font-medium',
							}}
							isDisabled={isSubmitting}
						/>
					</div>

					{/* Website - Optional */}
					<div>
						<Input
							{...register('website')}
							label={t('COMPANY_WEBSITE')}
							placeholder={t('COMPANY_WEBSITE_PLACEHOLDER')}
							isInvalid={!!errors.website}
							errorMessage={errors.website?.message}
							startContent={<Globe className="w-4 h-4 text-gray-400" />}
							classNames={{
								input: 'text-sm',
								label: 'font-medium',
							}}
							isDisabled={isSubmitting}
						/>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('COMPANY_WEBSITE_HINT')}</p>
					</div>

					{/* Domain - Optional */}
					<div>
						<Input
							{...register('domain')}
							label={t('COMPANY_DOMAIN')}
							placeholder={t('COMPANY_DOMAIN_PLACEHOLDER')}
							isInvalid={!!errors.domain}
							errorMessage={errors.domain?.message}
							startContent={<LinkIcon className="w-4 h-4 text-gray-400" />}
							classNames={{
								input: 'text-sm',
								label: 'font-medium',
							}}
							isDisabled={isSubmitting}
						/>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('COMPANY_DOMAIN_HINT')}</p>
					</div>

					{/* Slug - Optional */}
					<div>
						<Input
							{...register('slug')}
							label={t('COMPANY_SLUG')}
							placeholder={t('COMPANY_SLUG_PLACEHOLDER')}
							isInvalid={!!errors.slug}
							errorMessage={errors.slug?.message}
							startContent={<Hash className="w-4 h-4 text-gray-400" />}
							classNames={{
								input: 'text-sm',
								label: 'font-medium',
							}}
							isDisabled={isSubmitting}
						/>
						<p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('COMPANY_SLUG_HINT')}</p>
					</div>

					{/* Status */}
					<div>
						<Select
							label={t('COMPANY_STATUS')}
							placeholder={t('SELECT_STATUS')}
							selectedKeys={statusValue ? [statusValue] : []}
							onSelectionChange={(keys) => {
								const value = Array.from(keys)[0] as 'active' | 'inactive';
								setValue('status', value);
							}}
							classNames={{
								trigger: 'h-12',
								label: 'font-medium',
							}}
							isDisabled={isSubmitting}
						>
							<SelectItem key="active">{t('STATUS_ACTIVE')}</SelectItem>
							<SelectItem key="inactive">{t('STATUS_INACTIVE')}</SelectItem>
						</Select>
					</div>

					{/* Form Actions */}
					<div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
						<Button variant="bordered" onPress={handleClose} isDisabled={isSubmitting}>
							{t('CANCEL')}
						</Button>
						<Button
							type="submit"
							className="bg-gradient-to-r from-theme-primary to-theme-accent text-white"
							isLoading={isSubmitting}
							isDisabled={isSubmitting}
						>
							{t('CREATE_COMPANY')}
						</Button>
					</div>
				</form>
			</div>
		</div>
	);
}
