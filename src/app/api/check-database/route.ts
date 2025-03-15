import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import db from '@/utils/mongodb';

export async function GET() {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Get user database status
    const hasDatabase = await db.checkUserDatabase(userId);
    
    return NextResponse.json({ hasDatabase });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json(
      { error: 'Failed to check database status' },
      { status: 500 }
    );
  }
}