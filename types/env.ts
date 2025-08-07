import { z } from 'zod';
import 'dotenv/config';

const envSchema = z.object({
  TOKEN: z.string().min(1, { message: 'TOKEN must not be empty' }),
  CLIENT_ID: z.string().min(1, { message: 'CLIENT_ID must not be empty' }),
  GUILD_ID: z.string().min(1, { message: 'GUILD_ID must not be empty' }),
  MONGO_URI: z.string().min(1, { message: 'MONGO_URI must not be empty' }),
});

type Env = z.infer<typeof envSchema>;

export const ENV: Env = envSchema.parse(process.env);
