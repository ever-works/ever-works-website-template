"use client";

import { useTranslations } from "next-intl";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import type { ApprovalTrendDataExport } from "@/hooks/use-dashboard-stats";

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

interface ApprovalTrendProps {
    data: ApprovalTrendDataExport[];
    isLoading?: boolean;
}

export function ApprovalTrend({ data, isLoading = false }: ApprovalTrendProps) {
    const t = useTranslations("client.dashboard.APPROVAL_TREND");

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

    const latestRate = data[data.length - 1]?.rate || 0;
    const firstRate = data[0]?.rate || 0;
    const rateChange = latestRate - firstRate;
    const totalSubmissions = data.reduce((sum, item) => sum + item.total, 0);
    const totalApproved = data.reduce((sum, item) => sum + item.approved, 0);

    return (
        <div className={CARD_BASE_STYLES}>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className={TITLE_STYLES}>{t("TITLE")}</h3>
                    <p className={SUBTITLE_STYLES}>{t("SUBTITLE")}</p>
                </div>
                <div className="text-right">
                    <div className={VALUE_STYLES}>{latestRate.toFixed(0)}%</div>
                    <div
                        className={`text-xs ${
                            rateChange >= 0
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600 dark:text-red-400"
                        }`}
                    >
                        {rateChange >= 0 ? "+" : ""}
                        {rateChange.toFixed(0)}%
                    </div>
                </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
                <AreaChart
                    data={data}
                    margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                    <defs>
                        <linearGradient
                            id="approvalGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop
                                offset="5%"
                                stopColor="#10B981"
                                stopOpacity={0.3}
                            />
                            <stop
                                offset="95%"
                                stopColor="#10B981"
                                stopOpacity={0}
                            />
                        </linearGradient>
                    </defs>
                    <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--tw-prose-hr, #e5e7eb)"
                        vertical={false}
                    />
                    <XAxis dataKey="month" stroke="#6B7280" fontSize={12} />
                    <YAxis
                        stroke="#6B7280"
                        fontSize={12}
                        domain={[0, 100]}
                        tickFormatter={(value: number) => `${value}%`}
                    />
                    <Tooltip
                        contentStyle={TOOLTIP_STYLES}
                        formatter={(value) => [
                            `${Number(value).toFixed(1)}%`,
                            t("APPROVAL_RATE"),
                        ]}
                    />
                    <Area
                        type="monotone"
                        dataKey="rate"
                        stroke="#10B981"
                        strokeWidth={2}
                        fill="url(#approvalGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
            <div className="mt-4 flex justify-between text-xs text-gray-500 dark:text-gray-400">
                <span>
                    {t("TOTAL")}: {totalSubmissions}
                </span>
                <span>
                    {t("APPROVED")}: {totalApproved}
                </span>
            </div>
        </div>
    );
}
