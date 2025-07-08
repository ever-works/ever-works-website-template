"use client";

import { Modal, ModalContent } from "@heroui/react";
import { AuthForm } from "@/app/[locale]/auth/components/auth-form";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose}
      size="5xl"
      classNames={{
        backdrop: "bg-black/50",
        base: "bg-transparent",
        body: "p-0",
      }}
    >
      <ModalContent>
        <AuthForm form="login" />
      </ModalContent>
    </Modal>
  );
} 