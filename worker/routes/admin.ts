import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();
app.use('*', requireAuth, injectDb);

// Strict Role-Based Access Control (RBAC) Middleware
app.use('*', async (c, next) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const user = await db.select().from(schema.users).where(eq(schema.users.id, userId)).get();
  if (!user?.isAdmin) return c.json({ error: 'Forbidden. Command clearance required.' }, 403);
  await next();
});

// --- BIN (ASSET) MANAGEMENT ---
app.get('/bins', async (c) => {
  const db = c.get('db');
  const items = await db.select().from(schema.items).orderBy(desc(schema.items.createdAt));
  return c.json(items);
});

app.post('/bins', zValidator('json', z.object({
  title: z.string(), category: z.string(), priceCredits: z.number(), badge: z.string().optional(), isVipExclusive: z.boolean().default(false), assetData: z.string()
})), async (c) => {
  const data = c.req.valid('json');
  const db = c.get('db');
  await db.insert(schema.items).values({ ...data, date: new Date().toLocaleDateString('en-US') });
  return c.json({ success: true });
});

app.put('/bins/:id', zValidator('json', z.object({
  title: z.string(), category: z.string(), priceCredits: z.number(), badge: z.string().optional(), isVipExclusive: z.boolean().default(false), assetData: z.string()
})), async (c) => {
  const id = Number(c.req.param('id'));
  const data = c.req.valid('json');
  const db = c.get('db');
  await db.update(schema.items).set(data).where(eq(schema.items.id, id));
  return c.json({ success: true });
});

app.delete('/bins/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const db = c.get('db');
  try {
    await db.delete(schema.items).where(eq(schema.items.id, id));
    return c.json({ success: true });
  } catch (e) {
    return c.json({ error: 'Cannot delete asset. It likely has existing purchase records.' }, 400);
  }
});

// --- TOPUP MANAGEMENT ---
app.get('/topups', async (c) => {
  const db = c.get('db');
  const pending = await db.select({
    id: schema.cryptoInvoices.id, username: schema.users.username, currency: schema.cryptoInvoices.currency, txHash: schema.cryptoInvoices.txHash, creditsToAdd: schema.cryptoInvoices.creditsToAdd, createdAt: schema.cryptoInvoices.createdAt,
  }).from(schema.cryptoInvoices).leftJoin(schema.users, eq(schema.cryptoInvoices.userId, schema.users.id)).where(eq(schema.cryptoInvoices.status, 'pending')).orderBy(desc(schema.cryptoInvoices.createdAt));
  return c.json(pending);
});

app.post('/topups/:id/resolve', zValidator('json', z.object({ action: z.enum(['approve', 'reject']) })), async (c) => {
  const id = Number(c.req.param('id'));
  const { action } = c.req.valid('json');
  const db = c.get('db');
  
  const invoice = await db.select().from(schema.cryptoInvoices).where(eq(schema.cryptoInvoices.id, id)).get();
  if (!invoice || invoice.status !== 'pending') return c.json({ error: 'Invoice not found or already processed' }, 404);
  
  if (action === 'approve') {
    const user = await db.select().from(schema.users).where(eq(schema.users.id, invoice.userId)).get();
    if (user) {
      const updates: any[] = [
        db.update(schema.cryptoInvoices).set({ status: 'paid' }).where(eq(schema.cryptoInvoices.id, id)),
        db.update(schema.users).set({ credits: user.credits + invoice.creditsToAdd }).where(eq(schema.users.id, user.id))
      ];
      
      // Handle referral bonus logic
      if (user.referredBy) {
        const referrer = await db.select().from(schema.users).where(eq(schema.users.id, user.referredBy)).get();
        if (referrer) {
          const bonus = Math.floor(invoice.creditsToAdd * 0.10);
          updates.push(
            db.update(schema.users).set({ 
              credits: referrer.credits + bonus,
              referralEarnings: referrer.referralEarnings + bonus
            }).where(eq(schema.users.id, referrer.id))
          );
        }
      }
      
      await db.batch(updates as any);
    }
  } else {
    await db.update(schema.cryptoInvoices).set({ status: 'rejected' }).where(eq(schema.cryptoInvoices.id, id));
  }
  return c.json({ success: true });
});

// --- ANNOUNCEMENT MANAGEMENT ---
app.get('/announcements', async (c) => {
  const db = c.get('db');
  const list = await db.select().from(schema.announcements).orderBy(desc(schema.announcements.createdAt)).limit(10);
  return c.json(list);
});

app.post('/announcements', zValidator('json', z.object({
  title: z.string().min(3, "Title too short"),
  type: z.enum(['update', 'alert', 'event']).default('update')
})), async (c) => {
  const { title, type } = c.req.valid('json');
  const db = c.get('db');
  await db.insert(schema.announcements).values({ title, type });
  return c.json({ success: true });
});

app.delete('/announcements/:id', async (c) => {
  const id = Number(c.req.param('id'));
  const db = c.get('db');
  await db.delete(schema.announcements).where(eq(schema.announcements.id, id));
  return c.json({ success: true });
});

// --- WITHDRAWAL MANAGEMENT ---
app.get('/withdrawals', async (c) => {
  const db = c.get('db');
  const pending = await db.select({
    id: schema.withdrawals.id,
    username: schema.users.username,
    amountPts: schema.withdrawals.amountPts,
    amountUsdt: schema.withdrawals.amountUsdt,
    address: schema.withdrawals.address,
    status: schema.withdrawals.status,
    createdAt: schema.withdrawals.createdAt,
  })
  .from(schema.withdrawals)
  .leftJoin(schema.users, eq(schema.withdrawals.userId, schema.users.id))
  .where(eq(schema.withdrawals.status, 'pending'))
  .orderBy(desc(schema.withdrawals.createdAt));
  
  return c.json(pending);
});

app.post('/withdrawals/:id/resolve', zValidator('json', z.object({ action: z.enum(['approve', 'reject']) })), async (c) => {
  const id = Number(c.req.param('id'));
  const { action } = c.req.valid('json');
  const db = c.get('db');

  const withdrawal = await db.select().from(schema.withdrawals).where(eq(schema.withdrawals.id, id)).get();
  if (!withdrawal || withdrawal.status !== 'pending') return c.json({ error: 'Withdrawal not found or already processed' }, 404);

  if (action === 'approve') {
    await db.update(schema.withdrawals).set({ status: 'approved' }).where(eq(schema.withdrawals.id, id));
  } else {
    // Reject: refund PTS
    const user = await db.select().from(schema.users).where(eq(schema.users.id, withdrawal.userId)).get();
    if (user) {
      await db.batch([
        db.update(schema.withdrawals).set({ status: 'rejected' }).where(eq(schema.withdrawals.id, id)),
        db.update(schema.users).set({ credits: user.credits + withdrawal.amountPts }).where(eq(schema.users.id, user.id))
      ] as any);
    }
  }

  return c.json({ success: true });
});

// --- SUPPORT MANAGEMENT ---
app.get('/support-tickets', async (c) => {
  const db = c.get('db');
  const tickets = await db.select({
    id: schema.supportTickets.id,
    userId: schema.supportTickets.userId,
    username: schema.users.username,
    subject: schema.supportTickets.subject,
    message: schema.supportTickets.message,
    status: schema.supportTickets.status,
    reply: schema.supportTickets.reply,
    createdAt: schema.supportTickets.createdAt,
  })
  .from(schema.supportTickets)
  .leftJoin(schema.users, eq(schema.supportTickets.userId, schema.users.id))
  .where(eq(schema.supportTickets.status, 'open'))
  .orderBy(desc(schema.supportTickets.createdAt));
  
  return c.json(tickets);
});

app.post('/support-tickets/:id/resolve', zValidator('json', z.object({ reply: z.string().min(1) })), async (c) => {
  const id = Number(c.req.param('id'));
  const { reply } = c.req.valid('json');
  const db = c.get('db');

  const ticket = await db.select().from(schema.supportTickets).where(eq(schema.supportTickets.id, id)).get();
  if (!ticket || ticket.status !== 'open') return c.json({ error: 'Ticket not found or already resolved' }, 404);

  await db.update(schema.supportTickets)
    .set({ status: 'resolved', reply })
    .where(eq(schema.supportTickets.id, id));

  return c.json({ success: true });
});

export default app;
