import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

/**
 * Connect to MongoDB database
 * Falls back to an embedded in-memory MongoDB instance if MONGODB_URI is not provided
 * or if local MongoDB is not running, ensuring effortless zero-config development & testing.
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  try {
    if (uri && uri.trim() !== '') {
      console.log(`📡 Connecting to MongoDB at: ${uri.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@')}`);
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
      });
      console.log(`✅ MongoDB Connected successfully: ${conn.connection.host}`);
      return;
    }
  } catch (error) {
    console.warn(`⚠️ Could not connect to configured MONGODB_URI (${error.message}). Falling back to In-Memory MongoDB...`);
  }

  // Fallback to MongoMemoryServer for instant local zero-config operation
  try {
    console.log('📦 Starting In-Memory MongoDB server for instant zero-config testing...');
    mongoMemoryServer = await MongoMemoryServer.create({
      binary: {
        version: '4.4.29',
      },
    });
    const memoryUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(memoryUri);
    console.log(`✅ In-Memory MongoDB Connected successfully: ${memoryUri}`);
    console.log('📌 Tip: Provide MONGODB_URI in server/.env to persist data across server restarts.');
  } catch (memErr) {
    console.error(`❌ Critical: Failed to initialize In-Memory MongoDB: ${memErr.message}`);
    process.exit(1);
  }
};

/**
 * Gracefully disconnect from database and stop memory server
 */
export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    console.log('🛑 MongoDB disconnected cleanly.');
  } catch (err) {
    console.error('Error during database disconnection:', err);
  }
};
