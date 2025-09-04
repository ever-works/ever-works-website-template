import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { advancedClientSearch } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    
    // Basic parameters with validation
    const rawPage = Number(searchParams.get('page'));
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const rawLimit = Number(searchParams.get('limit'));
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.floor(rawLimit), 1), 100) : 10;
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const plan = searchParams.get('plan') || undefined;
    const accountType = searchParams.get('accountType') || undefined;
    const provider = searchParams.get('provider') || undefined;
    
    // Advanced parameters
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'name' | 'email' | 'company' | 'totalSubmissions' | undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;
    
    // Date parameters with validation
    const parseDate = (v: string | null) => {
      if (!v) return undefined;
      const d = new Date(v);
      return Number.isNaN(d.getTime()) ? undefined : d;
    };
    const createdAfter = parseDate(searchParams.get('createdAfter'));
    const createdBefore = parseDate(searchParams.get('createdBefore'));
    const updatedAfter = parseDate(searchParams.get('updatedAfter'));
    const updatedBefore = parseDate(searchParams.get('updatedBefore'));
    
    // Field-specific searches
    const emailDomain = searchParams.get('emailDomain') || undefined;
    const companySearch = searchParams.get('companySearch') || undefined;
    const locationSearch = searchParams.get('locationSearch') || undefined;
    const industrySearch = searchParams.get('industrySearch') || undefined;
    
    // Numeric filters with validation
    const parseIntSafe = (v: string | null) => {
      if (v == null) return undefined;
      const n = Number(v);
      return Number.isFinite(n) ? Math.floor(n) : undefined;
    };
    const minSubmissions = parseIntSafe(searchParams.get('minSubmissions'));
    const maxSubmissions = parseIntSafe(searchParams.get('maxSubmissions'));
    
    // Boolean filters
    const hasAvatar = searchParams.get('hasAvatar') ? searchParams.get('hasAvatar') === 'true' : undefined;
    const hasWebsite = searchParams.get('hasWebsite') ? searchParams.get('hasWebsite') === 'true' : undefined;
    const hasPhone = searchParams.get('hasPhone') ? searchParams.get('hasPhone') === 'true' : undefined;
    const emailVerified = searchParams.get('emailVerified') ? searchParams.get('emailVerified') === 'true' : undefined;
    const twoFactorEnabled = searchParams.get('twoFactorEnabled') ? searchParams.get('twoFactorEnabled') === 'true' : undefined;

    const result = await advancedClientSearch({
      page,
      limit,
      search,
      status,
      plan,
      accountType,
      provider,
      createdAfter,
      createdBefore,
      updatedAfter,
      updatedBefore,
      emailDomain,
      companySearch,
      locationSearch,
      industrySearch,
      minSubmissions,
      maxSubmissions,
      hasAvatar,
      hasWebsite,
      hasPhone,
      emailVerified,
      twoFactorEnabled,
      sortBy,
      sortOrder,
    });

    return NextResponse.json({
      success: true,
      data: {
        clients: result.clients,
        pagination: result.pagination,
        searchMetadata: result.searchMetadata
      }
    });
  } catch (error) {
    console.error('Error in advanced search:', error);
    return NextResponse.json(
      { error: 'Failed to perform advanced search' },
      { status: 500 }
    );
  }
}
