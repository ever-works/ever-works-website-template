import { db } from '@/lib/db/drizzle';
import { sql } from 'drizzle-orm';

export interface UserGrowthTrend {
  month: string;
  users: number;
  active: number;
}

export interface ActivityTrend {
  day: string;
  views: number;
  votes: number;
  comments: number;
}

export interface TopItem {
  name: string;
  views: number;
  votes: number;
  category?: string;
}

export interface RecentActivity {
  type: 'user_signup' | 'submission' | 'comment' | 'vote';
  description: string;
  timestamp: string;
  user?: string;
}

// Simple in-memory cache for development (in production, use Redis)
class SimpleCache {
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

  set(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(pattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }
}

export class AdminAnalyticsOptimizedRepository {
  private cache = new SimpleCache();
  
  // Cache keys
  private readonly CACHE_KEYS = {
    USER_GROWTH: 'user_growth',
    ACTIVITY_TRENDS: 'activity_trends',
    TOP_ITEMS: 'top_items',
    RECENT_ACTIVITY: 'recent_activity',
    USER_STATS: 'user_stats',
    ACTIVITY_STATS: 'activity_stats'
  };

  // Cache TTLs (in milliseconds)
  private readonly CACHE_TTL = {
    USER_GROWTH: 10 * 60 * 1000,      // 10 minutes
    ACTIVITY_TRENDS: 5 * 60 * 1000,    // 5 minutes
    TOP_ITEMS: 15 * 60 * 1000,        // 15 minutes
    RECENT_ACTIVITY: 2 * 60 * 1000,   // 2 minutes
    USER_STATS: 10 * 60 * 1000,       // 10 minutes
    ACTIVITY_STATS: 5 * 60 * 1000     // 5 minutes
  };

  async getUserGrowthTrends(months: number = 12): Promise<UserGrowthTrend[]> {
    const cacheKey = `${this.CACHE_KEYS.USER_GROWTH}_${months}`;
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const trends: UserGrowthTrend[] = [];
      
      // Optimized: Use a single query with window functions for better performance
      const userGrowthQuery = await db.execute(sql`
        WITH monthly_stats AS (
          SELECT 
            DATE_TRUNC('month', created_at) as month_start,
            COUNT(*) as new_users,
            COUNT(*) OVER (ORDER BY DATE_TRUNC('month', created_at)) as cumulative_users
          FROM users 
          WHERE deleted_at IS NULL
          GROUP BY DATE_TRUNC('month', created_at)
          ORDER BY month_start DESC
          LIMIT ${months}
        )
        SELECT 
          month_start,
          new_users,
          cumulative_users
        FROM monthly_stats
        ORDER BY month_start ASC
      `);

      // Transform the results
      for (const row of userGrowthQuery.rows) {
        const monthStart = new Date(row.month_start);
        trends.push({
          month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          users: Number(row.new_users),
          active: Number(row.cumulative_users)
        });
      }
      
      // Cache the result
      this.cache.set(cacheKey, trends, this.CACHE_TTL.USER_GROWTH);
      
      return trends;
    } catch (error) {
      console.error('Error fetching user growth trends:', error);
      throw new Error('Failed to fetch user growth trends');
    }
  }
  
  async getActivityTrends(days: number = 7): Promise<ActivityTrend[]> {
    const cacheKey = `${this.CACHE_KEYS.ACTIVITY_TRENDS}_${days}`;
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Optimized: Use a single query with date aggregation
      const activityQuery = await db.execute(sql`
        WITH daily_activity AS (
          SELECT 
            DATE(created_at) as activity_date,
            'vote' as activity_type,
            COUNT(*) as count
          FROM votes 
          WHERE created_at >= CURRENT_DATE - (${days}::int || ' days')::interval
          GROUP BY DATE(created_at)
          
          UNION ALL
          
          SELECT 
            DATE(created_at) as activity_date,
            'comment' as activity_type,
            COUNT(*) as count
          FROM comments 
          WHERE deleted_at IS NULL 
            AND created_at >= CURRENT_DATE - (${days}::int || ' days')::interval
          GROUP BY DATE(created_at)
        )
        SELECT 
          activity_date,
          SUM(CASE WHEN activity_type = 'vote' THEN count ELSE 0 END) as votes,
          SUM(CASE WHEN activity_type = 'comment' THEN count ELSE 0 END) as comments
        FROM daily_activity
        GROUP BY activity_date
        ORDER BY activity_date ASC
      `);

      const trends: ActivityTrend[] = [];
      
      // Generate all days in range
      for (let i = days - 1; i >= 0; i--) {
        const dayStart = new Date();
        dayStart.setDate(dayStart.getDate() - i);
        const dayKey = dayStart.toISOString().split('T')[0];
        
        // Find matching data or use 0
        const dayData = activityQuery.rows.find((row: any) => row.activity_date === dayKey);
        
        trends.push({
          day: dayStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          views: 0, // Views not tracked in current schema
          votes: dayData ? Number(dayData.votes) : 0,
          comments: dayData ? Number(dayData.comments) : 0
        });
      }
      
      // Cache the result
      this.cache.set(cacheKey, trends, this.CACHE_TTL.ACTIVITY_TRENDS);
      
      return trends;
    } catch (error) {
      console.error('Error fetching activity trends:', error);
      throw new Error('Failed to fetch activity trends');
    }
  }
  
  async getTopItems(limit: number = 10): Promise<TopItem[]> {
    const cacheKey = `${this.CACHE_KEYS.TOP_ITEMS}_${limit}`;
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Optimized: Use window functions for ranking
      const topItemsQuery = await db.execute(sql`
        WITH item_rankings AS (
          SELECT 
            item_id,
            COUNT(*) as vote_count,
            ROW_NUMBER() OVER (ORDER BY COUNT(*) DESC) as rank
          FROM votes
          GROUP BY item_id
        )
        SELECT 
          item_id,
          vote_count,
          rank
        FROM item_rankings
        WHERE rank <= ${limit}
        ORDER BY rank ASC
      `);

      const rows: any[] = Array.isArray((topItemsQuery as any).rows) ? (topItemsQuery as any).rows : [];
      const topItems: TopItem[] = rows.map((item: any) => ({
        name: `Item ${item.item_id}`,
        views: 0, // Views not tracked
        votes: Number(item.vote_count),
        category: 'General'
      }));
      
      // Cache the result
      this.cache.set(cacheKey, topItems, this.CACHE_TTL.TOP_ITEMS);
      
      return topItems;
    } catch (error) {
      console.error('Error fetching top items:', error);
      throw new Error('Failed to fetch top items');
    }
  }
  
  async getRecentActivity(limit: number = 10): Promise<RecentActivity[]> {
    const cacheKey = `${this.CACHE_KEYS.RECENT_ACTIVITY}_${limit}`;
    
    // Try cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      // Optimized: Use UNION with proper ordering and limiting
      const recentActivityQuery = await db.execute(sql`
        (
          SELECT 
            'user_signup' as activity_type,
            email as user_info,
            created_at as activity_time,
            'New user signed up' as description
          FROM users 
          WHERE deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT ${Math.ceil(limit / 3)}
        )
        UNION ALL
        (
          SELECT 
            'comment' as activity_type,
            "userId" as user_info,
            created_at as activity_time,
            'New comment added' as description
          FROM comments 
          WHERE deleted_at IS NULL
          ORDER BY created_at DESC
          LIMIT ${Math.ceil(limit / 3)}
        )
        UNION ALL
        (
          SELECT 
            'vote' as activity_type,
            "userId" as user_info,
            created_at as activity_time,
            CONCAT('New ', vote_type, ' vote') as description
          FROM votes
          ORDER BY created_at DESC
          LIMIT ${Math.ceil(limit / 3)}
        )
        ORDER BY activity_time DESC
        LIMIT ${limit}
      `);

      const recentRows: any[] = Array.isArray((recentActivityQuery as any).rows) ? (recentActivityQuery as any).rows : [];
      const activities: RecentActivity[] = recentRows.map((row: any) => ({
        type: row.activity_type as 'user_signup' | 'comment' | 'vote',
        description: row.description,
        timestamp: row.activity_time,
        user: row.user_info
      }));
      
      // Cache the result
      this.cache.set(cacheKey, activities, this.CACHE_TTL.RECENT_ACTIVITY);
      
      return activities;
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      throw new Error('Failed to fetch recent activity');
    }
  }

  // Performance monitoring methods
  async getQueryPerformanceStats(): Promise<{
    cacheHitRate: number;
    totalQueries: number;
    cachedQueries: number;
    averageQueryTime: number;
  }> {
    // This would integrate with actual performance monitoring in production
    return {
      cacheHitRate: 0.75, // Mock data
      totalQueries: 100,
      cachedQueries: 75,
      averageQueryTime: 45 // milliseconds
    };
  }

  // Cache management methods
  async clearCache(): Promise<void> {
    this.cache.clear();
  }

  async invalidateCache(pattern: string): Promise<void> {
    this.cache.invalidate(pattern);
  }

  // Batch operations for better performance
  async getBatchAnalytics(options: {
    userGrowthMonths?: number;
    activityTrendDays?: number;
    topItemsLimit?: number;
    recentActivityLimit?: number;
  }): Promise<{
    userGrowth: UserGrowthTrend[];
    activityTrends: ActivityTrend[];
    topItems: TopItem[];
    recentActivity: RecentActivity[];
  }> {
    const {
      userGrowthMonths = 12,
      activityTrendDays = 7,
      topItemsLimit = 10,
      recentActivityLimit = 10
    } = options;

    try {
      // Execute all queries in parallel for better performance
      const [userGrowth, activityTrends, topItems, recentActivity] = await Promise.all([
        this.getUserGrowthTrends(userGrowthMonths),
        this.getActivityTrends(activityTrendDays),
        this.getTopItems(topItemsLimit),
        this.getRecentActivity(recentActivityLimit)
      ]);

      return {
        userGrowth,
        activityTrends,
        topItems,
        recentActivity
      };
    } catch (error) {
      console.error('Error fetching batch analytics:', error);
      throw new Error('Failed to fetch batch analytics');
    }
  }
}
