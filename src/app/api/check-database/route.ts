import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import db from '@/utils/mongodb';

export async function GET() {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ hasDatabase: false });
    }

    // Get user details
    const user = await currentUser();
    const dbName = user?.username || userId;
    
    // Check if database exists
    const hasDatabase = await db.checkUserDatabase(dbName);
    
    return NextResponse.json({ hasDatabase });
  } catch (error) {
    console.error('Database check error:', error);
    return NextResponse.json({ hasDatabase: false });
  }
}