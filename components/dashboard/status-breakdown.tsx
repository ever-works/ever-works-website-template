"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusBreakdownData {
  status: 'Approved' | 'Pending' | 'Rejected';
  value: number;
  color: string;
  [key: string]: any;
}

interface StatusBreakdownProps {
  data: StatusBreakdownData[];
  isLoading?: boolean;
}

// Tooltip style constant for reuse and theme configuration
const tooltipContentStyle = {
  backgroundColor: '#1F2937',
  border: '1px solid #374151',
  borderRadius: '8px',
  color: '#F9FAFB',
};

export function StatusBreakdown({ data, isLoading = false }: StatusBreakdownProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4 w-1/2"></div>
          <div className="h-[250px] bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Submission Status
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ status, percent }) => `${status} ${(typeof percent === 'number' ? (percent * 100).toFixed(0) : '0')}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={tooltipContentStyle}
          />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 