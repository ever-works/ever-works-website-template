"use client";

import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { AuthForm } from "@/app/[locale]/auth/components/auth-form";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function LoginModal({ 
  isOpen, 
  onClose,
  message = "Connectez-vous pour continuer"
}: LoginModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      classNames={{
        backdrop: "bg-black/50 backdrop-blur-sm",
        base: "bg-white dark:bg-gray-900 rounded-2xl shadow-xl",
        body: "p-6",
      }}
    >
      <ModalContent>
        <ModalHeader className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            {message}
          </h2>
        </ModalHeader>
        <ModalBody>
          <AuthForm form="login" />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
} 