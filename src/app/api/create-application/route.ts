import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import db from '@/utils/mongodb';

export async function POST(request: Request) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user details
    const user = await currentUser();
    
    // Parse request body
    const { appName, appType, awsId, awsSecret, awsRegion } = await request.json();

    // Validate required fields
    if (!appName || !appType) {
      return NextResponse.json(
        { error: 'Application name and type are required' },
        { status: 400 }
      );
    }

    // Ensure MongoDB connection
    await db.connect();

    try {
      // Create database using user's username
      const dbName = user?.firstName as string;
      const userDb = mongoose.connection.useDb(dbName);

      // Store application metadata in _config collection
      const configCollection = userDb.collection(appName);
      await configCollection.insertOne({
        appName,
        type: appType,
        ...(appType === 'aws-connect' && {
          awsId,
          awsSecret,
          awsRegion,
        }),
        createdAt: new Date(),
      });

      // if (appType === 'csv') {
      //   // Create a collection with the application name for CSV data
      //   const dataCollection = userDb.collection(appName);
      //   await dataCollection.insertOne({
      //     createdAt: new Date(),
      //     status: 'ready_for_data'
      //   });
      // }

      return NextResponse.json({
        success: true,
        message: `Created database '${dbName}' with collection '${appName}'`
      });
    } catch (dbError) {
      console.error('MongoDB operation error:', dbError);
      return NextResponse.json(
        { error: 'Failed to create database or collection' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Application creation error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}