"use client";
import React, { useState } from "react";

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
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setOpen(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 2500);
  };

  return (
    <>
      <button
        type="button"
        className={"ml-2 text-xs text-red-500 hover:underline " + (className || "")}
        onClick={e => {
          e.stopPropagation();
          setOpen(true);
        }}
        aria-label="Report inappropriate content"
      >
        🚩 Report
      </button>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-full max-w-xs relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => setOpen(false)}
              aria-label="Close report modal"
            >
              ×
            </button>
            <h3 className="text-lg font-semibold mb-3">Report {contentType}</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <label className="block text-sm font-medium">
                Reason
                <select
                  className="mt-1 block w-full rounded border-gray-300 dark:bg-gray-800 dark:text-white"
                  value={reason}
                  onChange={e => setReason(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a reason</option>
                  {reasons.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </label>
              <label className="block text-sm font-medium">
                Details (optional)
                <textarea
                  className="mt-1 block w-full rounded border-gray-300 dark:bg-gray-800 dark:text-white"
                  rows={3}
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  placeholder="Add more information..."
                />
              </label>
              <button
                type="submit"
                className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 transition"
              >
                Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
      {submitted && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50">
          Thank you for your report!
        </div>
      )}
    </>
  );
};

export default ReportButton; 