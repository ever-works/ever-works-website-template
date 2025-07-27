import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AdminStats } from "@/hooks/use-admin-stats";
import { TrendingUp } from "lucide-react";

interface AdminActivityChartProps {
  data: AdminStats['activityTrendData'];
  isLoading: boolean;
}

export function AdminActivityChart({ data, isLoading }: AdminActivityChartProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-6 w-32" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 space-y-3">
            {Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex items-end space-x-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className={`h-${Math.floor(Math.random() * 32) + 8} w-full`} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(d.views, d.votes, d.comments)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Weekly Activity Trends</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Views</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Votes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Comments</span>
            </div>
          </div>

          {/* Chart */}
          <div className="h-48 flex items-end space-x-1">
            {data.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center space-y-1">
                {/* Bars */}
                <div className="w-full flex items-end space-x-0.5 h-40">
                  <div 
                    className="bg-blue-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ 
                      height: `${(item.views / maxValue) * 100}%`,
                      minHeight: '2px',
                      width: '30%'
                    }}
                    title={`Views: ${item.views}`}
                  />
                  <div 
                    className="bg-green-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ 
                      height: `${(item.votes / maxValue) * 100}%`,
                      minHeight: '2px',
                      width: '30%'
                    }}
                    title={`Votes: ${item.votes}`}
                  />
                  <div 
                    className="bg-purple-500 rounded-t opacity-80 hover:opacity-100 transition-opacity"
                    style={{ 
                      height: `${(item.comments / maxValue) * 100}%`,
                      minHeight: '2px',
                      width: '30%'
                    }}
                    title={`Comments: ${item.comments}`}
                  />
                </div>
                {/* Day label */}
                <span className="text-xs text-gray-500 dark:text-gray-400">{item.day}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 