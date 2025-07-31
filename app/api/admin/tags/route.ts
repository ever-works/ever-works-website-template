import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tagRepository } from '@/lib/repositories/tag.repository';
import { CreateTagRequest } from '@/lib/types/tag';

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const result = await tagRepository.findAllPaginated(page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tags' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, name }: CreateTagRequest = body;

    if (!id || !name) {
      return NextResponse.json(
        { error: 'Tag ID and name are required' },
        { status: 400 }
      );
    }

    const tag = await tagRepository.create({ id, name });
    
    return NextResponse.json({ success: true, tag }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('already exists')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
      if (error.message.includes('required') || error.message.includes('must be')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to create tag' },
      { status: 500 }
    );
  }
} 