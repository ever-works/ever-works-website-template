'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import type { Survey } from '@/lib/db/schema';
import { SurveyFormWrapper } from './forms/survey-form-wrapper';

interface SurveyDialogProps {
    survey: Survey | null;
    open: boolean;
    onClose: () => void;
    itemSlug?: string;
    onCompleted?: () => void;
}

/**
 * Survey Dialog Component
 * Displays survey in a modal dialog
 */
export function SurveyDialog({
    survey,
    open,
    onClose,
    itemSlug,
    onCompleted
}: SurveyDialogProps) {


    const handleCompleted = () => {
        // Close the dialog after a short delay
        setTimeout(() => {
            onClose();
            if (onCompleted) {
                onCompleted();
            }
        }, 1500);
    };

    if (!survey) return null;

    return (
        <Modal
            title={survey.title}
            subtitle={survey.description}
            isOpen={open}
            backdrop="blur"
            isDismissable={true}
            onClose={onClose}
            size="2xl"
        >
            <div className="p-4">
                <SurveyFormWrapper
                    survey={survey}
                    itemSlug={itemSlug}
                    onCompleted={handleCompleted}
                />
            </div>
        </Modal>
    );
}

