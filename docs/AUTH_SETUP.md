# Authentication Setup Guide

This guide explains how to properly configure authentication in the application.

## Required Environment Variables

Add these to your `.env.local` file:

```env
# ============================================
# AUTHENTICATION & SECURITY
# ============================================

## Next Auth
AUTH_SECRET="your-generated-secret"
NEXTAUTH_SECRET="same-as-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Generating a Secure Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

## Common Issues and Solutions

### 1. MissingSecret Error

**Error**: `MissingSecret: Please define a secret`

**Solution**: Ensure both `AUTH_SECRET` and `NEXTAUTH_SECRET` are defined in your `.env.local` file.

### 2. JWTSessionError

**Error**: `JWTSessionError: no matching decryption secret`

**Cause**: This happens when the secret changes after session cookies were created.

**Solution**:
1. Clear your browser cookies for localhost:3000
2. Clear Next.js cache: `rm -rf .next/cache`
3. Restart the development server
4. Use incognito/private browsing mode for testing

### 3. Environment Variable Naming

The application uses both `AUTH_SECRET` (NextAuth v5) and `NEXTAUTH_SECRET` (NextAuth v4) for compatibility. Both should have the same value.

## OAuth Provider Setup

To enable OAuth providers, add their credentials:

```env
## OAuth Providers
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Add other providers as needed...
```

## Development vs Production

- **Development**: The system can generate temporary secrets if missing (not recommended)
- **Production**: All secrets MUST be properly configured

## Security Best Practices

1. **Never commit secrets**: Keep `.env.local` in `.gitignore`
2. **Use strong secrets**: Always use cryptographically secure random values
3. **Rotate secrets regularly**: Change secrets periodically
4. **Different secrets per environment**: Use different secrets for dev/staging/production

## Troubleshooting Steps

1. **Verify environment variables are loaded**:
   ```bash
   grep -E "AUTH_SECRET|NEXTAUTH" .env.local
   ```

2. **Clear all caches**:
   ```bash
   rm -rf .next/cache
   rm -rf .next/static
   ```

3. **Test in incognito mode** to avoid cookie conflicts

4. **Check logs** for specific error messages

5. **Restart the development server** after changing environment variables 