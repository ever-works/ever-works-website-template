import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('API: Starting dashboard request');
    
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    console.log('API: Parsed search params');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('API: About to build dashboard data');
    
    const { db } = await import('@/lib/db/drizzle');
    const { clientProfiles, accounts, users, userRoles, roles } = await import('@/lib/db/schema');
    const { eq, desc, sql } = await import('drizzle-orm');
    
    // Shared filter: exclude admins (treat null as non-admin)
    const excludeAdmins = sql`COALESCE(${roles.isAdmin}, false) = false`;
    
    // Total count for pagination
    const totalResult = await db
      .select({ count: sql<number>`count(distinct ${clientProfiles.id})` })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(excludeAdmins);
    const total = Number(totalResult[0]?.count || 0);
    
    const profiles = await db
      .select({
        id: clientProfiles.id,
        name: clientProfiles.name,
        status: clientProfiles.status,
        plan: clientProfiles.plan,
        accountType: clientProfiles.accountType,
        email: sql<string>`COALESCE(${clientProfiles.email}, ${users.email})`.as('email'),
        accountProvider: sql<string>`COALESCE(${accounts.provider}, CASE WHEN ${users.passwordHash} IS NOT NULL THEN 'credentials' ELSE 'unknown' END)`
          .as('accountProvider'),
      })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
      .where(excludeAdmins)
      .orderBy(desc(clientProfiles.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);
    
    // Stats: overview by status
    const statusRows = await db
      .select({ status: clientProfiles.status, count: sql<number>`count(*)` })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(excludeAdmins)
      .groupBy(clientProfiles.status);
    const byStatus: Record<string, number> = { active: 0, inactive: 0, suspended: 0, trial: 0 };
    statusRows.forEach((r: any) => { byStatus[(r.status || 'inactive') as string] = Number(r.count || 0); });
    
    // Stats: by plan
    const planRows = await db
      .select({ plan: clientProfiles.plan, count: sql<number>`count(*)` })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(excludeAdmins)
      .groupBy(clientProfiles.plan);
    const byPlan: Record<string, number> = { free: 0, standard: 0, premium: 0 };
    planRows.forEach((r: any) => { byPlan[(r.plan || 'free') as string] = Number(r.count || 0); });
    
    // Stats: by account type
    const typeRows = await db
      .select({ type: clientProfiles.accountType, count: sql<number>`count(*)` })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .where(excludeAdmins)
      .groupBy(clientProfiles.accountType);
    const byAccountType: Record<string, number> = { individual: 0, business: 0, enterprise: 0 };
    typeRows.forEach((r: any) => { byAccountType[(r.type || 'individual') as string] = Number(r.count || 0); });
    
    // Stats: by provider (credentials/oauth)
    const providerRows = await db
      .select({ provider: accounts.provider, count: sql<number>`count(distinct ${clientProfiles.id})` })
      .from(clientProfiles)
      .leftJoin(users, eq(clientProfiles.userId, users.id))
      .leftJoin(userRoles, eq(userRoles.userId, users.id))
      .leftJoin(roles, eq(userRoles.roleId, roles.id))
      .leftJoin(accounts, eq(clientProfiles.userId, accounts.userId))
      .where(excludeAdmins)
      .groupBy(accounts.provider);
    const byProvider = { credentials: 0, google: 0, github: 0, facebook: 0, twitter: 0, linkedin: 0, other: 0 } as Record<string, number>;
    providerRows.forEach((r: any) => {
      const key = (r.provider || 'other') as string;
      if (key in byProvider) byProvider[key] += Number(r.count || 0);
      else byProvider.other += Number(r.count || 0);
    });
    
    const result = {
      clients: profiles,
      stats: {
        overview: { total, active: byStatus.active, inactive: byStatus.inactive, suspended: byStatus.suspended, trial: byStatus.trial },
        byProvider,
        byPlan,
        byAccountType,
        byStatus,
        activity: { newThisWeek: 0, newThisMonth: 0, activeThisWeek: 0, activeThisMonth: 0 },
        growth: { weeklyGrowth: 0, monthlyGrowth: 0 }
      },
      pagination: {
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        total,
        limit
      }
    };
    
    console.log('API: Simple query completed successfully');

    return NextResponse.json({
      success: true,
      data: {
        clients: result.clients,
        stats: result.stats,
        pagination: result.pagination
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
