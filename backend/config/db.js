/**
 * Database Configuration
 * ---------------------
 * Establishes a MongoDB connection via Mongoose with:
 *  - Automatic retry on initial connection failure (up to 5 attempts)
 *  - Exponential back-off between retries
 *  - Graceful shutdown hooks for SIGINT / SIGTERM
 *  - Detailed connection-event logging
 */

import mongoose from 'mongoose';

// Maximum number of connection attempts before giving up
const MAX_RETRIES = 5;

// Base delay between retries in milliseconds (doubles each attempt)
const BASE_RETRY_DELAY_MS = 3000;

/**
 * Connect to MongoDB.
 * Reads the connection string from the MONGO_URI environment variable.
 * Retries up to MAX_RETRIES times with exponential back-off.
 */
const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('❌  MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  // ── Mongoose connection-event listeners (registered once) ──────────
  mongoose.connection.on('connected', () => {
    console.log('✅  Mongoose connected to MongoDB');
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌  Mongoose connection error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('⚠️   Mongoose disconnected from MongoDB');
  });

  // ── Retry loop ─────────────────────────────────────────────────────
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const conn = await mongoose.connect(mongoUri, {
        // Mongoose 8 uses the Node driver defaults; explicit options kept
        // here for clarity / future-proofing.
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
      });

      console.log(
        `🗄️   MongoDB connected: ${conn.connection.host} (db: ${conn.connection.name})`
      );
      return conn; // success – exit the function
    } catch (error) {
      console.error(
        `❌  MongoDB connection attempt ${attempt}/${MAX_RETRIES} failed: ${error.message}`
      );

      if (attempt === MAX_RETRIES) {
        console.error('💀  All connection attempts exhausted – shutting down.');
        process.exit(1);
      }

      // Exponential back-off: 3 s → 6 s → 12 s → 24 s → …
      const delay = BASE_RETRY_DELAY_MS * Math.pow(2, attempt - 1);
      console.log(`⏳  Retrying in ${delay / 1000}s …`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
};

// ── Graceful shutdown ──────────────────────────────────────────────────
const shutdown = async (signal) => {
  console.log(`\n🛑  ${signal} received – closing MongoDB connection …`);
  await mongoose.connection.close();
  console.log('👋  MongoDB connection closed. Goodbye!');
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

export default connectDB;
