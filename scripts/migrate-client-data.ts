#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { accounts, clientProfiles, users } from '../lib/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sql = postgres(connectionString);
const db = drizzle(sql);

interface ClientData {
  userId: string;
  displayName?: string | null;
  username?: string | null;
  bio?: string | null;
  jobTitle?: string | null;
  company?: string | null;
  industry?: string | null;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
  accountType?: string | null;
  status?: string | null;
  plan?: string | null;
  timezone?: string | null;
  language?: string | null;
  twoFactorEnabled?: boolean | null;
  emailVerified?: boolean | null;
  totalSubmissions?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

async function migrateClientData() {
  console.log('🚀 Starting client data migration...');
  
  try {
    // Step 1: Get all accounts that have client data (manual accounts)
    console.log('📋 Fetching client data from accounts table...');
    
    const clientAccounts = await db
      .select({
        userId: accounts.userId,
        displayName: accounts.displayName,
        username: accounts.username,
        bio: accounts.bio,
        jobTitle: accounts.jobTitle,
        company: accounts.company,
        industry: accounts.industry,
        phone: accounts.phone,
        website: accounts.website,
        location: accounts.location,
        accountType: accounts.accountType,
        status: accounts.status,
        plan: accounts.plan,
        timezone: accounts.timezone,
        language: accounts.language,
        twoFactorEnabled: accounts.twoFactorEnabled,
        emailVerified: accounts.emailVerified,
        totalSubmissions: accounts.totalSubmissions,
        createdAt: accounts.createdAt,
        updatedAt: accounts.updatedAt,
      })
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, 'manual'),
          isNotNull(accounts.username)
        )
      );

    console.log(`📊 Found ${clientAccounts.length} client accounts to migrate`);

    if (clientAccounts.length === 0) {
      console.log('✅ No client data to migrate');
      return;
    }

    // Step 2: Validate user existence and prepare migration data
    console.log('🔍 Validating user existence...');
    
    const userIds = [...new Set(clientAccounts.map(account => account.userId))];
    const existingUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(and(...userIds.map(id => eq(users.id, id))));

    const existingUserIds = new Set(existingUsers.map(user => user.id));
    const validClientAccounts = clientAccounts.filter(account => 
      existingUserIds.has(account.userId)
    );

    console.log(`✅ ${validClientAccounts.length} valid client accounts found`);

    // Step 3: Check for username conflicts
    console.log('🔍 Checking for username conflicts...');
    
    const existingUsernames = await db
      .select({ username: clientProfiles.username })
      .from(clientProfiles)
      .where(isNotNull(clientProfiles.username));

    const existingUsernameSet = new Set(existingUsernames.map(p => p.username));
    const conflictingAccounts = validClientAccounts.filter(account => 
      account.username && existingUsernameSet.has(account.username)
    );

    if (conflictingAccounts.length > 0) {
      console.log(`⚠️  Found ${conflictingAccounts.length} accounts with conflicting usernames:`);
      conflictingAccounts.forEach(account => {
        console.log(`   - User ${account.userId}: ${account.username}`);
      });
      
      // Resolve conflicts by appending timestamp
      for (const account of conflictingAccounts) {
        if (account.username) {
          account.username = `${account.username}_${Date.now()}`;
        }
      }
      console.log('✅ Username conflicts resolved');
    }

    // Step 4: Insert client profiles
    console.log('💾 Inserting client profiles...');
    
    const insertPromises = validClientAccounts.map(async (account) => {
      try {
        const clientProfileData = {
          userId: account.userId,
          displayName: account.displayName,
          username: account.username,
          bio: account.bio,
          jobTitle: account.jobTitle,
          company: account.company,
          industry: account.industry,
          phone: account.phone,
          website: account.website,
          location: account.location,
          accountType: account.accountType as 'individual' | 'business' | 'enterprise' | undefined,
          status: account.status as 'active' | 'inactive' | 'suspended' | 'trial' | undefined,
          plan: account.plan as 'free' | 'standard' | 'premium' | undefined,
          timezone: account.timezone,
          language: account.language,
          twoFactorEnabled: account.twoFactorEnabled,
          emailVerified: account.emailVerified,
          totalSubmissions: account.totalSubmissions,
          createdAt: account.createdAt ? new Date(account.createdAt) : new Date(),
          updatedAt: account.updatedAt ? new Date(account.updatedAt) : new Date(),
        };

        await db.insert(clientProfiles).values(clientProfileData);
        return { success: true, userId: account.userId };
      } catch (error) {
        console.error(`❌ Failed to migrate user ${account.userId}:`, error);
        return { success: false, userId: account.userId, error };
      }
    });

    const results = await Promise.all(insertPromises);
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`✅ Successfully migrated ${successful.length} client profiles`);
    
    if (failed.length > 0) {
      console.log(`❌ Failed to migrate ${failed.length} client profiles:`);
      failed.forEach(result => {
        console.log(`   - User ${result.userId}: ${result.error}`);
      });
    }

    // Step 5: Verify migration
    console.log('🔍 Verifying migration...');
    
    const migratedCount = await db
      .select({ count: sql`count(*)` })
      .from(clientProfiles);

    console.log(`📊 Total client profiles in database: ${migratedCount[0].count}`);

    // Step 6: Summary
    console.log('\n📋 Migration Summary:');
    console.log(`   - Total accounts processed: ${clientAccounts.length}`);
    console.log(`   - Valid accounts: ${validClientAccounts.length}`);
    console.log(`   - Successfully migrated: ${successful.length}`);
    console.log(`   - Failed migrations: ${failed.length}`);
    console.log(`   - Username conflicts resolved: ${conflictingAccounts.length}`);

    if (successful.length > 0) {
      console.log('\n✅ Migration completed successfully!');
      console.log('⚠️  Note: Client data has been copied to client_profiles table.');
      console.log('⚠️  Original data in accounts table will be cleaned up in the next phase.');
    } else {
      console.log('\n❌ Migration failed - no data was migrated');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sql.end();
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrateClientData()
    .then(() => {
      console.log('🎉 Migration script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Migration script failed:', error);
      process.exit(1);
    });
}

export { migrateClientData }; 