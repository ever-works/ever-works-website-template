"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    ReferenceLine,
} from "recharts";

// Design system constants
const CARD_BASE_STYLES = "bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-6";
const TITLE_STYLES = "text-lg font-semibold text-gray-900 dark:text-gray-100";
const SUBTITLE_STYLES = "text-sm text-gray-500 dark:text-gray-400";
const VALUE_STYLES = "text-2xl font-bold text-gray-900 dark:text-gray-100";
const TOOLTIP_STYLES = {
    backgroundColor: "#1F2937",
    border: "1px solid #374151",
    borderRadius: "8px",
    color: "#F9FAFB",
};

interface EngagementOverviewData {
    week: string;
    votes: number;
    comments: number;
}

interface EngagementRateChartProps {
    engagementOverview: EngagementOverviewData[];
    totalSubmissions: number;
    isLoading?: boolean;
}

export function EngagementRateChart({
    engagementOverview,
    totalSubmissions,
    isLoading = false,
}: EngagementRateChartProps) {
    const t = useTranslations("client.dashboard.ENGAGEMENT_RATE");

    const chartData = useMemo(() => {
        if (!engagementOverview || totalSubmissions === 0) return [];

        return engagementOverview.map((week) => ({
            week: week.week,
            rate:
                totalSubmissions > 0
                    ? ((week.votes + week.comments) / totalSubmissions) * 100
                    : 0,
            totalEngagement: week.votes + week.comments,
        }));
    }, [engagementOverview, totalSubmissions]);

    const avgRate = useMemo(() => {
        if (chartData.length === 0) return 0;
        return chartData.reduce((sum, d) => sum + d.rate, 0) / chartData.length;
    }, [chartData]);

    const currentRate = chartData[chartData.length - 1]?.rate || 0;
    const previousRate = chartData.length >= 2 ? chartData[chartData.length - 2]?.rate || 0 : 0;
    const rateChange = chartData.length >= 2 ? currentRate - previousRate : 0;

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

    if (!chartData || chartData.length === 0) {
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

    return (
        <div className={CARD_BASE_STYLES}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className={TITLE_STYLES}>{t("TITLE")}</h3>
                    <p className={SUBTITLE_STYLES}>{t("SUBTITLE")}</p>
                </div>
                <div className="text-right">
                    <div className={VALUE_STYLES}>{currentRate.toFixed(1)}%</div>
                    <div
                        className={`text-xs ${
                            rateChange >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                        }`}
                    >
                        {rateChange >= 0 ? "+" : ""}
                        {rateChange.toFixed(1)}%
                    </div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
                <LineChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--tw-prose-hr, #e5e7eb)"
                    />
                    <XAxis dataKey="week" stroke="#6B7280" fontSize={12} />
                    <YAxis
                        stroke="#6B7280"
                        fontSize={12}
                        tickFormatter={(value: number) => `${value.toFixed(0)}%`}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLES}
                        formatter={(value, name) => {
                            if (name === "rate") {
                                return [`${Number(value).toFixed(2)}%`, t("RATE")];
                            }
                            return [value, String(name)];
                        }}
                    />
                    <ReferenceLine
                        y={avgRate}
                        stroke="#8B5CF6"
                        strokeDasharray="5 5"
                        label={{
                            value: `Avg: ${avgRate.toFixed(1)}%`,
                            position: "insideTopRight",
                            fill: "#8B5CF6",
                            fontSize: 11,
                        }}
                    />
                    <Line
                        type="monotone"
                        dataKey="rate"
                        stroke="#3B82F6"
                        strokeWidth={2}
                        dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: "#3B82F6" }}
                    />
                </LineChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-between text-xs">
                <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 bg-blue-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                        {t("RATE")}
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-0.5 w-4 border-t-2 border-dashed border-purple-500" />
                    <span className="text-gray-600 dark:text-gray-400">
                        Avg: {avgRate.toFixed(1)}%
                    </span>
                </div>
            </div>
        </div>
    );
}
