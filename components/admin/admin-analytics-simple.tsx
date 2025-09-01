"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminCharts, UserGrowthData, ActivityTrendData, TopItemData, RecentActivityData } from './admin-charts';
import { RefreshCw } from 'lucide-react';
import { AdminPerformanceMonitor } from './admin-performance-monitor';

// Constants for className strings
const ANALYTICS_CONTAINER_STYLES = "space-y-6";
const FILTERS_CONTAINER_STYLES = "flex flex-wrap gap-4 items-center";
const HEADER_STYLES = "flex items-center justify-between";
const LOADING_STYLES = "flex items-center justify-center p-8";
const ERROR_STYLES = "rounded-md border border-red-200 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950 dark:text-red-200";

// Mock data for demonstration
const MOCK_USER_GROWTH: UserGrowthData[] = [
  { month: 'Jan', users: 45, active: 120 },
  { month: 'Feb', users: 52, active: 172 },
  { month: 'Mar', users: 48, active: 220 },
  { month: 'Apr', users: 61, active: 281 },
  { month: 'May', users: 55, active: 336 },
  { month: 'Jun', users: 67, active: 403 },
  { month: 'Jul', users: 58, active: 461 },
  { month: 'Aug', users: 63, active: 524 },
  { month: 'Sep', users: 71, active: 595 },
  { month: 'Oct', users: 65, active: 660 },
  { month: 'Nov', users: 78, active: 738 },
  { month: 'Dec', users: 82, active: 820 }
];

const MOCK_ACTIVITY_TRENDS: ActivityTrendData[] = [
  { day: 'Mon', views: 0, votes: 12, comments: 8 },
  { day: 'Tue', views: 0, votes: 18, comments: 15 },
  { day: 'Wed', views: 0, votes: 22, comments: 19 },
  { day: 'Thu', views: 0, votes: 16, comments: 12 },
  { day: 'Fri', views: 0, votes: 25, comments: 21 },
  { day: 'Sat', views: 0, votes: 19, comments: 16 },
  { day: 'Sun', views: 0, votes: 14, comments: 11 }
];

const MOCK_TOP_ITEMS: TopItemData[] = [
  { name: 'TimeTracker Pro', views: 0, votes: 156, category: 'Productivity' },
  { name: 'CodeEditor Plus', views: 0, votes: 142, category: 'Development' },
  { name: 'Design Studio', views: 0, votes: 128, category: 'Design' },
  { name: 'Analytics Dashboard', views: 0, votes: 115, category: 'Business' },
  { name: 'Mobile App Builder', views: 0, votes: 98, category: 'Development' },
  { name: 'Project Manager', views: 0, votes: 87, category: 'Management' },
  { name: 'Data Visualizer', views: 0, votes: 76, category: 'Analytics' },
  { name: 'Cloud Storage', views: 0, votes: 65, category: 'Infrastructure' },
  { name: 'Security Suite', views: 0, votes: 54, category: 'Security' },
  { name: 'API Gateway', views: 0, votes: 43, category: 'Backend' }
];

const MOCK_RECENT_ACTIVITY: RecentActivityData[] = [
  { type: 'user_signup', description: 'New user signed up', timestamp: '2024-01-15T10:30:00Z', user: 'john.doe@example.com' },
  { type: 'comment', description: 'New comment added', timestamp: '2024-01-15T09:45:00Z', user: 'user123' },
  { type: 'vote', description: 'New upvote vote', timestamp: '2024-01-15T09:20:00Z', user: 'user456' },
  { type: 'user_signup', description: 'New user signed up', timestamp: '2024-01-15T08:15:00Z', user: 'jane.smith@example.com' },
  { type: 'comment', description: 'New comment added', timestamp: '2024-01-15T07:30:00Z', user: 'user789' },
  { type: 'vote', description: 'New downvote vote', timestamp: '2024-01-15T07:00:00Z', user: 'user101' },
  { type: 'user_signup', description: 'New user signed up', timestamp: '2024-01-15T06:45:00Z', user: 'bob.wilson@example.com' },
  { type: 'comment', description: 'New comment added', timestamp: '2024-01-15T06:20:00Z', user: 'user202' },
  { type: 'vote', description: 'New upvote vote', timestamp: '2024-01-15T05:55:00Z', user: 'user303' },
  { type: 'user_signup', description: 'New user signed up', timestamp: '2024-01-15T05:30:00Z', user: 'alice.brown@example.com' }
];

export function AdminAnalyticsSimple() {
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [timeRange, setTimeRange] = useState({ months: 12, days: 7, limit: 10 });

  const handleRefresh = async () => {
    setIsLoading(true);
    setIsError(false);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
  };

  const handleTimeRangeChange = (type: 'months' | 'days' | 'limit', value: number) => {
    setTimeRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  if (isLoading) {
    return (
      <div className={LOADING_STYLES}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className={ERROR_STYLES}>
        <div className="flex items-start justify-between gap-4">
          <p className="text-sm">Failed to load analytics data.</p>
          <Button variant="outline" size="sm" onClick={handleRefresh}>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={ANALYTICS_CONTAINER_STYLES}>
      {/* Header with filters */}
      <div className={HEADER_STYLES}>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400">Platform insights and trends</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`h-4 w-4${isLoading ? ' animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Time Range Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Time Range Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className={FILTERS_CONTAINER_STYLES}>
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">User Growth:</label>
              <div className="flex space-x-1">
                {[6, 12, 18, 24].map((months) => (
                  <Button
                    key={months}
                    variant={timeRange.months === months ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeRangeChange('months', months)}
                    className="w-16"
                  >
                    {months}m
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Activity Trends:</label>
              <div className="flex space-x-1">
                {[7, 14, 30, 90].map((days) => (
                  <Button
                    key={days}
                    variant={timeRange.days === days ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeRangeChange('days', days)}
                    className="w-16"
                  >
                    {days}d
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium">Top Items:</label>
              <div className="flex space-x-1">
                {[5, 10, 20, 50].map((limit) => (
                  <Button
                    key={limit}
                    variant={timeRange.limit === limit ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTimeRangeChange('limit', limit)}
                    className="w-16"
                  >
                    Top {limit}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts Component */}
      <AdminCharts
        userGrowthData={MOCK_USER_GROWTH}
        activityTrendData={MOCK_ACTIVITY_TRENDS}
        topItemsData={MOCK_TOP_ITEMS}
        recentActivityData={MOCK_RECENT_ACTIVITY}
      />

      {/* Performance Monitor */}
      <AdminPerformanceMonitor />
    </div>
  );
}
