import { z } from 'zod';
import { Collection, ObjectId } from 'mongodb';
import { getDatabase } from './connection.js';

export const UserDataSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  userId: z.string(),
  currency: z.number().default(0),
  lastDailyClaimDate: z.string().optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type UserData = z.infer<typeof UserDataSchema>;

export class UserDataModel {
  private collection: Collection<UserData>;

  constructor() {
    const db = getDatabase();
    this.collection = db.collection<UserData>('users');
  }

  async findByUserId(userId: string): Promise<UserData | null> {
    return await this.collection.findOne({ userId });
  }

  async createUser(userId: string): Promise<UserData> {
    const userData: Omit<UserData, '_id'> = {
      userId,
      currency: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(userData as UserData);
    return { ...userData, _id: result.insertedId } as UserData;
  }

  async updateUserCurrency(
    userId: string,
    amount: number
  ): Promise<UserData | null> {
    const result = await this.collection.findOneAndUpdate(
      { userId },
      {
        $inc: { currency: amount },
        $set: { updatedAt: new Date() },
      },
      { returnDocument: 'after' }
    );
    return result ?? null;
  }

  async setLastDailyClaimDate(
    userId: string,
    date: string
  ): Promise<UserData | null> {
    const result = await this.collection.findOneAndUpdate(
      { userId },
      {
        $set: {
          lastDailyClaimDate: date,
          updatedAt: new Date(),
        },
      },
      { returnDocument: 'after' }
    );
    return result ?? null;
  }

  async findOrCreateUser(userId: string): Promise<UserData> {
    const existingUser = await this.findByUserId(userId);
    if (existingUser) {
      return existingUser;
    }
    return await this.createUser(userId);
  }
}
