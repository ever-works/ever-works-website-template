import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { clientProfiles, accounts } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('Testing join query...');
    
    // Test the join that's failing
    const result = await db
      .select({
        id: clientProfiles.id,
        name: clientProfiles.name,
        status: clientProfiles.status,
        provider: accounts.provider,
      })
      .from(clientProfiles)
      .leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
      .limit(5);
    
    console.log('Join query result:', result);
    
    return NextResponse.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Join test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
