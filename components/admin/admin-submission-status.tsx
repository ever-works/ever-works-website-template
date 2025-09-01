import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminStats } from "@/hooks/use-admin-stats";
import { CheckCircle, Clock, XCircle } from "lucide-react";
import { AdminPieChartSkeleton } from "./admin-loading-skeleton";

interface AdminSubmissionStatusProps {
  data: AdminStats['submissionStatusData'];
  isLoading: boolean;
}

export function AdminSubmissionStatus({ data, isLoading }: AdminSubmissionStatusProps) {
  if (isLoading) {
    return <AdminPieChartSkeleton />;
  }

  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Guard against empty data
  if (total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Submission Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            No submissions data available
          </div>
        </CardContent>
      </Card>
    );
  }
  
  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = data.map(item => {
    const percentage = (item.count / total) * 100;
    const angle = (item.count / total) * 360;
    const segment = {
      ...item,
      percentage,
      startAngle: currentAngle,
      endAngle: currentAngle + angle,
    };
    currentAngle += angle;
    return segment;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'Pending':
        return <Clock className="h-4 w-4" />;
      case 'Rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submission Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Simple Pie Chart */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32">
              <svg width="128" height="128" className="transform -rotate-90">
                {segments.map((segment, index) => {
                  const radius = 50;
                  const centerX = 64;
                  const centerY = 64;
                  
                  const startAngleRad = (segment.startAngle * Math.PI) / 180;
                  const endAngleRad = (segment.endAngle * Math.PI) / 180;
                  
                  const x1 = centerX + radius * Math.cos(startAngleRad);
                  const y1 = centerY + radius * Math.sin(startAngleRad);
                  const x2 = centerX + radius * Math.cos(endAngleRad);
                  const y2 = centerY + radius * Math.sin(endAngleRad);
                  
                  const largeArc = segment.endAngle - segment.startAngle > 180 ? 1 : 0;
                  
                  const pathData = [
                    `M ${centerX} ${centerY}`,
                    `L ${x1} ${y1}`,
                    `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                    'Z'
                  ].join(' ');
                  
                  return (
                    <path
                      key={index}
                      d={pathData}
                      fill={segment.color}
                      className="hover:opacity-80 transition-opacity"
                    />
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-3">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="flex items-center space-x-2">
                    <span style={{ color: item.color }}>
                      {getStatusIcon(item.status)}
                    </span>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {item.count}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    ({Math.round((item.count / total) * 100)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Submissions
              </span>
              <span className="text-lg font-bold text-gray-900 dark:text-gray-100">
                {total}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 