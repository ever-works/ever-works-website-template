"use client";
import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";
import { FiFlag, FiCheckCircle, FiLoader } from "react-icons/fi";
import { toast } from "sonner";

// Class constants for readability
const BUTTON_CLASS =
	"inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 dark:bg-red-900/20 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/40 shadow-xs transition-all duration-200";
const MODAL_OVERLAY_CLASS =
	"fixed inset-0 w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-lg z-50";
const MODAL_CONTAINER_CLASS =
	"bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative border border-gray-200 dark:border-gray-700 mx-4 z-50";
const CONFIRM_OVERLAY_CLASS =
	"fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-xs animate-fade-in";
const CONFIRM_CONTAINER_CLASS =
	"flex flex-col items-center gap-3 bg-green-500 text-white px-8 py-6 rounded-2xl shadow-2xl";
const INPUT_CLASS =
	"block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-hidden focus:ring-2 focus:ring-red-400 focus:border-red-400 transition";
const SUBMIT_BUTTON_CLASS =
	"w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed";

interface ReportButtonProps {
	contentType: "item" | "comment";
	contentId: string;
	className?: string;
}

// Map UI labels to API values
const REASON_OPTIONS = [
	{ label: "Spam", value: "spam" },
	{ label: "Harassment", value: "harassment" },
	{ label: "Inappropriate Content", value: "inappropriate" },
	{ label: "Other", value: "other" }
] as const;

const ReportButton: React.FC<ReportButtonProps> = ({ contentType, contentId, className }) => {
	const [open, setOpen] = useState(false);
	const [reason, setReason] = useState("");
	const [details, setDetails] = useState("");
	const [submitted, setSubmitted] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const modalWrapperRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open && modalWrapperRef.current) {
			modalWrapperRef.current.focus();
		}
	}, [open]);

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Escape" && !isSubmitting) {
			setOpen(false);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (isSubmitting) return;

		setIsSubmitting(true);

		try {
			const response = await fetch("/api/reports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contentType,
					contentId,
					reason,
					details: details.trim() || undefined
				})
			});

			const data = await response.json();

			if (!response.ok) {
				if (response.status === 401) {
					toast.error("Please sign in to report content");
				} else if (response.status === 409) {
					toast.error("You have already reported this content");
				} else {
					toast.error(data.error || "Failed to submit report");
				}
				return;
			}

			// Success
			setOpen(false);
			setReason("");
			setDetails("");
			setSubmitted(true);
			setTimeout(() => setSubmitted(false), 2500);
		} catch (error) {
			console.error("Failed to submit report:", error);
			toast.error("Failed to submit report. Please try again.");
		} finally {
			setIsSubmitting(false);
		}
	};

	const modal = (
		<div className={MODAL_OVERLAY_CLASS}>
			<div className={MODAL_CONTAINER_CLASS}>
				<button
					className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold disabled:opacity-50"
					onClick={() => setOpen(false)}
					disabled={isSubmitting}
					aria-label="Close report modal"
				>
					×
				</button>
				<div className="flex items-center gap-2 mb-4">
					<FiFlag className="w-5 h-5 text-red-500" />
					<h3 className="text-lg font-semibold text-gray-900 dark:text-white">Report {contentType}</h3>
				</div>
				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Reason</label>
						<select
							className={INPUT_CLASS}
							value={reason}
							onChange={(e) => setReason(e.target.value)}
							required
							disabled={isSubmitting}
						>
							<option value="" disabled>
								Select a reason
							</option>
							{REASON_OPTIONS.map((r) => (
								<option key={r.value} value={r.value}>
									{r.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
							Details (optional)
						</label>
						<textarea
							className={INPUT_CLASS}
							rows={3}
							value={details}
							onChange={(e) => setDetails(e.target.value)}
							placeholder="Add more information..."
							disabled={isSubmitting}
						/>
					</div>
					<button type="submit" className={SUBMIT_BUTTON_CLASS} disabled={isSubmitting}>
						{isSubmitting ? (
							<span className="flex items-center justify-center gap-2">
								<FiLoader className="w-4 h-4 animate-spin" />
								Submitting...
							</span>
						) : (
							"Submit Report"
						)}
					</button>
				</form>
			</div>
		</div>
	);

	return (
		<>
			<button
				type="button"
				className={BUTTON_CLASS + (className ? ` ${className}` : "")}
				onClick={(e) => {
					e.stopPropagation();
					setOpen(true);
				}}
				aria-label="Report inappropriate content"
			>
				<FiFlag className="w-4 h-4 mr-1" />
				Report
			</button>
			{open &&
				typeof window !== "undefined" &&
				ReactDOM.createPortal(
					<div ref={modalWrapperRef} tabIndex={-1} onKeyDown={handleKeyDown}>
						{modal}
					</div>,
					document.body
				)}
			{submitted &&
				typeof window !== "undefined" &&
				ReactDOM.createPortal(
					<div className={CONFIRM_OVERLAY_CLASS}>
						<div className={CONFIRM_CONTAINER_CLASS}>
							<FiCheckCircle className="w-8 h-8 mb-1 text-white" />
							<span className="text-lg font-semibold">Thank you for your report!</span>
						</div>
					</div>,
					document.body
				)}
		</>
	);
};

export default ReportButton;
