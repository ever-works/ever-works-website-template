# Data Version Display System

## Overview

The Data Version Display system shows users the current version of data they are viewing on the website. This feature provides transparency about data freshness and helps users understand when content was last updated.

## Features

- **Real-time Version Display**: Shows current data repository version (commit hash and date)
- **Multiple Display Variants**: Badge, inline, and detailed views
- **Tooltip with Details**: Hover for comprehensive version information
- **ISR Support**: Automatically updates after Incremental Static Regeneration
- **Error Handling**: Graceful fallback when version information is unavailable
- **Auto-refresh**: Periodically updates version information

## Components

### VersionDisplay

The main component for displaying version information.

```tsx
import { VersionDisplay } from "@/components/version";

// Basic usage
<VersionDisplay variant="inline" />

// Badge variant
<VersionDisplay variant="badge" />

// Detailed view with additional information
<VersionDisplay variant="detailed" showDetails={true} />
```

**Props:**
- `variant`: `"inline" | "badge" | "detailed"` - Display style
- `showDetails`: `boolean` - Show extended information (detailed variant only)
- `className`: `string` - Additional CSS classes
- `refreshInterval`: `number` - Auto-refresh interval in milliseconds (default: 5 minutes)

### VersionTooltip

Wrapper component that adds a tooltip with detailed version information.

```tsx
import { VersionTooltip } from "@/components/version";

<VersionTooltip>
  <VersionDisplay variant="badge" />
</VersionTooltip>
```

### useVersionInfo Hook

Custom hook for managing version information with caching and auto-refresh.

```tsx
import { useVersionInfo } from "@/hooks/use-version-info";

const { versionInfo, loading, error, refetch } = useVersionInfo({
  refreshInterval: 5 * 60 * 1000, // 5 minutes
  retryOnError: true,
  retryDelay: 10000
});
```

## API Endpoint

### GET /api/version

Returns current data repository version information.

**Response:**
```json
{
  "commit": "abc1234",
  "date": "2024-01-01T12:00:00.000Z",
  "message": "Update data items",
  "author": "Developer Name",
  "repository": "https://github.com/owner/repo",
  "lastSync": "2024-01-01T12:05:00.000Z"
}
```

**Features:**
- Automatic repository sync before fetching version
- Proper cache headers for optimal performance
- ETag support for efficient caching
- Error handling with appropriate HTTP status codes

## Configuration

### Environment Variables

- `DATA_REPOSITORY`: URL of the data repository
- `GH_TOKEN`: GitHub token for accessing private repositories

### Caching Strategy

- **Client-side**: 1-minute cache with stale-while-revalidate
- **Auto-refresh**: Every 5 minutes by default
- **Window focus**: Refetches when tab becomes active
- **Error retry**: Automatic retry on failure

## Integration Points

The version display is integrated in two locations:

1. **Header**: Discrete badge visible on larger screens
2. **Footer**: Inline display with tooltip for detailed information

## ISR Support

The system is designed to work with Next.js Incremental Static Regeneration:

1. **Repository Sync**: Automatically syncs data repository before fetching version
2. **Cache Headers**: Proper cache control for optimal ISR performance
3. **Auto-refresh**: Detects and displays updated versions automatically
4. **Focus Detection**: Refetches when user returns to the tab

## Error Handling

- **Repository Not Found**: Shows "Data version unavailable"
- **Network Errors**: Automatic retry with exponential backoff
- **Git Errors**: Graceful fallback with error logging
- **Loading States**: Skeleton loader during fetch

## Customization

### Styling

The components use Tailwind CSS classes and can be customized:

```tsx
<VersionDisplay 
  variant="inline" 
  className="text-blue-500 hover:text-blue-700" 
/>
```

### Refresh Interval

Customize the auto-refresh interval:

```tsx
<VersionDisplay 
  variant="badge" 
  refreshInterval={10 * 60 * 1000} // 10 minutes
/>
```

### Tooltip Positioning

The tooltip automatically positions itself and includes a proper arrow pointer.

## Performance Considerations

- **Lightweight**: Minimal impact on bundle size
- **Efficient Caching**: Reduces unnecessary API calls
- **Conditional Rendering**: Only loads when needed
- **Memory Management**: Proper cleanup of intervals and event listeners

## Future Enhancements

- **Branch Information**: Display current branch name
- **Commit Comparison**: Show differences between versions
- **Update Notifications**: Alert users when new version is available
- **Manual Refresh**: Button to manually trigger version update 