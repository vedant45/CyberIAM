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
      return NextResponse.json({ status: 'connected' });
    }

    await mongoose.connect(process.env.MONGODB_URI);
    return NextResponse.json({ status: 'connected' });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to connect' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
}