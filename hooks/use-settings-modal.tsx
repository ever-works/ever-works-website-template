"use client";

import { createContext, useContext, useState, useCallback, useEffect, PropsWithChildren } from "react";

interface SettingsModalContextValue {
	isOpen: boolean;
	openModal: () => void;
	closeModal: () => void;
	toggleModal: () => void;
}

const SettingsModalContext = createContext<SettingsModalContextValue | null>(null);

export function SettingsModalProvider({ children }: PropsWithChildren) {
	const [isOpen, setIsOpen] = useState(false);

	const openModal = useCallback(() => {
		setIsOpen(true);
	}, []);

	const closeModal = useCallback(() => {
		setIsOpen(false);
	}, []);

	const toggleModal = useCallback(() => {
		setIsOpen((prev) => !prev);
	}, []);

	// Handle Escape key to close modal globally
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				closeModal();
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleKeyDown);
			// Prevent body scroll when modal is open
			document.body.style.overflow = "hidden";

			return () => {
				document.removeEventListener("keydown", handleKeyDown);
				document.body.style.overflow = "";
			};
		}
	}, [isOpen, closeModal]);

	return (
		<SettingsModalContext.Provider value={{ isOpen, openModal, closeModal, toggleModal }}>
			{children}
		</SettingsModalContext.Provider>
	);
}

export function useSettingsModal(): SettingsModalContextValue {
	const context = useContext(SettingsModalContext);
	if (!context) {
		throw new Error("useSettingsModal must be used within SettingsModalProvider");
	}
	return context;
}
