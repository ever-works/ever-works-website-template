"use client";
import React, { useState } from "react";
import ReactDOM from "react-dom";
import { FiFlag, FiCheckCircle } from "react-icons/fi"; // Use Feather icon for consistent style
// import clsx from "clsx"; // Uncomment if clsx is available

// Class constants for readability
const BUTTON_CLASS =
  "inline-flex items-center gap-1 px-3 py-1.5 rounded-full border border-red-200 bg-red-50 dark:bg-red-900/20 text-xs font-semibold text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-800/40 shadow-sm transition-all duration-200";
const MODAL_OVERLAY_CLASS =
  "fixed inset-0 w-screen h-screen flex items-center justify-center bg-black/50 backdrop-blur-lg z-50";
const MODAL_CONTAINER_CLASS =
  "bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-full max-w-sm relative border border-gray-200 dark:border-gray-700 mx-4 z-50";
const CONFIRM_OVERLAY_CLASS =
  "fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in";
const CONFIRM_CONTAINER_CLASS =
  "flex flex-col items-center gap-3 bg-green-500 text-white px-8 py-6 rounded-2xl shadow-2xl";

interface ReportButtonProps {
  contentType: string;
  contentId: string;
  className?: string;
}

const reasons = [
  "Spam",
  "Harassment",
  "Inappropriate Content",
  "Other"
];

const ReportButton: React.FC<ReportButtonProps> = ({ contentType, contentId, className }) => {

  void contentId;
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    setReason("");
    setDetails("");
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  const modal = (
    <div className={MODAL_OVERLAY_CLASS}>
      <div className={MODAL_CONTAINER_CLASS}>
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 text-xl font-bold"
          onClick={() => setOpen(false)}
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
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Reason
            </label>
            <select
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
              value={reason}
              onChange={e => setReason(e.target.value)}
              required
            >
              <option value="" disabled>Select a reason</option>
              {reasons.map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Details (optional)
            </label>
            <textarea
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition"
              rows={3}
              value={details}
              onChange={e => setDetails(e.target.value)}
              placeholder="Add more information..."
            />
          </div>
          <button
            type="submit"
            className="w-full bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 transition"
          >
            Submit Report
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
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Report inappropriate content"
      >
        <FiFlag className="w-4 h-4 mr-1" />
        Report
      </button>
      {open && typeof window !== "undefined" && ReactDOM.createPortal(modal, document.body)}
      {submitted && typeof window !== "undefined" && ReactDOM.createPortal(
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