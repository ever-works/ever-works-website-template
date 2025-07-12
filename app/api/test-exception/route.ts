import { NextRequest, NextResponse } from 'next/server';
import { analytics } from '@/lib/analytics';

export async function GET(request: NextRequest) {
  try {
    // Simulate different types of errors based on query parameter
    const { searchParams } = new URL(request.url);
    const errorType = searchParams.get('type') || 'generic';

    switch (errorType) {
      case 'syntax':
        // This will throw a SyntaxError
        JSON.parse('invalid json');
        break;
      
      case 'reference':
        // This will throw a ReferenceError
        // @ts-ignore
        nonExistentFunction();
        break;
      
      case 'custom':
        throw new Error('This is a custom error for testing');
      
      case 'async':
        await Promise.reject(new Error('Async rejection test'));
        break;
      
      default:
        throw new Error('Generic test error');
    }
  } catch (error) {
    // Capture the exception with context
    analytics.captureException(error as Error, {
      endpoint: '/api/test-exception',
      method: 'GET',
      errorType: request.nextUrl.searchParams.get('type'),
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json(
      { 
        error: 'An error occurred and has been reported',
        provider: analytics.getExceptionTrackingProvider(),
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: 'No error occurred' });
} 