import mongoose from 'mongoose';
import { config } from './config';

/**
 * Connect to MongoDB database
 * If connection fails, log warning but continue (allows testing without MongoDB)
 */
export async function connectDatabase(): Promise<void> {
  try {
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000, // Fail fast
    });
    console.log('✓ Connected to MongoDB');

    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
  } catch (error) {
    console.error('⚠ Failed to connect to MongoDB:', (error as Error).message);
    console.log('⚠ Continuing without MongoDB - caching will be limited');
    console.log('\nTo fix:');
    console.log('1. Update MONGODB_URI in backend/.env with your complete MongoDB Atlas password');
    console.log('2. Whitelist your IP in MongoDB Atlas Network Access');
    console.log('3. Wait 2-3 minutes after whitelisting, then restart the server\n');
  }
}

/**
 * Disconnect from MongoDB database
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log('Disconnected from MongoDB');
    }
  } catch (error) {
    console.error('Error disconnecting from MongoDB:', error);
  }
}

export default { connectDatabase, disconnectDatabase };
