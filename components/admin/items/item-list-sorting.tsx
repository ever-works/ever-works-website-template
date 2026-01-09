"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, ArrowDown, Check, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

export type SortField = "name" | "updated_at" | "status" | "submitted_at";
export type SortOrder = "asc" | "desc";

interface ItemListSortingProps {
    sortBy: SortField;
    sortOrder: SortOrder;
    onSortByChange: (sortBy: SortField) => void;
    onSortOrderChange: (sortOrder: SortOrder) => void;
    disabled?: boolean;
    isLoading?: boolean;
}

const SORT_FIELDS: { value: SortField; labelKey: string }[] = [
    { value: "updated_at", labelKey: "SORT_UPDATED" },
    { value: "name", labelKey: "SORT_NAME" },
    { value: "status", labelKey: "SORT_STATUS" },
    { value: "submitted_at", labelKey: "SORT_SUBMITTED" },
];

export function ItemListSorting({
    sortBy,
    sortOrder,
    onSortByChange,
    onSortOrderChange,
    disabled = false,
    isLoading = false,
}: ItemListSortingProps) {
    const t = useTranslations("admin.ADMIN_ITEMS_PAGE");
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLButtonElement>(null);

    const currentFieldLabel = SORT_FIELDS.find((f) => f.value === sortBy)?.labelKey || "SORT_UPDATED";

    // Close menu on outside click
    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node) &&
                buttonRef.current &&
                !buttonRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const handleFieldSelect = (field: SortField) => {
        if (field === sortBy) {
            // Toggle order if same field selected
            onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
        } else {
            onSortByChange(field);
        }
        setIsOpen(false);
    };

    const toggleOrder = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!isLoading) {
            onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
        }
    };

    return (
        <div className="relative">
            <button
                ref={buttonRef}
                onClick={() => !disabled && !isLoading && setIsOpen(!isOpen)}
                disabled={disabled || isLoading}
                className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm",
                    "w-[150px]",
                    "border border-gray-200 dark:border-gray-700",
                    "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white",
                    "hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
            >
                <span
                    onClick={toggleOrder}
                    className={cn(
                        "transition-colors cursor-pointer",
                        !isLoading && "hover:text-theme-primary"
                    )}
                    title={sortOrder === "asc" ? t("SORT_ASC") : t("SORT_DESC")}
                >
                    {isLoading ? (
                        <Loader2 size={14} className="animate-spin" />
                    ) : sortOrder === "asc" ? (
                        <ArrowUp size={14} />
                    ) : (
                        <ArrowDown size={14} />
                    )}
                </span>
                <span>{t(currentFieldLabel)}</span>
            </button>

            {isOpen && (
                <div
                    ref={menuRef}
                    className={cn(
                        "absolute right-0 top-full mt-1 z-50",
                        "min-w-[160px] py-1 rounded-lg shadow-lg",
                        "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    )}
                >
                    {SORT_FIELDS.map((field) => (
                        <button
                            key={field.value}
                            onClick={() => handleFieldSelect(field.value)}
                            className={cn(
                                "w-full flex items-center justify-between px-3 py-2 text-sm text-left",
                                "hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors",
                                sortBy === field.value
                                    ? "text-theme-primary"
                                    : "text-gray-700 dark:text-gray-300"
                            )}
                        >
                            <span>{t(field.labelKey)}</span>
                            {sortBy === field.value && (
                                <Check size={14} className="text-theme-primary" />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
