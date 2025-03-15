import { NextResponse } from 'next/server';
import { File } from '@/models/File';
import mongoose from 'mongoose';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 500 }
      );
    }

    const file = await File.findById(params.id);
    if (!file) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Convert buffer to string for CSV content
    const csvContent = file.content.toString('utf-8');
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', `attachment; filename="${file.name}"`);

    return new NextResponse(csvContent, { headers });
  } catch (error) {
    console.error('Error fetching file:', error);
    return NextResponse.json(
      { error: 'Failed to fetch file' },
      { status: 500 }
    );
  }
}