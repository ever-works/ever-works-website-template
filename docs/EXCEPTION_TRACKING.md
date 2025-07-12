# Exception Tracking Configuration

This document explains how to configure exception tracking in the application, which supports using PostHog, Sentry, or both for error tracking.

## Overview

The application provides flexible exception tracking that allows you to choose between:
- **PostHog**: Lightweight exception tracking integrated with your analytics
- **Sentry**: Full-featured error monitoring and performance tracking
- **Both**: Use both services simultaneously
- **None**: Disable exception tracking

## Configuration

### Environment Variables

Add these variables to your `.env.local` file:

```env
# Exception Tracking Configuration
# Options: "sentry", "posthog", "both", or "none"
EXCEPTION_TRACKING_PROVIDER=both

# Enable/disable exception tracking for each service
POSTHOG_EXCEPTION_TRACKING=true
SENTRY_EXCEPTION_TRACKING=true

# PostHog Configuration
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com
POSTHOG_DEBUG=false
POSTHOG_SESSION_RECORDING_ENABLED=true
POSTHOG_AUTO_CAPTURE=false

# Sentry Configuration
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
SENTRY_ORG=your-org-name
SENTRY_PROJECT=your-project-name
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ENABLE_DEV=false
SENTRY_DEBUG=false
```

### Configuration Options Explained

#### EXCEPTION_TRACKING_PROVIDER
- `"sentry"`: Only use Sentry for exception tracking
- `"posthog"`: Only use PostHog for exception tracking
- `"both"`: Use both services (errors sent to both)
- `"none"`: Disable all exception tracking

#### Service-Specific Toggles
- `POSTHOG_EXCEPTION_TRACKING`: Enable/disable PostHog exception tracking
- `SENTRY_EXCEPTION_TRACKING`: Enable/disable Sentry exception tracking

These toggles work in conjunction with `EXCEPTION_TRACKING_PROVIDER`. For example, if you set `EXCEPTION_TRACKING_PROVIDER=both` but `POSTHOG_EXCEPTION_TRACKING=false`, only Sentry will receive exceptions.

## Usage

### Capturing Exceptions

The analytics service provides a unified API for exception tracking:

```typescript
import { analytics } from '@/lib/analytics';

// Capture an exception
try {
  // Your code here
} catch (error) {
  analytics.captureException(error, {
    // Optional context
    userId: user.id,
    action: 'checkout',
    metadata: { cartTotal: 100 }
  });
}

// Capture a string error
analytics.captureException('Something went wrong', {
  severity: 'warning'
});
```

### Automatic Exception Tracking

When PostHog exception tracking is enabled, the following are automatically captured:
- Unhandled JavaScript errors (`window.onerror`)
- Unhandled promise rejections
- React error boundaries (when integrated)

### Checking Current Provider

```typescript
const provider = analytics.getExceptionTrackingProvider();
console.log(`Currently using: ${provider}`);
```

## PostHog Exception Tracking

PostHog captures exceptions as `$exception` events with the following properties:
- `$exception_message`: Error message
- `$exception_type`: Error type/name
- `$exception_stack_trace_raw`: Full stack trace
- `$exception_handled`: Whether the error was handled
- Any additional context you provide

### Benefits of PostHog Exception Tracking
- Integrated with your product analytics
- See exceptions in context with user sessions
- Lightweight, no additional SDK needed
- Can correlate errors with feature usage

### PostHog Dashboard Setup
1. Go to your PostHog dashboard
2. Create a new dashboard for exceptions
3. Add insights filtering for `$exception` events
4. Group by `$exception_type` or `$exception_message`

## Sentry Exception Tracking

Sentry provides comprehensive error monitoring with:
- Detailed stack traces and breadcrumbs
- Release tracking and regression detection
- Performance monitoring
- Error grouping and alerts

### Benefits of Sentry Exception Tracking
- Advanced error grouping and deduplication
- Source map support for production debugging
- Integration with version control
- Sophisticated alerting rules

## Using Both Services

When `EXCEPTION_TRACKING_PROVIDER=both`, exceptions are sent to both services. This is useful for:
- Transitioning between services
- Using PostHog for product analytics correlation
- Using Sentry for detailed debugging
- A/B testing different error tracking approaches

## Best Practices

1. **Choose the Right Provider**
   - Use PostHog if you want simple, integrated exception tracking
   - Use Sentry for comprehensive error monitoring
   - Use both during migration or for complete coverage

2. **Add Context**
   - Always include relevant context when capturing exceptions
   - User ID, feature flags, and session data are valuable

3. **Handle Sensitive Data**
   - Both services support data scrubbing
   - Configure PII removal in service dashboards

4. **Monitor Performance**
   - Exception tracking has minimal overhead
   - Sample rates can be configured if needed

5. **Set Up Alerts**
   - Configure alerts for critical errors
   - Use service-specific alerting features

## Troubleshooting

### Exceptions Not Appearing

1. Check environment variables are set correctly
2. Verify services are initialized (check browser console)
3. Ensure you're not in development mode (unless enabled)
4. Check browser ad blockers aren't blocking requests

### Provider Fallback

The system automatically falls back if a requested provider isn't available:
- If Sentry requested but not configured → falls back to PostHog
- If PostHog requested but not configured → falls back to Sentry
- If neither available → exception tracking disabled

Check the browser console for warnings about provider fallback.

## Migration Guide

### From Sentry-only to PostHog

1. Set `EXCEPTION_TRACKING_PROVIDER=both`
2. Monitor both dashboards
3. Once comfortable, set `EXCEPTION_TRACKING_PROVIDER=posthog`
4. Optionally remove Sentry configuration

### From PostHog-only to Sentry

1. Add Sentry configuration variables
2. Set `EXCEPTION_TRACKING_PROVIDER=both`
3. Verify Sentry is receiving events
4. Set `EXCEPTION_TRACKING_PROVIDER=sentry`

## Performance Considerations

- PostHog exception tracking adds ~0.5KB to your bundle
- Sentry SDK adds ~30KB (gzipped)
- Both services batch requests for efficiency
- Sampling can be configured for high-traffic applications 