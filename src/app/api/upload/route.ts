import { NextResponse } from 'next/server';
import { File } from '@/models/File';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  try {
    // Check MongoDB connection and ensure correct database
    if (mongoose.connection.readyState !== 1 || 
        mongoose.connection.db.databaseName !== 'default') {
      if (!process.env.MONGODB_URI) {
        return NextResponse.json(
          { error: 'MongoDB connection string is not defined' },
          { status: 500 }
        );
      }
      // If connected to wrong database, disconnect first
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
      }
      await mongoose.connect(process.env.MONGODB_URI, {
        dbName: 'default'
      });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.includes('csv') && !file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: 'Only CSV files are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create file document in MongoDB 'Data' collection
    const newFile = await File.create({
      name: file.name,
      size: file.size,
      type: file.type || 'text/csv',
      content: buffer,
    });

    return NextResponse.json({
      message: 'File uploaded successfully',
      file: {
        id: newFile._id,
        name: newFile.name,
        size: newFile.size,
        type: newFile.type,
        uploadDate: newFile.uploadDate,
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}