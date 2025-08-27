import { auth } from "@/lib/auth";
import { getOrCreateLemonsqueezyProvider } from "@/lib/payment/config/payment-provider-manager";
import { statuses } from "@/lib/payment/lib/providers/lemonsqueezy-provider";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

/**
 * Validation schema for query parameters
 */
const queryParamsSchema = z.object({
  status: z.enum(statuses).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
  page: z.coerce.number().min(1).default(1),
  customerEmail: z.string().email().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  storeId: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // 1. Authentication check
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }, 
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const queryParams = Object.fromEntries(searchParams.entries());
    
    const validationResult = queryParamsSchema.safeParse(queryParams);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validationResult.error.issues,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { 
      status, 
      limit, 
      page, 
      customerEmail, 
      dateFrom, 
      dateTo, 
      storeId 
    } = validationResult.data;

    const validationErrors: string[] = [];

    if (dateFrom && dateTo) {
      const fromDate = new Date(dateFrom);
      const toDate = new Date(dateTo);
      
      if (fromDate > toDate) {
        validationErrors.push('dateFrom cannot be after dateTo');
      }
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: validationErrors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    // 4. Initialize LemonSqueezy provider
    const lemonsqueezy = getOrCreateLemonsqueezyProvider();

    const filterOptions = {
      status,
      limit,
      page,
      customerEmail: customerEmail || session.user.email, 
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      storeId,
    };

    const result = await lemonsqueezy.listCheckouts(filterOptions);

    const response = {
      success: true,
      data: result.checkouts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
        totalPages: Math.ceil(result.total / result.limit),
        currentPage: result.page,
      },
      filters: {
        status: status || 'all',
        customerEmail: customerEmail || session.user.email,
        dateRange: dateFrom && dateTo 
          ? `${dateFrom} to ${dateTo}`
          : 'all',
        appliedFilters: Object.keys(filterOptions).filter(key => 
          filterOptions[key as keyof typeof filterOptions] !== undefined
        ),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        userId: session.user.id,
        userEmail: session.user.email,
        environment: process.env.NODE_ENV,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300', // 5 minutes cache
        'X-Request-ID': response.metadata.requestId,
      }
    });

  } catch (error) {
    console.error('LemonSqueezy API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    });

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    const isNetworkError = errorMessage.includes('fetch') || errorMessage.includes('network');
    const isAuthError = errorMessage.includes('unauthorized') || errorMessage.includes('forbidden');
    
    const statusCode = isAuthError ? 401 : isNetworkError ? 503 : 500;
    const errorCode = isAuthError ? 'AUTH_ERROR' : isNetworkError ? 'SERVICE_UNAVAILABLE' : 'INTERNAL_ERROR';

    return NextResponse.json(
      { 
        error: 'Failed to fetch LemonSqueezy checkouts',
        message: errorMessage,
        code: errorCode,
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
      { 
        status: statusCode,
        headers: isNetworkError ? {
          'Retry-After': '30'
        } : undefined
      }
    );
  }
}


export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { 
          error: 'Unauthorized',
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }, 
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { 
          error: 'Invalid request body',
          message: 'Request body must be a valid JSON object',
          code: 'INVALID_BODY'
        },
        { status: 400 }
      );
    }

    const validationResult = queryParamsSchema.safeParse(body);
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters',
          details: validationResult.error.issues,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      );
    }

    const { 
      status, 
      limit, 
      page, 
      customerEmail, 
      dateFrom, 
      dateTo, 
      storeId 
    } = validationResult.data;

    if (customerEmail && customerEmail !== session.user.email) {
      const isAdmin = session.user.isAdmin;
      
      if (!isAdmin) {
        return NextResponse.json(
          { 
            error: 'Forbidden',
            message: 'You can only view your own checkouts',
            code: 'ACCESS_DENIED'
          },
          { status: 403 }
        );
      }
    }

    // 4. Initialize provider and fetch data
    const lemonsqueezy = getOrCreateLemonsqueezyProvider();

    const filterOptions = {
      status,
      limit,
      page,
      customerEmail: customerEmail || session.user.email,
      dateFrom: dateFrom ? new Date(dateFrom) : undefined,
      dateTo: dateTo ? new Date(dateTo) : undefined,
      storeId,
    };

    const result = await lemonsqueezy.listCheckouts(filterOptions);

    // 5. Prepare response
    const response = {
      success: true,
      data: result.checkouts,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        hasMore: result.hasMore,
        totalPages: Math.ceil(result.total / result.limit),
        currentPage: result.page,
      },
      filters: {
        status: status || 'all',
        customerEmail: customerEmail || session.user.email,
        dateRange: dateFrom && dateTo 
          ? `${dateFrom} to ${dateTo}`
          : 'all',
        appliedFilters: Object.keys(filterOptions).filter(key => 
          filterOptions[key as keyof typeof filterOptions] !== undefined
        ),
      },
      metadata: {
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
        userId: session.user.id,
        userEmail: session.user.email,
        method: 'POST',
        environment: process.env.NODE_ENV,
        version: '1.0.0',
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Cache-Control': 'private, max-age=300',
        'X-Request-ID': response.metadata.requestId,
      }
    });

  } catch (error) {
    console.error('LemonSqueezy POST API error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
    });

    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch LemonSqueezy checkouts',
        message: errorMessage,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
        requestId: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}