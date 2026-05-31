import type { DrizzleD1Database } from 'drizzle-orm/d1';
import * as schema from './db/schema';

export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  APIRONE_DEST_BTC: string;
  APIRONE_DEST_LTC: string;
  APIRONE_DEST_TRX: string;
  DOMAIN: string;
};

export type Variables = {
  userId: number;
  isVip: boolean;
  db: DrizzleD1Database<typeof schema>;
};
