import mongoose from 'mongoose';

// Hardcode the database name to ensure we connect to the right one
const MONGODB_URI = process.env.MONGODB_URI;
const DB_NAME = 'club-competition'; // Force this database name

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB() {
  if (cached.conn) {
    console.log('Using cached connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: DB_NAME, // Force the database name
    };

    console.log('Connecting to MongoDB...');
    console.log('Target database:', DB_NAME);
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('MongoDB connected successfully to:', mongoose.connection.db.databaseName);
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export default connectDB;