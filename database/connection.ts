import { MongoClient, Db } from 'mongodb';
import { ENV } from '../types/env.js';

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  if (database) {
    return database;
  }

  try {
    client = new MongoClient(ENV.MONGO_URI);
    await client.connect();
    database = client.db('waitress');
    return database;
  } catch (error) {
    throw new Error(`Failed to connect to MongoDB: ${String(error)}`);
  }
}

export async function closeDatabaseConnection(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}

export function getDatabase(): Db {
  if (!database) {
    throw new Error('Database not connected. Call connectToDatabase() first.');
  }
  return database;
}
