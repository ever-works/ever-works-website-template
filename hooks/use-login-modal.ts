"use client";

import { create } from "zustand";

export interface LoginModalStore {
  isOpen: boolean;
  message: string | undefined;
  onOpen: (message?: string) => void;
  onClose: () => void;
}

export const useLoginModal = create<LoginModalStore>()((set) => ({
  isOpen: false,
  message: undefined,
  onOpen: (message) => set({ isOpen: true, message }),
  onClose: () => set({ isOpen: false, message: undefined }),
}));

export type LoginModalReturn = ReturnType<typeof useLoginModal>; 