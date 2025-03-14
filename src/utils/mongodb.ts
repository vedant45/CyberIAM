import mongoose from 'mongoose';

// Connection state type
type ConnectionState = {
  isConnected: boolean;
};

const connection: ConnectionState = {
  isConnected: false,
};

async function connect() {
  if (connection.isConnected) {
    return;
  }

  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState === 1;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

async function disconnect() {
  if (!connection.isConnected) {
    return;
  }

  if (process.env.NODE_ENV === 'production') {
    await mongoose.disconnect();
    connection.isConnected = false;
  }
}

const db = { connect, disconnect };
export default db;