import { NextResponse } from 'next/server';
import db from '@/utils/mongodb';
import mongoose from 'mongoose';

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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dbName = searchParams.get('db');

  if (!dbName) {
    return NextResponse.json({
      status: 'error',
      error: 'Database name is required',
      data: []
    }, { status: 400 });
  }

  const state = db.getConnectionState();

  if (!state.isInitialized) {
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
    const userDb = mongoose.connection.useDb(dbName, { useCache: true });
    
    // Get all collections in the database
    const collections = await userDb.db.listCollections().toArray();
    
    // Fetch data from all collections
    const allFiles = [];
    for (const collection of collections) {
      const collectionData = await userDb.db.collection(collection.name).find({}, {
        projection: {
          name: 1,
          uploadDate: 1,
          size: 1,
          _id: 1
        }
      }).sort({ uploadDate: -1 }).toArray();
      
      allFiles.push(...collectionData);
    }

    // Sort all files by upload date
    allFiles.sort((a, b) => {
      return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
    });

    const filesWithUrl = allFiles
      .filter(file => file && typeof file === 'object' && file.name)
      .map((file, index) => ({
        _id: file._id?.toString(),
        number: index + 1,
        name: file.name,
        uploadDate: file.uploadDate || new Date().toISOString(),
        url: `/api/files/${file._id.toString()}`
      }));

    return NextResponse.json({
      status: 'connected',
      data: filesWithUrl
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching files:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch files';
    return NextResponse.json({
      status: 'error',
      error: `Error fetching data from database "${dbName}": ${errorMessage}`,
      data: []
    }, { status: 200 });
  }
}