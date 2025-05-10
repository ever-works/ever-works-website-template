import { NextRequest } from 'next/server';
import { handleWithErrorHandling } from './error-wrapper';

/**
 * GET handler with error handling
 */
export async function GET(req: NextRequest) {
  return handleWithErrorHandling(req, 'GET');
}

/**
 * POST handler with error handling
 */
export async function POST(req: NextRequest) {
  return handleWithErrorHandling(req, 'POST');
}
