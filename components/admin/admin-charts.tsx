"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, Users, Activity, BarChart3 } from 'lucide-react';

// Constants for className strings
const CHART_CONTAINER_STYLES = "space-y-6";
const CHART_GRID_STYLES = "grid grid-cols-1 lg:grid-cols-2 gap-6";
const CHART_CARD_STYLES = "h-80";
const CHART_HEADER_STYLES = "flex items-center space-x-2";
const CHART_ICON_STYLES = "h-5 w-5 text-blue-600";
const CHART_PLACEHOLDER_STYLES = "h-full flex items-center justify-center text-gray-500";
const STAT_CARD_STYLES = "p-6";
const STAT_HEADER_STYLES = "flex items-center justify-between";
const STAT_ICON_STYLES = "h-8 w-8 text-blue-600";
const STAT_VALUE_STYLES = "text-2xl font-bold text-gray-900 dark:text-white";
const STAT_LABEL_STYLES = "text-sm text-gray-600 dark:text-gray-400";

export interface UserGrowthData {
  month: string;
  users: number;
  active: number;
}

export interface ActivityTrendData {
  day: string;
  views: number;
  votes: number;
  comments: number;
}

export interface TopItemData {
  name: string;
  views: number;
  votes: number;
  category?: string;
}

export interface RecentActivityData {
  type: 'user_signup' | 'submission' | 'comment' | 'vote';
  description: string;
  timestamp: string;
  user?: string;
}

interface AdminChartsProps {
  userGrowthData: UserGrowthData[];
  activityTrendData: ActivityTrendData[];
  topItemsData: TopItemData[];
  recentActivityData: RecentActivityData[];
}

export function AdminCharts({ 
  userGrowthData, 
  activityTrendData, 
  topItemsData, 
  recentActivityData 
}: AdminChartsProps) {
  return (
    <div className={CHART_CONTAINER_STYLES}>
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className={STAT_CARD_STYLES}>
          <div className={STAT_HEADER_STYLES}>
            <div>
              <p className={STAT_LABEL_STYLES}>Total Users</p>
              <p className={STAT_VALUE_STYLES}>
                {userGrowthData.length > 0 ? userGrowthData[userGrowthData.length - 1]?.active || 0 : 0}
              </p>
            </div>
            <Users className={STAT_ICON_STYLES} />
          </div>
        </Card>

        <Card className={STAT_CARD_STYLES}>
          <div className={STAT_HEADER_STYLES}>
            <div>
              <p className={STAT_LABEL_STYLES}>New This Month</p>
              <p className={STAT_VALUE_STYLES}>
                {userGrowthData.length > 0 ? userGrowthData[userGrowthData.length - 1]?.users || 0 : 0}
              </p>
            </div>
            <TrendingUp className={STAT_ICON_STYLES} />
          </div>
        </Card>

        <Card className={STAT_CARD_STYLES}>
          <div className={STAT_HEADER_STYLES}>
            <div>
              <p className={STAT_LABEL_STYLES}>Total Votes</p>
              <p className={STAT_VALUE_STYLES}>
                {activityTrendData.reduce((sum, day) => sum + day.votes, 0)}
              </p>
            </div>
            <Activity className={STAT_ICON_STYLES} />
          </div>
        </Card>

        <Card className={STAT_CARD_STYLES}>
          <div className={STAT_HEADER_STYLES}>
            <div>
              <p className={STAT_LABEL_STYLES}>Top Items</p>
              <p className={STAT_VALUE_STYLES}>{topItemsData.length}</p>
            </div>
            <BarChart3 className={STAT_ICON_STYLES} />
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className={CHART_GRID_STYLES}>
        {/* User Growth Chart */}
        <Card className={CHART_CARD_STYLES}>
          <CardHeader>
            <CardTitle className={CHART_HEADER_STYLES}>
              <TrendingUp className={CHART_ICON_STYLES} />
              <span>User Growth Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userGrowthData.length > 0 ? (
              <div className={CHART_PLACEHOLDER_STYLES}>
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">User Growth Chart</p>
                  <p className="text-sm text-gray-400">
                    {userGrowthData.length} months of data available
                  </p>
                  <div className="mt-4 space-y-2">
                    {userGrowthData.slice(-6).map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{data.month}</span>
                        <span className="font-medium">{data.users} new users</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={CHART_PLACEHOLDER_STYLES}>
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">No User Growth Data</p>
                  <p className="text-sm text-gray-400">Start collecting user data to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Activity Trends Chart */}
        <Card className={CHART_CARD_STYLES}>
          <CardHeader>
            <CardTitle className={CHART_HEADER_STYLES}>
              <Activity className={CHART_ICON_STYLES} />
              <span>Activity Trends</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activityTrendData.length > 0 ? (
              <div className={CHART_PLACEHOLDER_STYLES}>
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">Activity Trends Chart</p>
                  <p className="text-sm text-gray-400">
                    {activityTrendData.length} days of data available
                  </p>
                  <div className="mt-4 space-y-2">
                    {activityTrendData.slice(-7).map((data, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{data.day}</span>
                        <div className="space-x-4">
                          <span className="text-blue-600">{data.votes} votes</span>
                          <span className="text-green-600">{data.comments} comments</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className={CHART_PLACEHOLDER_STYLES}>
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-lg font-medium">No Activity Data</p>
                  <p className="text-sm text-gray-400">Start collecting activity data to see trends</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Items Chart */}
      <Card>
        <CardHeader>
          <CardTitle className={CHART_HEADER_STYLES}>
            <BarChart3 className={CHART_ICON_STYLES} />
            <span>Top Performing Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {topItemsData.length > 0 ? (
            <div className="space-y-4">
              {topItemsData.slice(0, 10).map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {index + 1}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                      {item.category && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.category}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.votes}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">votes</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.views}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">views</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={CHART_PLACEHOLDER_STYLES}>
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No Top Items Data</p>
                <p className="text-sm text-gray-400">Start collecting item data to see rankings</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle className={CHART_HEADER_STYLES}>
            <Activity className={CHART_ICON_STYLES} />
            <span>Recent Activity</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentActivityData.length > 0 ? (
            <div className="space-y-3">
              {recentActivityData.slice(0, 10).map((activity, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(activity.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  {activity.user && (
                    <span className="text-xs text-blue-600 dark:text-blue-400">
                      {activity.user}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className={CHART_PLACEHOLDER_STYLES}>
              <div className="text-center">
                <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-lg font-medium">No Recent Activity</p>
                <p className="text-sm text-gray-400">Start collecting activity data to see updates</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
