import { ItemRepository } from './item.repository';
import { getClientProfileByUserId } from '@/lib/db/queries/client.queries';
import {
    getVotesReceivedCount,
    getCommentsReceivedCount,
    getUniqueItemsInteractedCount,
    getUserTotalActivityCount,
    getWeeklyEngagementData,
    getDailyActivityData,
    getTopItemsEngagement,
} from '@/lib/db/queries/dashboard.queries';
import type { ItemData } from '@/lib/types/item';

// ===================== Types =====================

interface ActivityData {
    date: string;
    submissions: number;
    views: number;
    engagement: number;
}

interface SubmissionTimelineData {
    month: string;
    submissions: number;
}

interface EngagementOverviewData {
    week: string;
    votes: number;
    comments: number;
}

interface StatusBreakdownData {
    status: 'Approved' | 'Pending' | 'Rejected';
    value: number;
    color: string;
}

interface TopItem {
    id: string;
    title: string;
    views: number;
    votes: number;
    comments: number;
}

export interface DashboardStats {
    totalSubmissions: number;
    totalViews: number;
    totalVotesReceived: number;
    totalCommentsReceived: number;
    viewsAvailable: boolean;
    recentActivity: {
        newSubmissions: number;
        newViews: number;
    };
    uniqueItemsInteracted: number;
    totalActivity: number;
    activityChartData: ActivityData[];
    engagementChartData: Array<{ name: string; value: number; color: string }>;
    submissionTimeline: SubmissionTimelineData[];
    engagementOverview: EngagementOverviewData[];
    statusBreakdown: StatusBreakdownData[];
    topItems: TopItem[];
}

// ===================== Constants =====================

const STATUS_COLORS = {
    Approved: '#10B981',
    Pending: '#F59E0B',
    Rejected: '#EF4444',
} as const;

const ENGAGEMENT_COLORS = {
    views: '#3B82F6',
    votes: '#10B981',
    comments: '#F59E0B',
    shares: '#8B5CF6',
} as const;

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ===================== Repository =====================

/**
 * Repository for client dashboard statistics and analytics.
 * Aggregates data from Git-based items and database (votes/comments).
 */
export class ClientDashboardRepository {
    private itemRepository: ItemRepository;

    constructor() {
        this.itemRepository = new ItemRepository();
    }

    /**
     * Get comprehensive dashboard statistics for a user
     * @param userId - User ID (from session)
     * @returns Dashboard statistics
     */
    async getStats(userId: string): Promise<DashboardStats> {
        // Get client profile to get the clientProfileId for DB queries
        const clientProfile = await getClientProfileByUserId(userId);

        if (!clientProfile) {
            // Return empty stats for users without a client profile
            return this.getEmptyStats();
        }

        // Fetch user's items from Git repository
        const userItems = await this.itemRepository.findAll({
            submittedBy: userId,
            includeDeleted: false,
        });

        // Extract item slugs for database queries
        const itemSlugs = userItems.map(item => item.slug);

        // Run parallel queries for efficiency
        const [
            votesReceived,
            commentsReceived,
            uniqueItemsInteracted,
            totalActivity,
            engagementOverview,
            activityChartData,
            topItemsEngagement,
        ] = await Promise.all([
            getVotesReceivedCount(itemSlugs),
            getCommentsReceivedCount(itemSlugs),
            getUniqueItemsInteractedCount(clientProfile.id),
            getUserTotalActivityCount(clientProfile.id),
            getWeeklyEngagementData(itemSlugs, 12),
            getDailyActivityData(clientProfile.id, itemSlugs, 7),
            getTopItemsEngagement(itemSlugs, 5),
        ]);

        // Calculate submission-based metrics from Git items
        const statusBreakdown = this.calculateStatusBreakdown(userItems);
        const submissionTimeline = this.calculateSubmissionTimeline(userItems);
        const recentSubmissions = this.calculateRecentSubmissions(userItems, 7);

        // Map top items with titles from Git data
        const topItems = this.mapTopItems(topItemsEngagement, userItems);

        // Build engagement chart data
        const engagementChartData = [
            { name: 'Views', value: 0, color: ENGAGEMENT_COLORS.views }, // Views not tracked
            { name: 'Votes Received', value: votesReceived, color: ENGAGEMENT_COLORS.votes },
            { name: 'Comments Received', value: commentsReceived, color: ENGAGEMENT_COLORS.comments },
            { name: 'Shares', value: 0, color: ENGAGEMENT_COLORS.shares }, // Shares not tracked
        ];

        return {
            totalSubmissions: userItems.length,
            totalViews: 0, // Views tracking not implemented
            totalVotesReceived: votesReceived,
            totalCommentsReceived: commentsReceived,
            viewsAvailable: false, // Flag to indicate views are not tracked yet
            recentActivity: {
                newSubmissions: recentSubmissions,
                newViews: 0, // Views not tracked
            },
            uniqueItemsInteracted,
            totalActivity,
            activityChartData,
            engagementChartData,
            submissionTimeline,
            engagementOverview,
            statusBreakdown,
            topItems,
        };
    }

    /**
     * Calculate status breakdown from user's items
     */
    private calculateStatusBreakdown(items: ItemData[]): StatusBreakdownData[] {
        const counts = {
            approved: 0,
            pending: 0,
            rejected: 0,
        };

        items.forEach(item => {
            if (item.status === 'approved') counts.approved++;
            else if (item.status === 'pending') counts.pending++;
            else if (item.status === 'rejected') counts.rejected++;
        });

        return [
            { status: 'Approved', value: counts.approved, color: STATUS_COLORS.Approved },
            { status: 'Pending', value: counts.pending, color: STATUS_COLORS.Pending },
            { status: 'Rejected', value: counts.rejected, color: STATUS_COLORS.Rejected },
        ];
    }

    /**
     * Calculate submission timeline (last 6 months)
     */
    private calculateSubmissionTimeline(items: ItemData[]): SubmissionTimelineData[] {
        const now = new Date();
        const monthlySubmissions = new Map<string, number>();

        // Initialize last 6 months
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            monthlySubmissions.set(monthKey, 0);
        }

        // Count submissions per month
        items.forEach(item => {
            if (item.submitted_at) {
                const submittedDate = new Date(item.submitted_at);
                const monthKey = `${submittedDate.getFullYear()}-${submittedDate.getMonth()}`;
                if (monthlySubmissions.has(monthKey)) {
                    monthlySubmissions.set(monthKey, (monthlySubmissions.get(monthKey) ?? 0) + 1);
                }
            }
        });

        // Convert to array with month names
        const result: SubmissionTimelineData[] = [];
        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            result.push({
                month: MONTH_NAMES[date.getMonth()],
                submissions: monthlySubmissions.get(monthKey) ?? 0,
            });
        }

        return result;
    }

    /**
     * Calculate recent submissions count (last N days)
     */
    private calculateRecentSubmissions(items: ItemData[], days: number): number {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        return items.filter(item => {
            if (!item.submitted_at) return false;
            const submittedDate = new Date(item.submitted_at);
            return submittedDate >= cutoffDate;
        }).length;
    }

    /**
     * Map top items engagement data with item titles
     */
    private mapTopItems(
        engagement: Array<{ itemId: string; votes: number; comments: number }>,
        items: ItemData[]
    ): TopItem[] {
        const itemMap = new Map(items.map(item => [item.slug, item]));

        return engagement
            .map(eng => {
                const item = itemMap.get(eng.itemId);
                if (!item) return null;

                return {
                    id: item.id,
                    title: item.name,
                    views: 0, // Views not tracked
                    votes: eng.votes,
                    comments: eng.comments,
                };
            })
            .filter((item): item is TopItem => item !== null);
    }

    /**
     * Return empty stats for users without data
     */
    private getEmptyStats(): DashboardStats {
        return {
            totalSubmissions: 0,
            totalViews: 0,
            totalVotesReceived: 0,
            totalCommentsReceived: 0,
            viewsAvailable: false,
            recentActivity: {
                newSubmissions: 0,
                newViews: 0,
            },
            uniqueItemsInteracted: 0,
            totalActivity: 0,
            activityChartData: this.getEmptyActivityChartData(),
            engagementChartData: [
                { name: 'Views', value: 0, color: ENGAGEMENT_COLORS.views },
                { name: 'Votes Received', value: 0, color: ENGAGEMENT_COLORS.votes },
                { name: 'Comments Received', value: 0, color: ENGAGEMENT_COLORS.comments },
                { name: 'Shares', value: 0, color: ENGAGEMENT_COLORS.shares },
            ],
            submissionTimeline: this.getEmptySubmissionTimeline(),
            engagementOverview: Array.from({ length: 12 }, (_, i) => ({
                week: `W${i + 1}`,
                votes: 0,
                comments: 0,
            })),
            statusBreakdown: [
                { status: 'Approved', value: 0, color: STATUS_COLORS.Approved },
                { status: 'Pending', value: 0, color: STATUS_COLORS.Pending },
                { status: 'Rejected', value: 0, color: STATUS_COLORS.Rejected },
            ],
            topItems: [],
        };
    }

    /**
     * Generate empty activity chart data (7 days)
     */
    private getEmptyActivityChartData(): ActivityData[] {
        const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const result: ActivityData[] = [];

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            result.push({
                date: dayNames[date.getDay()],
                submissions: 0,
                views: 0,
                engagement: 0,
            });
        }

        return result;
    }

    /**
     * Generate empty submission timeline (6 months)
     */
    private getEmptySubmissionTimeline(): SubmissionTimelineData[] {
        const now = new Date();
        const result: SubmissionTimelineData[] = [];

        for (let i = 5; i >= 0; i--) {
            const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
            result.push({
                month: MONTH_NAMES[date.getMonth()],
                submissions: 0,
            });
        }

        return result;
    }
}

// ===================== Singleton =====================

let clientDashboardRepositoryInstance: ClientDashboardRepository | null = null;

/**
 * Get singleton instance of ClientDashboardRepository
 */
export function getClientDashboardRepository(): ClientDashboardRepository {
    if (!clientDashboardRepositoryInstance) {
        clientDashboardRepositoryInstance = new ClientDashboardRepository();
    }
    return clientDashboardRepositoryInstance;
}
