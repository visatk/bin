import { Hono } from 'hono';
import { eq, desc, count } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();
app.use('*', requireAuth, injectDb);

app.get('/dashboard', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');

  // FIX: Added 'isAdmin' to the select query to ensure layout renders correctly
  const user = await db.select({ 
    username: schema.users.username, 
    credits: schema.users.credits, 
    isVip: schema.users.isVip, 
    vipUntil: schema.users.vipUntil,
    isAdmin: schema.users.isAdmin 
  }).from(schema.users).where(eq(schema.users.id, userId)).get();
  
  const latestNews = await db.select().from(schema.announcements).orderBy(desc(schema.announcements.createdAt)).limit(3);

  return c.json({ user, latestNews });
});

app.get('/earn', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');

  const user = await db.select({ referralCode: schema.users.referralCode, referralEarnings: schema.users.referralEarnings }).from(schema.users).where(eq(schema.users.id, userId)).get();
  const referredUsers = await db.select({ count: count() }).from(schema.users).where(eq(schema.users.referredBy, userId));

  return c.json({ referralCode: user?.referralCode, totalReferrals: referredUsers[0].count, pointsEarned: user?.referralEarnings });
});

app.get('/purchases', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  const userPurchases = await db.select({
    id: schema.purchases.id,
    pricePaid: schema.purchases.pricePaid,
    purchasedAt: schema.purchases.purchasedAt,
    title: schema.items.title,
    category: schema.items.category,
    assetData: schema.items.assetData
  })
  .from(schema.purchases)
  .innerJoin(schema.items, eq(schema.purchases.itemId, schema.items.id))
  .where(eq(schema.purchases.userId, userId))
  .orderBy(desc(schema.purchases.purchasedAt));
  
  return c.json(userPurchases);
});

export default app;
