#!/usr/bin/env tsx

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { clientProfiles } from '../lib/db/schema';
import { sql } from 'drizzle-orm';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL environment variable is required');
  process.exit(1);
}

const sqlClient = postgres(connectionString);
const db = drizzle(sqlClient);

async function rollbackClientMigration() {
  console.log('🔄 Starting client migration rollback...');
  
  try {
    // Step 1: Check if client_profiles table exists and has data
    console.log('📋 Checking client_profiles table...');
    
    const tableExists = await db
      .select({ exists: sql`1` })
      .from(sql`information_schema.tables`)
      .where(sql`table_name = 'client_profiles'`);

    if (tableExists.length === 0) {
      console.log('✅ client_profiles table does not exist - nothing to rollback');
      return;
    }

    // Step 2: Count records in client_profiles
    const profileCount = await db
      .select({ count: sql`count(*)` })
      .from(clientProfiles);

    console.log(`📊 Found ${profileCount[0].count} client profiles to rollback`);

    if (profileCount[0].count === 0) {
      console.log('✅ No client profiles to rollback');
      return;
    }

    // Step 3: Confirm rollback
    console.log('⚠️  WARNING: This will delete all client profiles data!');
    console.log('⚠️  Make sure you have a backup before proceeding.');
    
    // In a real scenario, you might want to add a confirmation prompt here
    // For now, we'll proceed with the rollback

    // Step 4: Delete all client profiles
    console.log('🗑️  Deleting client profiles...');
    
    const deleteResult = await db.delete(clientProfiles);
    
    console.log(`✅ Successfully deleted ${deleteResult.length} client profiles`);

    // Step 5: Verify rollback
    console.log('🔍 Verifying rollback...');
    
    const remainingCount = await db
      .select({ count: sql`count(*)` })
      .from(clientProfiles);

    console.log(`📊 Remaining client profiles: ${remainingCount[0].count}`);

    if (remainingCount[0].count === 0) {
      console.log('✅ Rollback completed successfully!');
      console.log('📋 All client profiles have been removed.');
    } else {
      console.log('❌ Rollback incomplete - some profiles remain');
    }

  } catch (error) {
    console.error('❌ Rollback failed:', error);
    process.exit(1);
  } finally {
    await sqlClient.end();
  }
}

// Run rollback if this script is executed directly
if (require.main === module) {
  rollbackClientMigration()
    .then(() => {
      console.log('🎉 Rollback script completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Rollback script failed:', error);
      process.exit(1);
    });
}

export { rollbackClientMigration }; 