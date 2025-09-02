"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, FileText, Calendar, Clock, Settings, RefreshCw } from 'lucide-react';
// Removed dummy data service; scheduled reports will be backed by DB seeding

// Constants for className strings
const EXPORT_CONTAINER_STYLES = "space-y-6";
const EXPORT_GRID_STYLES = "grid grid-cols-1 lg:grid-cols-2 gap-6";
const EXPORT_CARD_STYLES = "h-full";
const EXPORT_HEADER_STYLES = "flex items-center space-x-2";
const EXPORT_ICON_STYLES = "h-5 w-5 text-blue-600";
const EXPORT_BUTTON_STYLES = "w-full justify-start";
const EXPORT_OPTIONS_STYLES = "space-y-3";
const EXPORT_OPTION_STYLES = "flex items-center justify-between p-3 rounded-lg border bg-gray-50 dark:bg-gray-800";
const EXPORT_OPTION_LEFT_STYLES = "flex items-center space-x-3";
const EXPORT_OPTION_RIGHT_STYLES = "flex items-center space-x-2";
const SCHEDULED_REPORTS_STYLES = "space-y-3";
const REPORT_ITEM_STYLES = "flex items-center justify-between p-3 rounded-lg border";
const REPORT_STATUS_STYLES = "px-2 py-1 rounded-full text-xs font-medium";
const REPORT_STATUS_SUCCESS_STYLES = "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
const REPORT_STATUS_FAILED_STYLES = "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
const REPORT_STATUS_PENDING_STYLES = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";

interface ExportOption {
  id: string;
  name: string;
  description: string;
  formats: ('csv' | 'json')[];
  icon: React.ReactNode;
  action: () => void;
}



export function AdminDataExport() {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [selectedFormat, setSelectedFormat] = useState<'csv' | 'json'>('csv');
  const [includeMetadata, setIncludeMetadata] = useState(true);

  // Placeholder until DB-backed scheduled reports are seeded
  const scheduledReports: Array<{ id: string; name: string; schedule: string; format: string; status: string; lastGenerated?: string; nextGeneration?: string; recipients: string[]; }> = [];

  const exportOptions: ExportOption[] = [
    {
      id: 'user-growth',
      name: 'User Growth Trends',
      description: 'Export user registration and growth data',
      formats: ['csv', 'json'],
      icon: <Download className="h-4 w-4" />,
      action: () => handleExport('user-growth')
    },
    {
      id: 'activity-trends',
      name: 'Activity Trends',
      description: 'Export platform activity and engagement metrics',
      formats: ['csv', 'json'],
      icon: <FileText className="h-4 w-4" />,
      action: () => handleExport('activity-trends')
    },
    {
      id: 'top-items',
      name: 'Top Performing Items',
      description: 'Export ranking and performance data',
      formats: ['csv', 'json'],
      icon: <FileText className="h-4 w-4" />,
      action: () => handleExport('top-items')
    },
    {
      id: 'recent-activity',
      name: 'Recent Activity Feed',
      description: 'Export recent user activities and events',
      formats: ['csv', 'json'],
      icon: <FileText className="h-4 w-4" />,
      action: () => handleExport('recent-activity')
    },
    {
      id: 'comprehensive',
      name: 'Comprehensive Report',
      description: 'Export all analytics data in one report',
      formats: ['csv', 'json'],
      icon: <FileText className="h-4 w-4" />,
      action: () => handleExport('comprehensive')
    }
  ];

  const handleExport = async (type: string) => {
    setIsExporting(true);
    setExportProgress(0);

    // Simulate export process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100));
      setExportProgress(i);
    }

    // Simulate file download
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${type}-${timestamp}.${selectedFormat}`;
    
    // Create a mock download
    const content = `Mock ${type} data exported on ${timestamp}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setIsExporting(false);
    setExportProgress(0);
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'generated':
        return REPORT_STATUS_SUCCESS_STYLES;
      case 'failed':
        return REPORT_STATUS_FAILED_STYLES;
      case 'pending':
        return REPORT_STATUS_PENDING_STYLES;
      default:
        return '';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'generated':
        return 'Generated';
      case 'failed':
        return 'Failed';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className={EXPORT_CONTAINER_STYLES}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Export & Reports</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Export analytics data and manage scheduled reports
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
          className="flex items-center space-x-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Export Options */}
      <Card>
        <CardHeader>
          <CardTitle className={EXPORT_HEADER_STYLES}>
            <Download className={EXPORT_ICON_STYLES} />
            <span>Export Options</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={EXPORT_OPTIONS_STYLES}>
            {/* Format Selection */}
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium">Export Format:</label>
              <div className="flex space-x-2">
                {(['csv', 'json'] as const).map((format) => (
                  <Button
                    key={format}
                    variant={selectedFormat === format ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedFormat(format)}
                    className="w-16"
                  >
                    {format.toUpperCase()}
                  </Button>
                ))}
              </div>
            </div>

            {/* Metadata Option */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="include-metadata"
                checked={includeMetadata}
                onChange={(e) => setIncludeMetadata(e.target.checked)}
                className="rounded border-gray-300"
              />
              <label htmlFor="include-metadata" className="text-sm">
                Include metadata and export information
              </label>
            </div>
          </div>

          {/* Export Progress */}
          {isExporting && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm mb-2">
                <span>Exporting...</span>
                <span>{exportProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${exportProgress}%` }}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Export Options Grid */}
      <div className={EXPORT_GRID_STYLES}>
        {/* Manual Export Options */}
        <Card className={EXPORT_CARD_STYLES}>
          <CardHeader>
            <CardTitle className={EXPORT_HEADER_STYLES}>
              <Download className={EXPORT_ICON_STYLES} />
              <span>Manual Export</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exportOptions.map((option) => (
                <div key={option.id} className={EXPORT_OPTION_STYLES}>
                  <div className={EXPORT_OPTION_LEFT_STYLES}>
                    {option.icon}
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{option.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{option.description}</p>
                    </div>
                  </div>
                  <div className={EXPORT_OPTION_RIGHT_STYLES}>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={option.action}
                      disabled={isExporting}
                      className={EXPORT_BUTTON_STYLES}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export {selectedFormat.toUpperCase()}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Scheduled Reports */}
        <Card className={EXPORT_CARD_STYLES}>
          <CardHeader>
            <CardTitle className={EXPORT_HEADER_STYLES}>
              <Calendar className={EXPORT_ICON_STYLES} />
              <span>Scheduled Reports</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={SCHEDULED_REPORTS_STYLES}>
              {scheduledReports.map((report) => (
                <div key={report.id} className={REPORT_ITEM_STYLES}>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{report.name}</h4>
                      <span className={`${REPORT_STATUS_STYLES} ${getStatusStyles(report.status)}`}>
                        {getStatusText(report.status)}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-3 w-3" />
                        <span>{report.schedule}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-3 w-3" />
                        <span>Format: {report.format}</span>
                      </div>
                      {report.lastGenerated && (
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-3 w-3" />
                          <span>Last: {report.lastGenerated}</span>
                        </div>
                      )}
                      {report.nextGeneration && (
                        <div className="flex items-center space-x-2">
                          <Clock className="h-3 w-3" />
                          <span>Next: {report.nextGeneration}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Management */}
      <Card>
        <CardHeader>
          <CardTitle className={EXPORT_HEADER_STYLES}>
            <Settings className={EXPORT_ICON_STYLES} />
            <span>Report Management</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              Create New Template
            </Button>
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Manage Templates
            </Button>
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              View History
            </Button>
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Export Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
