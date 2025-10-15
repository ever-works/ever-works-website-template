"use client";

import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  title?: string;
  subtitle?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  children: React.ReactNode;
  backdrop?: 'blur' | 'opaque' | 'transparent';
  isDismissable?: boolean;
  hideCloseButton?: boolean;
  className?: string;
}

export function Modal({
  isOpen,
  onClose,
  onOpenChange,
  title,
  subtitle,
  size = 'md',
  children,
  backdrop = 'blur',
  isDismissable = true,
  hideCloseButton = false,
  className = '',
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDismissable) {
        onClose();
        onOpenChange?.(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, isDismissable, onClose, onOpenChange]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
  };

  const backdropClasses = {
    blur: 'backdrop-blur-sm bg-black/50',
    opaque: 'bg-black/60',
    transparent: 'bg-black/20',
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && isDismissable) {
      onClose();
      onOpenChange?.(false);
    }
  };

  const modalContainerClasses = `
    relative w-full ${sizeClasses[size]} max-h-[90vh] 
    bg-white dark:bg-gray-900 
    rounded-lg shadow-xl 
    overflow-hidden
    ${className}
  `;

  const modalContent = (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${backdropClasses[backdrop]}`}
      onClick={handleBackdropClick}
    >
      <div
        className={modalContainerClasses}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || !hideCloseButton) && (
          <div className="flex flex-col gap-2 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {title && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h2>
              )}
              {!hideCloseButton && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenChange?.(false);
                  }}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                >
                  <X size={20} className="text-gray-500 dark:text-gray-400" />
                </button>
              )}
            </div>
            {subtitle}
          </div>
        )}
        <div className="overflow-y-auto max-h-[calc(90vh-4rem)]">
          {children}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export function ModalContent({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={className}>{children}</div>;
}

export function ModalHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 border-b border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>;
}

export function ModalBody({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 ${className}`}>{children}</div>;
}

export function ModalFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`p-4 border-t border-gray-200 dark:border-gray-700 ${className}`}>{children}</div>;
} 