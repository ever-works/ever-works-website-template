-- Standardize naming convention to snake_case
-- This migration renames tables and columns to follow consistent snake_case convention

-- Rename tables to snake_case
ALTER TABLE "passwordResetTokens" RENAME TO "password_reset_tokens";
ALTER TABLE "activityLogs" RENAME TO "activity_logs";
ALTER TABLE "paymentProviders" RENAME TO "payment_providers";
ALTER TABLE "paymentAccounts" RENAME TO "payment_accounts";
ALTER TABLE "verificationTokens" RENAME TO "verification_tokens";

-- Rename columns in users table
ALTER TABLE "users" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "users" RENAME COLUMN "passwordHash" TO "password_hash";
ALTER TABLE "users" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "users" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "users" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "users" RENAME COLUMN "roleId" TO "role_id";
ALTER TABLE "users" RENAME COLUMN "createdBy" TO "created_by";

-- Rename columns in authenticators table
ALTER TABLE "authenticators" RENAME COLUMN "credentialId" TO "credential_id";
ALTER TABLE "authenticators" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "authenticators" RENAME COLUMN "providerAccountId" TO "provider_account_id";
ALTER TABLE "authenticators" RENAME COLUMN "credentialPublicKey" TO "credential_public_key";
ALTER TABLE "authenticators" RENAME COLUMN "credentialDeviceType" TO "credential_device_type";
ALTER TABLE "authenticators" RENAME COLUMN "credentialBackedUp" TO "credential_backed_up";

-- Rename columns in sessions table
ALTER TABLE "sessions" RENAME COLUMN "sessionToken" TO "session_token";
ALTER TABLE "sessions" RENAME COLUMN "userId" TO "user_id";

-- Rename columns in comments table
ALTER TABLE "comments" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "comments" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "comments" RENAME COLUMN "deletedAt" TO "deleted_at";
ALTER TABLE "comments" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "comments" RENAME COLUMN "itemId" TO "item_id";

-- Rename columns in votes table
ALTER TABLE "votes" RENAME COLUMN "itemId" TO "item_id";
ALTER TABLE "votes" RENAME COLUMN "voteType" TO "vote_type";
ALTER TABLE "votes" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "votes" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns in roles table
ALTER TABLE "roles" RENAME COLUMN "createdBy" TO "created_by";
ALTER TABLE "roles" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "roles" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns in client_profiles table
ALTER TABLE "client_profiles" RENAME COLUMN "displayName" TO "display_name";
ALTER TABLE "client_profiles" RENAME COLUMN "jobTitle" TO "job_title";
ALTER TABLE "client_profiles" RENAME COLUMN "accountType" TO "account_type";
ALTER TABLE "client_profiles" RENAME COLUMN "twoFactorEnabled" TO "two_factor_enabled";
ALTER TABLE "client_profiles" RENAME COLUMN "emailVerified" TO "email_verified";
ALTER TABLE "client_profiles" RENAME COLUMN "totalSubmissions" TO "total_submissions";
ALTER TABLE "client_profiles" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "client_profiles" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "client_profiles" RENAME COLUMN "userId" TO "user_id";

-- Rename columns in activity_logs table
ALTER TABLE "activity_logs" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "activity_logs" RENAME COLUMN "ipAddress" TO "ip_address";
ALTER TABLE "activity_logs" RENAME COLUMN "clientId" TO "client_id";

-- Rename columns in accounts table
ALTER TABLE "accounts" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "accounts" RENAME COLUMN "providerAccountId" TO "provider_account_id";
ALTER TABLE "accounts" RENAME COLUMN "refreshToken" TO "refresh_token";
ALTER TABLE "accounts" RENAME COLUMN "accessToken" TO "access_token";
ALTER TABLE "accounts" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "accounts" RENAME COLUMN "tokenType" TO "token_type";
ALTER TABLE "accounts" RENAME COLUMN "idToken" TO "id_token";
ALTER TABLE "accounts" RENAME COLUMN "sessionState" TO "session_state";
ALTER TABLE "accounts" RENAME COLUMN "trialStartDate" TO "trial_start_date";
ALTER TABLE "accounts" RENAME COLUMN "trialEndDate" TO "trial_end_date";
ALTER TABLE "accounts" RENAME COLUMN "subscriptionStartDate" TO "subscription_start_date";
ALTER TABLE "accounts" RENAME COLUMN "subscriptionEndDate" TO "subscription_end_date";
ALTER TABLE "accounts" RENAME COLUMN "lastLoginAt" TO "last_login_at";
ALTER TABLE "accounts" RENAME COLUMN "lastActivityAt" TO "last_activity_at";
ALTER TABLE "accounts" RENAME COLUMN "emailNotifications" TO "email_notifications";
ALTER TABLE "accounts" RENAME COLUMN "marketingEmails" TO "marketing_emails";
ALTER TABLE "accounts" RENAME COLUMN "passwordHash" TO "password_hash";
ALTER TABLE "accounts" RENAME COLUMN "userType" TO "user_type";

-- Rename columns in subscriptions table
ALTER TABLE "subscriptions" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "subscriptions" RENAME COLUMN "trialStart" TO "trial_start";
ALTER TABLE "subscriptions" RENAME COLUMN "trialEnd" TO "trial_end";
ALTER TABLE "subscriptions" RENAME COLUMN "cancelAtPeriodEnd" TO "cancel_at_period_end";
ALTER TABLE "subscriptions" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "subscriptions" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "subscriptions" RENAME COLUMN "stripeCustomerId" TO "stripe_customer_id";
ALTER TABLE "subscriptions" RENAME COLUMN "stripeSubscriptionId" TO "stripe_subscription_id";
ALTER TABLE "subscriptions" RENAME COLUMN "stripePriceId" TO "stripe_price_id";
ALTER TABLE "subscriptions" RENAME COLUMN "stripeProductId" TO "stripe_product_id";
ALTER TABLE "subscriptions" RENAME COLUMN "currentPeriodStart" TO "current_period_start";
ALTER TABLE "subscriptions" RENAME COLUMN "currentPeriodEnd" TO "current_period_end";
ALTER TABLE "subscriptions" RENAME COLUMN "canceledAt" TO "canceled_at";
ALTER TABLE "subscriptions" RENAME COLUMN "paymentMethodId" TO "payment_method_id";
ALTER TABLE "subscriptions" RENAME COLUMN "billingEmail" TO "billing_email";
ALTER TABLE "subscriptions" RENAME COLUMN "billingName" TO "billing_name";
ALTER TABLE "subscriptions" RENAME COLUMN "billingAddress" TO "billing_address";
ALTER TABLE "subscriptions" RENAME COLUMN "billingCity" TO "billing_city";
ALTER TABLE "subscriptions" RENAME COLUMN "billingState" TO "billing_state";
ALTER TABLE "subscriptions" RENAME COLUMN "billingPostalCode" TO "billing_postal_code";
ALTER TABLE "subscriptions" RENAME COLUMN "billingCountry" TO "billing_country";
ALTER TABLE "subscriptions" RENAME COLUMN "paymentProvider" TO "payment_provider";
ALTER TABLE "subscriptions" RENAME COLUMN "subscriptionId" TO "subscription_id";
ALTER TABLE "subscriptions" RENAME COLUMN "invoiceId" TO "invoice_id";
ALTER TABLE "subscriptions" RENAME COLUMN "amountDue" TO "amount_due";
ALTER TABLE "subscriptions" RENAME COLUMN "amountPaid" TO "amount_paid";
ALTER TABLE "subscriptions" RENAME COLUMN "hostedInvoiceUrl" TO "hosted_invoice_url";
ALTER TABLE "subscriptions" RENAME COLUMN "invoicePdf" TO "invoice_pdf";

-- Rename columns in payment_providers table
ALTER TABLE "payment_providers" RENAME COLUMN "isActive" TO "is_active";
ALTER TABLE "payment_providers" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "payment_providers" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns in payment_accounts table
ALTER TABLE "payment_accounts" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "payment_accounts" RENAME COLUMN "providerId" TO "provider_id";
ALTER TABLE "payment_accounts" RENAME COLUMN "customerId" TO "customer_id";
ALTER TABLE "payment_accounts" RENAME COLUMN "accountId" TO "account_id";
ALTER TABLE "payment_accounts" RENAME COLUMN "lastUsed" TO "last_used";
ALTER TABLE "payment_accounts" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "payment_accounts" RENAME COLUMN "updatedAt" TO "updated_at";

-- Rename columns in verification_tokens table
ALTER TABLE "verification_tokens" RENAME COLUMN "identifier" TO "identifier";
ALTER TABLE "verification_tokens" RENAME COLUMN "email" TO "email";
ALTER TABLE "verification_tokens" RENAME COLUMN "token" TO "token";
ALTER TABLE "verification_tokens" RENAME COLUMN "expires" TO "expires";

-- Update foreign key constraint names to match new naming
-- Note: These will need to be dropped and recreated with new names
-- This is a complex operation that should be done carefully in production
