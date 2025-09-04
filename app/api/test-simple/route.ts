import { NextResponse } from 'next/server';
import { db } from '@/lib/db/drizzle';
import { clientProfiles, accounts } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    console.log('Testing simple dashboard query...');
    
    // Simple version of the dashboard query
    const profiles = await db
      .select({
        id: clientProfiles.id,
        name: clientProfiles.name,
        status: clientProfiles.status,
        plan: clientProfiles.plan,
        accountType: clientProfiles.accountType,
        accountProvider: accounts.provider || 'unknown',
      })
      .from(clientProfiles)
      .leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
      .orderBy(desc(clientProfiles.createdAt))
      .limit(10);
    
    console.log('Simple query result:', profiles);
    
    return NextResponse.json({
      success: true,
      data: {
        clients: profiles,
        stats: {
          overview: { total: profiles.length, active: 0, inactive: 0, suspended: 0, trial: 0 },
          byProvider: { credentials: 0, google: 0, github: 0, facebook: 0, twitter: 0, linkedin: 0, other: 0 },
          byPlan: { free: 0, standard: 0, premium: 0 },
          byAccountType: { individual: 0, business: 0, enterprise: 0 },
          byStatus: { active: 0, inactive: 0, suspended: 0, trial: 0 },
          activity: { newThisWeek: 0, newThisMonth: 0, activeThisWeek: 0, activeThisMonth: 0 },
          growth: { weeklyGrowth: 0, monthlyGrowth: 0 }
        },
        pagination: {
          page: 1,
          totalPages: 1,
          total: profiles.length,
          limit: 10
        }
      }
    });
  } catch (error) {
    console.error('Simple test error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
