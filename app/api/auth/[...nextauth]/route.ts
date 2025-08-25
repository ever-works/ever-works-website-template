import { NextRequest } from 'next/server';
import { handleWithErrorHandling } from './error-wrapper';

// Force Node.js runtime to avoid Edge Runtime database/crypto issues
export const runtime = 'nodejs';

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
