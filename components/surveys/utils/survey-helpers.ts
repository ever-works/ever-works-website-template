/**
 * Export survey responses to CSV
 */
export function exportResponsesToCSV(responses: any[], filename: string) {
  if (responses.length === 0) {
    return;
  }

  // Get all unique keys from all responses
  const allKeys = new Set<string>();
  responses.forEach(response => {
    Object.keys(response.data).forEach(key => allKeys.add(key));
  });

  // Create CSV header
  const headers = ['Response ID', 'User ID', 'Completed At', ...Array.from(allKeys)];
  const csvRows = [headers.join(',')];

  // Create CSV rows
  responses.forEach(response => {
    const row = [
      response.id,
      response.userId || 'Anonymous',
      new Date(response.completedAt).toLocaleString(),
      ...Array.from(allKeys).map(key => {
        const value = response.data[key];
        // Handle different value types
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        // Escape commas and quotes
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
      })
    ];
    csvRows.push(row.join(','));
  });

  // Create and download CSV file
  const csvContent = csvRows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_responses.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format duration in a human-readable way
 */
export function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

/**
 * Format status label to human-readable format
 */
export function formatSurveyStatusLabel(status: string): string {
  switch (status) {
    case 'published':
      return 'Published';
    case 'draft':
      return 'Draft';
    case 'closed':
      return 'Closed';
    default:
      return status.charAt(0).toUpperCase() + status.slice(1);
  }
}

/**
 * Format type label to human-readable format
 */
export function formatSurveyTypeLabel(type: string): string {
  switch (type) {
    case 'global':
      return 'Global Survey';
    case 'item':
      return 'Item Survey';
    default:
      return type.charAt(0).toUpperCase() + type.slice(1);
  }
}

/**
 * Get color class for survey status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case 'published':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case 'draft':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    case 'closed':
      return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

/**
 * Get color class for survey type
 */
export function getTypeColor(type: string): string {
  switch (type) {
    case 'global':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case 'item':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
}

/**
 * Generate public survey link
 */
export function getPublicSurveyLink(slug: string, itemId?: string): string {
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  if (itemId) {
    return `${baseUrl}/items/${itemId}/surveys/${slug}`;
  }
  return `${baseUrl}/surveys/${slug}`;
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
}

