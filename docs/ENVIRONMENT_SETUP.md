# Environment Setup Guide

This guide explains how to configure all environment variables for the Ever Works Website Template.

## Quick Start

1. Copy the example environment file:
   ```bash
   cp .env.example .env.local
   ```

2. Generate a secure secret:
   ```bash
   openssl rand -base64 32
   ```

3. Update the required variables in `.env.local`

## Environment Variables Reference

### 🔐 Authentication & Security

#### NextAuth Configuration
```env
AUTH_SECRET="your-generated-secret"
NEXTAUTH_SECRET="same-as-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

- **AUTH_SECRET**: Core authentication secret (generate with `openssl rand -base64 32`)
- **NEXTAUTH_SECRET**: NextAuth.js compatibility secret (same as AUTH_SECRET)
- **NEXTAUTH_URL**: Your application's URL for callbacks

#### JWT & Cookie Settings
```env
COOKIE_SECRET="your-secure-cookie-secret"
JWT_ACCESS_TOKEN_EXPIRES_IN=15m
JWT_REFRESH_TOKEN_EXPIRES_IN=7d
COOKIE_DOMAIN="localhost"
COOKIE_SECURE=false
COOKIE_SAME_SITE="lax"
```

- **COOKIE_SECRET**: Secret for cookie encryption
- **JWT_ACCESS_TOKEN_EXPIRES_IN**: Access token expiration time
- **JWT_REFRESH_TOKEN_EXPIRES_IN**: Refresh token expiration time
- **COOKIE_DOMAIN**: Cookie domain (use your domain in production)
- **COOKIE_SECURE**: Enable HTTPS-only cookies (true in production)
- **COOKIE_SAME_SITE**: CSRF protection level

#### OAuth Providers
```env
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

GITHUB_CLIENT_ID="your_github_client_id"
GITHUB_CLIENT_SECRET="your_github_client_secret"

FACEBOOK_CLIENT_ID="your_facebook_client_id"
FACEBOOK_CLIENT_SECRET="your_facebook_client_secret"

TWITTER_CLIENT_ID="your_twitter_client_id"
TWITTER_CLIENT_SECRET="your_twitter_client_secret"
```

**Setup Instructions:**
1. **Google**: Visit [Google Cloud Console](https://console.cloud.google.com/)
2. **GitHub**: Visit [GitHub Developer Settings](https://github.com/settings/developers)
3. **Facebook**: Visit [Facebook Developers](https://developers.facebook.com/)
4. **Twitter**: Visit [Twitter Developer Portal](https://developer.twitter.com/)

### 🗄️ Database & Storage

#### PostgreSQL Configuration
```env
DATABASE_URL="postgresql://user:password@localhost:5432/db_name"
```

#### Supabase Configuration (Alternative)
```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"
```

**Setup Instructions:**
1. Create a [Supabase](https://supabase.com/) project
2. Get your project URL and anon key from Settings > API
3. Generate a service role key for server-side operations

### 🌐 API & Backend Services

#### Site URLs
```env
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000/api"
```

#### API Configuration
```env
API_TIMEOUT=10000
API_RETRY_ATTEMPTS=3
API_RETRY_DELAY=1000
```

#### Email Services
```env
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM_ADDRESS="noreply@your-domain.com"
NOVU_API_KEY="your-novu-api-key"
```

**Setup Instructions:**
1. **Resend**: Visit [Resend](https://resend.com/) and create an API key
2. **Novu**: Visit [Novu](https://novu.co/) and get your API key

#### GitHub Integration
```env
GH_TOKEN="your-github-personal-access-token"
DATA_REPOSITORY="https://github.com/your-username/your-content-repo"
```

**Setup Instructions:**
1. Create a [GitHub Personal Access Token](https://github.com/settings/tokens)
2. Grant `repo` permissions for private repositories
3. Fork the [awesome-data repository](https://github.com/ever-works/awesome-data)

### 💳 Payment & Pricing

#### Stripe Configuration
```env
STRIPE_SECRET_KEY="sk_test_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_stripe_webhook_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_stripe_publishable_key"
```

**Setup Instructions:**
1. Create a [Stripe](https://stripe.com/) account
2. Get your API keys from the Dashboard
3. Set up webhooks for payment processing

### 📊 Analytics & Monitoring

#### PostHog Analytics
```env
NEXT_PUBLIC_POSTHOG_KEY="your-posthog-project-key"
NEXT_PUBLIC_POSTHOG_HOST="https://app.posthog.com"
POSTHOG_DEBUG=false
POSTHOG_SESSION_RECORDING_ENABLED=true
POSTHOG_SESSION_RECORDING_SAMPLE_RATE=0.1
POSTHOG_AUTO_CAPTURE=false
POSTHOG_SAMPLE_RATE=1.0
```

**Setup Instructions:**
1. Create a [PostHog](https://posthog.com/) account
2. Get your project key from Project Settings
3. Configure feature flags and session recording

#### Sentry Error Tracking
```env
NEXT_PUBLIC_SENTRY_DSN="your-sentry-dsn"
SENTRY_ORG="your-org-name"
SENTRY_PROJECT="your-project-name"
SENTRY_AUTH_TOKEN="your-auth-token"
SENTRY_ENABLE_DEV=false
SENTRY_DEBUG=false
```

**Setup Instructions:**
1. Create a [Sentry](https://sentry.io/) account
2. Create a new project and get your DSN
3. Generate an auth token for build-time integration

#### Exception Tracking
```env
EXCEPTION_TRACKING_PROVIDER="both"
POSTHOG_EXCEPTION_TRACKING=true
SENTRY_EXCEPTION_TRACKING=true
```

**Options:**
- `"sentry"`: Only use Sentry
- `"posthog"`: Only use PostHog
- `"both"`: Use both services
- `"none"`: Disable exception tracking

### 🌍 Internationalization

```env
DEFAULT_LOCALE="en"
SUPPORTED_LOCALES="en,fr,es,de,ar,zh"
```

### 🛠️ Development Tools

```env
ANALYZE=false
NEXT_PUBLIC_DEBUG=false
DISABLE_ESLINT=false
DISABLE_TYPE_CHECK=false
LOG_LEVEL="info"
ENABLE_QUERY_LOGGING=false
```

## Environment-Specific Configuration

### Development Environment
```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
COOKIE_SECURE=false
COOKIE_SAME_SITE=lax
POSTHOG_DEBUG=true
SENTRY_DEBUG=true
```

### Production Environment
```env
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXTAUTH_URL=https://your-domain.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=strict
COOKIE_DOMAIN=your-domain.com
POSTHOG_DEBUG=false
SENTRY_DEBUG=false
POSTHOG_SESSION_RECORDING_SAMPLE_RATE=0.05
POSTHOG_SAMPLE_RATE=0.1
```

### CORS Configuration (Production)
```env
CORS_ORIGIN=https://your-frontend-domain.com
CORS_CREDENTIALS=true
CORS_METHODS=GET,POST,PUT,DELETE,OPTIONS
```

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. **Use different secrets** for development and production
3. **Generate strong secrets** with `openssl rand -base64 32`
4. **Enable HTTPS** in production (`COOKIE_SECURE=true`)
5. **Use strict CORS** settings in production
6. **Rotate secrets** regularly
7. **Use environment-specific** database URLs
8. **Limit OAuth redirect URIs** to your domains
9. **Enable security headers** in production
10. **Monitor and alert** on authentication failures

## Troubleshooting

### Common Issues

#### Authentication Errors
- **MissingSecret**: Ensure `AUTH_SECRET` is set
- **JWTSessionError**: Clear browser cookies and restart server
- **OAuth Callback Error**: Check redirect URIs in provider settings

#### Database Connection
- **Connection Refused**: Verify database is running
- **Authentication Failed**: Check username/password in `DATABASE_URL`
- **Database Not Found**: Create the database first

#### Analytics Not Working
- **PostHog Events Missing**: Check project key and host URL
- **Sentry Errors Not Appearing**: Verify DSN and project configuration

### Environment Validation

Run the environment check script:
```bash
npm run check-env
```

This will validate all critical environment variables and provide setup guidance.

## Additional Resources

- [NextAuth.js Documentation](https://authjs.dev/)
- [Supabase Documentation](https://supabase.com/docs)
- [PostHog Documentation](https://posthog.com/docs)
- [Sentry Documentation](https://docs.sentry.io/)
- [Stripe Documentation](https://stripe.com/docs)

## Support

If you encounter issues with environment setup:

1. Check the [troubleshooting section](#troubleshooting)
2. Run `npm run check-env` for validation
3. Review the [authentication setup guide](AUTH_SETUP.md)
4. Check the [exception tracking guide](EXCEPTION_TRACKING.md) 