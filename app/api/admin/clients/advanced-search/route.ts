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
    
    // Basic parameters
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || undefined;
    const status = searchParams.get('status') || undefined;
    const plan = searchParams.get('plan') || undefined;
    const accountType = searchParams.get('accountType') || undefined;
    const provider = searchParams.get('provider') || undefined;
    
    // Advanced parameters
    const sortBy = searchParams.get('sortBy') as 'createdAt' | 'updatedAt' | 'name' | 'email' | 'company' | 'totalSubmissions' | undefined;
    const sortOrder = searchParams.get('sortOrder') as 'asc' | 'desc' | undefined;
    
    // Date parameters
    const createdAfter = searchParams.get('createdAfter') ? new Date(searchParams.get('createdAfter')!) : undefined;
    const createdBefore = searchParams.get('createdBefore') ? new Date(searchParams.get('createdBefore')!) : undefined;
    const updatedAfter = searchParams.get('updatedAfter') ? new Date(searchParams.get('updatedAfter')!) : undefined;
    const updatedBefore = searchParams.get('updatedBefore') ? new Date(searchParams.get('updatedBefore')!) : undefined;
    
    // Field-specific searches
    const emailDomain = searchParams.get('emailDomain') || undefined;
    const companySearch = searchParams.get('companySearch') || undefined;
    const locationSearch = searchParams.get('locationSearch') || undefined;
    const industrySearch = searchParams.get('industrySearch') || undefined;
    
    // Numeric filters
    const minSubmissions = searchParams.get('minSubmissions') ? parseInt(searchParams.get('minSubmissions')!) : undefined;
    const maxSubmissions = searchParams.get('maxSubmissions') ? parseInt(searchParams.get('maxSubmissions')!) : undefined;
    
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
