#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { accounts, clientProfiles, users } from '../lib/db/schema';
import { eq, and, isNotNull, sql } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sqlClient = postgres(connectionString);
const db = drizzle(sqlClient);

async function verifyClientMigration() {
  console.log('🔍 Verifying client data migration status...');
  
  try {
    // Step 1: Check if client_profiles table exists
    console.log('📋 Checking client_profiles table...');
    
    const tableExists = await db
      .select({ exists: sql`1` })
      .from(sql`information_schema.tables`)
      .where(sql`table_name = 'client_profiles'`);

    if (tableExists.length === 0) {
      console.log('❌ client_profiles table does not exist');
      console.log('💡 Run the migration script first: yarn tsx scripts/migrate-client-data.ts');
      return;
    }

    console.log('✅ client_profiles table exists');

    // Step 2: Count records in both tables
    console.log('📊 Counting records...');
    
    const [accountsCount, profilesCount, usersCount] = await Promise.all([
      db.select({ count: sql`count(*)` }).from(accounts),
      db.select({ count: sql`count(*)` }).from(clientProfiles),
      db.select({ count: sql`count(*)` }).from(users),
    ]);

    console.log(`📈 Accounts table: ${accountsCount[0].count} records`);
    console.log(`📈 Client profiles table: ${profilesCount[0].count} records`);
    console.log(`📈 Users table: ${usersCount[0].count} records`);

    // Step 3: Check for manual accounts (should be migrated)
    console.log('🔍 Checking for manual accounts...');
    
    const manualAccounts = await db
      .select({
        userId: accounts.userId,
        provider: accounts.provider,
        username: accounts.username,
      })
      .from(accounts)
      .where(
        and(
          eq(accounts.provider, 'manual'),
          isNotNull(accounts.username)
        )
      );

    console.log(`📊 Found ${manualAccounts.length} manual accounts with client data`);

    // Step 4: Check for migrated profiles
    console.log('🔍 Checking migrated client profiles...');
    
    const migratedProfiles = await db
      .select({
        id: clientProfiles.id,
        userId: clientProfiles.userId,
        username: clientProfiles.username,
        displayName: clientProfiles.displayName,
        status: clientProfiles.status,
        plan: clientProfiles.plan,
      })
      .from(clientProfiles)
      .limit(10);

    console.log(`📊 Found ${migratedProfiles.length} migrated profiles (showing first 10):`);
    migratedProfiles.forEach(profile => {
      console.log(`   - ${profile.id}: ${profile.username} (${profile.displayName}) - ${profile.status}/${profile.plan}`);
    });

    // Step 5: Check for orphaned profiles (profiles without users)
    console.log('🔍 Checking for orphaned profiles...');
    
    const orphanedProfiles = await db
      .select({ count: sql`count(*)` })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .where(sql`users.id IS NULL`);

    console.log(`📊 Orphaned profiles: ${orphanedProfiles[0].count}`);

    // Step 6: Check for duplicate usernames
    console.log('🔍 Checking for duplicate usernames...');
    
    const duplicateUsernames = await db
      .select({ 
        username: clientProfiles.username,
        count: sql`count(*)`
      })
      .from(clientProfiles)
      .where(isNotNull(clientProfiles.username))
      .groupBy(clientProfiles.username)
      .having(sql`count(*) > 1`);

    console.log(`📊 Duplicate usernames: ${duplicateUsernames.length}`);

    // Step 7: Summary
    console.log('\n📋 Migration Status Summary:');
    console.log(`   ✅ client_profiles table exists`);
    console.log(`   📊 Total client profiles: ${profilesCount[0].count}`);
    console.log(`   📊 Manual accounts remaining: ${manualAccounts.length}`);
    console.log(`   📊 Orphaned profiles: ${orphanedProfiles[0].count}`);
    console.log(`   📊 Duplicate usernames: ${duplicateUsernames.length}`);

    if (manualAccounts.length === 0 && profilesCount[0].count > 0) {
      console.log('\n🎉 Migration appears to be complete!');
      console.log('✅ All manual accounts have been migrated to client_profiles');
    } else if (manualAccounts.length > 0) {
      console.log('\n⚠️  Migration incomplete');
      console.log(`❌ ${manualAccounts.length} manual accounts still need to be migrated`);
      console.log('💡 Run: yarn tsx scripts/migrate-client-data.ts');
    } else if (profilesCount[0].count === 0) {
      console.log('\n📝 No client profiles found');
      console.log('💡 Either no data was migrated or no client data exists');
    }

    if (orphanedProfiles[0].count > 0) {
      console.log('\n⚠️  Warning: Found orphaned profiles');
      console.log('💡 Some client profiles reference non-existent users');
    }

    if (duplicateUsernames.length > 0) {
      console.log('\n⚠️  Warning: Found duplicate usernames');
      console.log('💡 Username conflicts need to be resolved');
    }

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await sqlClient.end();
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyClientMigration()
    .then(() => {
      console.log('🎉 Verification script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Verification script failed:', error);
      process.exit(1);
    });
}

export { verifyClientMigration }; 