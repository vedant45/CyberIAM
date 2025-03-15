import { NextResponse } from 'next/server';
import db from '@/utils/mongodb';

export async function POST() {
  const { success, error } = await db.connect();

  if (!success) {
    return NextResponse.json(
      {
        status: 'disconnected',
        error,
        data: []
      },
      { status: 200 }  // Use 200 to avoid error logging
    );
  }

  return NextResponse.json({
    status: 'connected',
    data: []
  });
}

export async function GET() {
  const state = db.getConnectionState();

  if (!state.isInitialized) {
    // First time checking connection
    const { success, error } = await db.connect();
    if (!success) {
      return NextResponse.json({
        status: 'disconnected',
        error,
        data: []
      }, { status: 200 });
    }
  }

  if (!state.isConnected) {
    return NextResponse.json({
      status: 'disconnected',
      error: state.error,
      data: []
    }, { status: 200 });
  }

  try {
    const { File } = await import('@/models/File');
    const files = await File.find({}, {
      name: 1,
      uploadDate: 1,
      size: 1,
      _id: 1
    }).sort({ uploadDate: -1 });

    const filesWithUrl = files.map((file, index) => ({
      _id: file._id,
      number: index + 1,
      name: file.name,
      uploadDate: file.uploadDate,
      size: file.size,
      url: `/api/files/${file._id}`
    }));

    return NextResponse.json({
      status: 'connected',
      data: filesWithUrl
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json({
      status: 'connected',  // Keep connection status separate from operation status
      error: error instanceof Error ? error.message : 'Failed to fetch files',
      data: []  // Always include empty data array on error
    }, { status: 200 });
  }
}