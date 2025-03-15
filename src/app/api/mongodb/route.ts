import { NextResponse } from 'next/server';
import mongoose from 'mongoose';

export async function POST() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { error: 'MONGODB_URI is not defined' },
        { status: 500 }
      );
    }

    if (mongoose.connection.readyState === 1) {
      // If already connected, check if it's the correct database
      if (mongoose.connection.db.databaseName !== 'default') {
        await mongoose.disconnect();
        await mongoose.connect(process.env.MONGODB_URI, {
          dbName: 'default'
        });
      }
      return NextResponse.json({ status: 'connected' });
    }

    // Initial connection
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: 'default'
    });
    return NextResponse.json({ status: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    if (mongoose.connection.readyState !== 1) {
      return NextResponse.json(
        { error: 'Database not connected' },
        { status: 500 }
      );
    }

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
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch files' },
      { status: 500 }
    );
  }
}