import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { tagRepository } from '@/lib/repositories/tag.repository';
import { UpdateTagRequest } from '@/lib/types/tag';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tag = await tagRepository.findById(params.id);
    
    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, tag });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tag' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name }: UpdateTagRequest = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    const tag = await tagRepository.update(params.id, { id: params.id, name });
    
    return NextResponse.json({ success: true, tag });
  } catch (error) {
    console.error('Error updating tag:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { error: error.message },
          { status: 404 }
        );
      }
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
      { error: 'Failed to update tag' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await tagRepository.delete(params.id);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tag:', error);
    
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json(
        { error: error.message },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete tag' },
      { status: 500 }
    );
  }
} 