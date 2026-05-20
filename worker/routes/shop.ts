import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();
app.use('*', injectDb);

app.get('/items', async (c) => {
  const db = c.get('db');
  // We exclude assetData from the public fetch to ensure zero-trust security
  const items = await db.select({
    id: schema.items.id, 
    title: schema.items.title, 
    category: schema.items.category, 
    date: schema.items.date, 
    soldCount: schema.items.soldCount, 
    priceCredits: schema.items.priceCredits, 
    badge: schema.items.badge, 
    isVipExclusive: schema.items.isVipExclusive,
  }).from(schema.items).orderBy(desc(schema.items.createdAt));
  
  return c.json(items);
});

app.post('/purchase/:id', requireAuth, async (c) => {
  const itemId = Number(c.req.param('id'));
  const userId = c.get('userId');
  const db = c.get('db');

  const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  const item = await db.select().from(schema.items).where(eq(schema.items.id, itemId)).get();

  if (!user || !item) return c.json({ error: 'Item or User not found' }, 404);
  
  if (item.isVipExclusive && !user.isVip) {
    return c.json({ error: 'VIP Exclusive. Upgrade to Elite Master to unlock.' }, 403);
  }
  
  // Calculate 15% discount for Lifetime VIP members
  const finalPrice = user.isVip ? Math.floor(item.priceCredits * 0.85) : item.priceCredits;
  
  if (user.credits < finalPrice) {
    return c.json({ error: `Insufficient credits. You need ${finalPrice} CR.` }, 400);
  }

  try {
    // Execute atomic transaction batching
    await db.batch([
      db.update(schema.users).set({ credits: user.credits - finalPrice }).where(eq(schema.users.id, userId)),
      db.update(schema.items).set({ soldCount: item.soldCount + 1 }).where(eq(schema.items.id, itemId)),
      db.insert(schema.purchases).values({ userId, itemId, pricePaid: finalPrice })
    ]);
    
    return c.json({ success: true, assetData: item.assetData, pricePaid: finalPrice });
  } catch (e) {
    return c.json({ error: 'Transaction failed. Please try again.' }, 500);
  }
});

export default app;
