'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, FileText } from 'lucide-react';
import { CreateSurveyModal } from './create-survey-modal';
import { useTranslations } from 'next-intl';

interface AdminSurveyCreationButtonProps {
  itemId?: string;
  itemName?: string;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export function AdminSurveyCreationButton({ 
  itemId, 
  itemName, 
  variant = 'outline',
  size = 'sm',
  className = ''
}: AdminSurveyCreationButtonProps) {
  const t = useTranslations();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateSurvey = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Button
        onClick={handleCreateSurvey}
        variant={variant}
        size={size}
        className={`flex items-center gap-2 ${className}`}
      >
        <Plus className="w-4 h-4" />
        <FileText className="w-4 h-4" />
        {itemId ? t('common.CREATE_ITEM_SURVEY') : t('common.CREATE_SURVEY')}
      </Button>

      <CreateSurveyModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        defaultItemId={itemId}
        defaultItemName={itemName}
      />
    </>
  );
}
