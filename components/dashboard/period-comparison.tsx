"use client";

import { useTranslations } from "next-intl";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { PeriodComparisonDataExport } from "@/hooks/use-dashboard-stats";

// Design system constants
const CARD_BASE_STYLES = "bg-white dark:bg-gray-900 rounded-xl shadow-xs border border-gray-200 dark:border-gray-700 p-6";
const METRIC_CARD_STYLES = "flex flex-col gap-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg";
const TITLE_STYLES = "text-lg font-semibold text-gray-900 dark:text-gray-100";
const SUBTITLE_STYLES = "text-xs text-gray-500 dark:text-gray-400";
const METRIC_LABEL_STYLES = "text-sm font-medium text-gray-600 dark:text-gray-400";
const METRIC_VALUE_STYLES = "text-2xl font-bold text-gray-900 dark:text-gray-100";
const METRIC_COMPARE_STYLES = "text-sm text-gray-500 dark:text-gray-400";

interface PeriodComparisonProps {
    data?: PeriodComparisonDataExport;
    isLoading?: boolean;
}

interface MetricCardProps {
    label: string;
    thisWeek: number;
    lastWeek: number;
    change: number;
    color: string;
    vsLabel: string;
}

function ChangeIndicator({ value }: { value: number }) {
    const isPositive = value > 0;
    const isNegative = value < 0;

    const colorClass = isPositive
        ? "text-green-600 dark:text-green-400"
        : isNegative
          ? "text-red-600 dark:text-red-400"
          : "text-gray-500 dark:text-gray-400";

    const Icon = isPositive ? TrendingUp : isNegative ? TrendingDown : Minus;

    return (
        <div className="flex items-center gap-1">
            <Icon className={`h-3 w-3 ${colorClass}`} />
            <span className={`text-xs font-medium ${colorClass}`}>
                {isPositive ? "+" : ""}
                {value}%
            </span>
        </div>
    );
}

function MetricCard({ label, thisWeek, lastWeek, change, color, vsLabel }: MetricCardProps) {
    return (
        <div className={METRIC_CARD_STYLES}>
            <div className="flex items-center justify-between">
                <span className={METRIC_LABEL_STYLES}>{label}</span>
                <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
            <div className="flex items-baseline gap-2">
                <span className={METRIC_VALUE_STYLES}>
                    {thisWeek.toLocaleString()}
                </span>
                <span className={METRIC_COMPARE_STYLES}>
                    {vsLabel} {lastWeek.toLocaleString()}
                </span>
            </div>
            <ChangeIndicator value={change} />
        </div>
    );
}

export function PeriodComparison({ data, isLoading = false }: PeriodComparisonProps) {
    const t = useTranslations("client.dashboard.PERIOD_COMPARISON");

    if (isLoading) {
        return (
            <div className={CARD_BASE_STYLES}>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-sm mb-4 w-1/3"></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (!data) {
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
                <h3 className={TITLE_STYLES}>{t("TITLE")}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {t("THIS_WEEK")} vs {t("LAST_WEEK")}
                </span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <MetricCard
                    label={t("VOTES")}
                    thisWeek={data.thisWeek.votes}
                    lastWeek={data.lastWeek.votes}
                    change={data.change.votes}
                    color="#10B981"
                    vsLabel="vs"
                />
                <MetricCard
                    label={t("COMMENTS")}
                    thisWeek={data.thisWeek.comments}
                    lastWeek={data.lastWeek.comments}
                    change={data.change.comments}
                    color="#F59E0B"
                    vsLabel="vs"
                />
                <MetricCard
                    label={t("SUBMISSIONS")}
                    thisWeek={data.thisWeek.submissions}
                    lastWeek={data.lastWeek.submissions}
                    change={data.change.submissions}
                    color="#3B82F6"
                    vsLabel="vs"
                />
                <MetricCard
                    label={t("VIEWS")}
                    thisWeek={data.thisWeek.views}
                    lastWeek={data.lastWeek.views}
                    change={data.change.views}
                    color="#8B5CF6"
                    vsLabel="vs"
                />
            </div>
        </div>
    );
}
