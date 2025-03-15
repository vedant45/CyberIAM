import mongoose from 'mongoose';

// Connection state type
type ConnectionState = {
  isConnected: boolean;
  error: string | null;
  isInitialized: boolean;
};

const connection: ConnectionState = {
  isConnected: false,
  error: null,
  isInitialized: false
};

async function connect() {
  // If already connected, return the current state
  if (connection.isConnected) {
    return { success: true, error: null };
  }

  // If not initialized, set it now
  connection.isInitialized = true;

  if (!process.env.MONGODB_URI) {
    connection.error = 'MONGODB_URI is not defined in environment variables';
    return { success: false, error: connection.error };
  }

  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    connection.isConnected = db.connections[0].readyState === 1;
    connection.error = null;
    return { success: true, error: null };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to connect to MongoDB';
    connection.error = errorMessage;
    connection.isConnected = false;
    return { success: false, error: errorMessage };
  }
}

async function disconnect() {
  if (!connection.isConnected) {
    return { success: true };
  }

  try {
    if (process.env.NODE_ENV === 'production') {
      await mongoose.disconnect();
      connection.isConnected = false;
      connection.error = null;
    }
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to disconnect from MongoDB';
    connection.error = errorMessage;
    return { success: false, error: errorMessage };
  }
}

function getConnectionState(): ConnectionState {
  return { ...connection };
}

async function checkUserDatabase(username: string) {
  try {
    if (!connection.isConnected) {
      await connect();
    }
    
    const adminDb = mongoose.connection.useDb('admin');
    const dbs = await adminDb.db.admin().listDatabases();
    return dbs.databases.some(db => db.name === username);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to check user database';
    connection.error = errorMessage;
    return false;
  }
}

const db = { connect, disconnect, getConnectionState, checkUserDatabase };
export default db;