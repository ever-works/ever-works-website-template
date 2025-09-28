import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    // Read the OpenAPI spec file from the public directory
    const filePath = join(process.cwd(), 'public', 'openapi.json');
    const fileContents = readFileSync(filePath, 'utf8');
    const openApiSpec = JSON.parse(fileContents);

    // Set appropriate headers for JSON response
    return NextResponse.json(openApiSpec, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving OpenAPI spec:', error);
    return NextResponse.json(
      { error: 'Failed to load API specification' },
      { status: 500 }
    );
  }
}
