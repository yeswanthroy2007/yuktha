/**
 * MongoDB Connection
 * Handles connection pooling and reuse
 */

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Extend global namespace to avoid multiple connections in development
declare global {
  var mongoosePromise: Promise<typeof mongoose>;
}

let cached = global.mongoosePromise;

if (!cached) {
  cached = global.mongoosePromise = mongoose.connect(MONGODB_URI, {
    bufferCommands: false,
  });
}

export default cached;
