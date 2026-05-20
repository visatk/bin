import type { Context, Next } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import type { Bindings, Variables } from '../types';

export const injectDb = async (c: Context<{ Bindings: Bindings, Variables: Variables }>, next: Next) => {
  if (!c.get('db')) {
    const db = drizzle(c.env.DB);
    c.set('db', db);
  }
  await next();
};
