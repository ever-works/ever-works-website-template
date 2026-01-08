"use client";

import { Select, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUp, ArrowDown } from "lucide-react";
import { useTranslations } from "next-intl";

export type SortField = "name" | "updated_at" | "status" | "submitted_at";
export type SortOrder = "asc" | "desc";

interface ItemListSortingProps {
    sortBy: SortField;
    sortOrder: SortOrder;
    onSortByChange: (sortBy: SortField) => void;
    onSortOrderChange: (sortOrder: SortOrder) => void;
    disabled?: boolean;
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
}: ItemListSortingProps) {
    const t = useTranslations("admin.ADMIN_ITEMS_PAGE");

    const handleSortByChange = (keys: string[]) => {
        if (keys.length > 0) {
            onSortByChange(keys[0] as SortField);
        }
    };

    const toggleSortOrder = () => {
        onSortOrderChange(sortOrder === "asc" ? "desc" : "asc");
    };

    return (
        <div className="flex items-center gap-2">
            <Select
                selectedKeys={[sortBy]}
                onSelectionChange={handleSortByChange}
                disabled={disabled}
                size="sm"
                variant="bordered"
                className="w-40"
                classNames={{
                    trigger: "bg-white dark:bg-gray-800 h-9",
                }}
            >
                {SORT_FIELDS.map((field) => (
                    <SelectItem key={field.value} value={field.value}>
                        {t(field.labelKey)}
                    </SelectItem>
                ))}
            </Select>

            <Button
                size="sm"
                variant="ghost"
                onClick={toggleSortOrder}
                disabled={disabled}
                className="h-9 w-9 p-0 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
                title={sortOrder === "asc" ? t("SORT_ASC") : t("SORT_DESC")}
            >
                {sortOrder === "asc" ? (
                    <ArrowUp size={16} className="text-gray-600 dark:text-gray-400" />
                ) : (
                    <ArrowDown size={16} className="text-gray-600 dark:text-gray-400" />
                )}
            </Button>
        </div>
    );
}
