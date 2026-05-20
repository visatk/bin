import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

app.use('*', injectDb);

const VIP_PRICE = 100;

app.post('/purchase', requireAuth, async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  
  if (!user) return c.json({ error: 'User not found' }, 404);
  if (user.isVip && user.vipUntil && user.vipUntil > new Date()) return c.json({ error: 'Already VIP' }, 400);
  if (user.credits < VIP_PRICE) return c.json({ error: 'Insufficient credits' }, 400);
  
  const vipUntil = new Date();
  vipUntil.setDate(vipUntil.getDate() + 30);
  
  await db.update(schema.users)
    .set({ credits: user.credits - VIP_PRICE, isVip: true, vipUntil })
    .where(eq(schema.users.id, userId));
    
  return c.json({ success: true, vipUntil });
});

export default app;
