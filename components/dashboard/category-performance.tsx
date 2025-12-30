"use client";

import { useTranslations } from "next-intl";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";
import type { CategoryPerformanceDataExport } from "@/hooks/use-dashboard-stats";

// Design system constants
const CARD_BASE_STYLES = "bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-6";
const TITLE_STYLES = "text-lg font-semibold text-gray-900 dark:text-gray-100";
const SUBTITLE_STYLES = "text-xs text-gray-500 dark:text-gray-400";
const TOOLTIP_STYLES = {
    backgroundColor: "#1F2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    color: "#F9FAFB",
};

const CHART_COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#8B5CF6", "#EF4444"];

interface CategoryPerformanceProps {
    data: CategoryPerformanceDataExport[];
    isLoading?: boolean;
}

export function CategoryPerformance({ data, isLoading = false }: CategoryPerformanceProps) {
    const t = useTranslations("client.dashboard.CATEGORY_PERFORMANCE");

    if (isLoading) {
        return (
            <div className={CARD_BASE_STYLES}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-sm mb-4 w-1/3"></div>
                    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-sm"></div>
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className={CARD_BASE_STYLES}>
                <h3 className={TITLE_STYLES}>{t("TITLE")}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                    {t("NO_DATA")}
                </p>
                <p className={`${SUBTITLE_STYLES} text-center`}>
                    {t("NO_DATA_DESC")}
                </p>
            </div>
        );
    }

    const chartData = data.map((item) => ({
        ...item,
        displayCategory:
            item.category.length > 15
                ? `${item.category.substring(0, 15)}...`
                : item.category,
    }));

    return (
        <div className={CARD_BASE_STYLES}>
            <div className="flex items-center justify-between mb-4">
                <h3 className={TITLE_STYLES}>{t("TITLE")}</h3>
                <span className={SUBTITLE_STYLES}>{t("SUBTITLE")}</span>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <BarChart
                    data={chartData}
                    layout="vertical"
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--tw-prose-hr, #e5e7eb)"
                        horizontal={true}
                        vertical={false}
                    />
                    <XAxis
                        type="number"
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value: number) => value.toFixed(1)}
                    />
                    <YAxis
                        type="category"
                        dataKey="displayCategory"
                        stroke="#6B7280"
                        fontSize={12}
                        width={100}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLES}
                        formatter={(value, name) => {
                            if (name === "avgEngagement") {
                                return [Number(value).toFixed(2), t("AVG_ENGAGEMENT")];
                            }
                            return [value, String(name)];
                        }}
                        labelFormatter={(label) => {
                            const item = data.find(
                                (d) =>
                                    d.category.substring(0, 15) ===
                                    String(label).replace("...", "")
                            );
                            return item ? item.category : String(label);
                        }}
                    />
                    <Bar dataKey="avgEngagement" radius={[0, 4, 4, 0]}>
                        {chartData.map((_, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={CHART_COLORS[index % CHART_COLORS.length]}
                            />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                {data.slice(0, 4).map((item, index) => (
                    <div key={item.category} className="flex items-center gap-2">
                        <div
                            className="h-2 w-2 rounded-full shrink-0"
                            style={{
                                backgroundColor: CHART_COLORS[index % CHART_COLORS.length],
                            }}
                        />
                        <span className="text-gray-600 dark:text-gray-400 truncate">
                            {item.category}
                        </span>
                        <span className="text-gray-900 dark:text-gray-100 font-medium shrink-0">
                            {item.itemCount} {t("ITEMS").toLowerCase()}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
