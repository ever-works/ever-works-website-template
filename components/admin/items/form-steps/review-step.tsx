"use client";

import { useState, useEffect } from 'react';
import { StepContainer } from '@/components/ui/multi-step-form';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectItem } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Star, ExternalLink, Hash, Folder, Image as ImageIcon, FileText, Link as LinkIcon } from 'lucide-react';
import { ITEM_STATUSES } from '@/lib/types/item';
import { useTranslations } from 'next-intl';

export interface ReviewData {
  featured: boolean;
  status: string;
}

interface ReviewStepProps {
  data: ReviewData;
  onChange: (data: ReviewData) => void;
  onValidationChange: (isValid: boolean) => void;
  // All form data for review
  basicInfo: {
    id: string;
    name: string;
    slug: string;
    description: string;
  };
  mediaLinks: {
    icon_url: string;
    source_url: string;
  };
  classification: {
    category: string[];
    tags: string[];
  };
}

const STATUS_OPTIONS = [
  { value: ITEM_STATUSES.DRAFT, label: 'Draft', description: 'Save as draft for later editing' },
  { value: ITEM_STATUSES.PENDING, label: 'Pending Review', description: 'Submit for admin review' },
  { value: ITEM_STATUSES.APPROVED, label: 'Approved', description: 'Publish immediately (Admin only)' },
  { value: ITEM_STATUSES.REJECTED, label: 'Rejected', description: 'Mark as rejected (Admin only)' }
];

export function ReviewStep({
  data,
  onChange,
  onValidationChange,
  basicInfo,
  mediaLinks,
  classification
}: ReviewStepProps) {
  const t = useTranslations('admin.ITEM_FORM');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateData = (): Record<string, string> => {
    const newErrors: Record<string, string> = {};

    if (!data.status) {
      newErrors.status = t('ERRORS.STATUS_REQUIRED');
    }

    return newErrors;
  };

  const handleFieldChange = (field: keyof ReviewData, value: boolean | string) => {
    const newData = { ...data, [field]: value };
    onChange(newData);
  };

  // Validate on data change
  useEffect(() => {
    const allErrors = validateData();
    setErrors(allErrors);
    onValidationChange(Object.keys(allErrors).length === 0);
  }, [data, onValidationChange]);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case ITEM_STATUSES.DRAFT:
        return 'secondary';
      case ITEM_STATUSES.PENDING:
        return 'default';
      case ITEM_STATUSES.APPROVED:
        return 'default'; // Green variant would be better but using default for now
      case ITEM_STATUSES.REJECTED:
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <StepContainer
      title={t('STEPS.REVIEW.TITLE')}
      description={t('STEPS.REVIEW.DESCRIPTION')}
    >
      <div className="space-y-8">
        {/* Settings Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('STEPS.REVIEW.SETTINGS_TITLE')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Featured Toggle */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label className="text-sm font-medium flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  {t('FIELDS.FEATURED.LABEL')}
                </Label>
                <p className="text-xs text-gray-500">{t('FIELDS.FEATURED.HELP')}</p>
              </div>
              <Switch
                checked={data.featured}
                onCheckedChange={(checked) => handleFieldChange('featured', checked)}
              />
            </div>

            <Separator />

            {/* Status Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                {t('FIELDS.STATUS.LABEL')} <span className="text-red-500">*</span>
              </Label>
              <Select
                selectedKeys={data.status ? [data.status] : []}
                onSelectionChange={(keys) => handleFieldChange('status', keys[0])}
                placeholder={t('FIELDS.STATUS.PLACEHOLDER')}
                className={errors.status ? 'border-red-500' : ''}
              >
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center justify-between w-full">
                      <span>{option.label}</span>
                      <Badge variant={getStatusBadgeVariant(option.value)} className="ml-2">
                        {option.value}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </Select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status}</p>
              )}
              {data.status && (
                <p className="text-xs text-gray-600">
                  {STATUS_OPTIONS.find(opt => opt.value === data.status)?.description}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Review Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('STEPS.REVIEW.SUMMARY_TITLE')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center text-gray-900">
                <FileText className="w-4 h-4 mr-2" />
                {t('STEPS.BASIC_INFO.TITLE')}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-medium text-gray-600">ID:</span>
                    <p className="text-sm font-mono bg-white px-2 py-1 rounded border">
                      {basicInfo.id || t('STEPS.REVIEW.NOT_SET')}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-600">Name:</span>
                    <p className="text-sm">{basicInfo.name || t('STEPS.REVIEW.NOT_SET')}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-600">Slug:</span>
                    <p className="text-sm font-mono bg-white px-2 py-1 rounded border">
                      {basicInfo.slug || t('STEPS.REVIEW.NOT_SET')}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-xs font-medium text-gray-600">Description:</span>
                  <p className="text-sm mt-1 p-3 bg-white rounded border max-h-20 overflow-y-auto">
                    {basicInfo.description || t('STEPS.REVIEW.NOT_SET')}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Media & Links */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center text-gray-900">
                <LinkIcon className="w-4 h-4 mr-2" />
                {t('STEPS.MEDIA_LINKS.TITLE')}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 border rounded-lg bg-white flex items-center justify-center">
                    {mediaLinks.icon_url ? (
                      <img
                        src={mediaLinks.icon_url}
                        alt="Icon"
                        className="w-8 h-8 object-contain rounded"
                      />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="grid grid-cols-1 gap-2">
                      <div>
                        <span className="text-xs font-medium text-gray-600">Icon URL:</span>
                        <p className="text-sm truncate">
                          {mediaLinks.icon_url || t('STEPS.REVIEW.NOT_SET')}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs font-medium text-gray-600">Source URL:</span>
                        <div className="flex items-center gap-2">
                          <p className="text-sm truncate flex-1">
                            {mediaLinks.source_url || t('STEPS.REVIEW.NOT_SET')}
                          </p>
                          {mediaLinks.source_url && (
                            <ExternalLink className="w-3 h-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Classification */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center text-gray-900">
                <Hash className="w-4 h-4 mr-2" />
                {t('STEPS.CLASSIFICATION.TITLE')}
              </h4>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Categories:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classification.category.length > 0 ? (
                      classification.category.map((cat) => (
                        <Badge key={cat} variant="secondary">
                          {cat}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">{t('STEPS.REVIEW.NOT_SET')}</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Hash className="w-4 h-4 text-gray-600" />
                    <span className="text-xs font-medium text-gray-600">Tags:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {classification.tags.length > 0 ? (
                      classification.tags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          #{tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-gray-500">{t('STEPS.REVIEW.NOT_SET')}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </StepContainer>
  );
}