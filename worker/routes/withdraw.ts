import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

app.get('/', async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');

  const history = await db.select()
    .from(schema.withdrawals)
    .where(eq(schema.withdrawals.userId, userId))
    .orderBy(desc(schema.withdrawals.createdAt));

  return c.json(history);
});

app.post('/', zValidator('json', z.object({
  address: z.string().min(42).max(42).regex(/^0x[a-fA-F0-9]{40}$/, "Invalid BEP20 address"),
  amountPts: z.number().min(100, "Minimum withdrawal is 100 PTS")
})), async (c) => {
  const userId = c.get('userId');
  const db = c.get('db');
  const { address, amountPts } = c.req.valid('json');

  const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  
  if (!user || user.credits < amountPts) {
    return c.json({ error: 'Insufficient PTS balance' }, 400);
  }

  // Calculate USDT equivalent (100 PTS = 1 USDT)
  const amountUsdt = amountPts / 100;

  // Deduct PTS and create withdrawal record
  await db.batch([
    db.update(schema.users).set({ credits: user.credits - amountPts }).where(eq(schema.users.id, userId)),
    db.insert(schema.withdrawals).values({
      userId,
      amountPts,
      amountUsdt,
      address,
      status: 'pending'
    })
  ] as any);

  return c.json({ success: true, message: 'Withdrawal request submitted successfully' });
});

export default app;
