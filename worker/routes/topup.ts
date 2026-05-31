import { Hono } from 'hono';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();
app.use('*', injectDb);

const MAX_PENDING_INVOICES = 3;
const MIN_CREDITS_TOPUP = 1;
const MAX_CREDITS_TOPUP = 10000;

app.get('/history', requireAuth, async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  
  try {
    const history = await db.select({
      id: schema.cryptoInvoices.id,
      txHash: schema.cryptoInvoices.txHash,
      currency: schema.cryptoInvoices.currency,
      creditsToAdd: schema.cryptoInvoices.creditsToAdd,
      status: schema.cryptoInvoices.status,
      createdAt: schema.cryptoInvoices.createdAt,
    })
    .from(schema.cryptoInvoices)
    .where(eq(schema.cryptoInvoices.userId, userId))
    .orderBy(desc(schema.cryptoInvoices.createdAt))
    .limit(50);
    
    return c.json(history);
  } catch (error) {
    return c.json({ error: 'Failed to retrieve transaction history' }, 500);
  }
});

app.post('/submit', requireAuth, async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  const isVip = c.get('isVip'); 
  
  try {
    const body = await c.req.json();
    let { txHash, currency, creditsToAdd } = body;

    if (!txHash || typeof txHash !== 'string') return c.json({ error: 'Valid Transaction Hash is required' }, 400);
    txHash = txHash.trim();

    const txRegex = /^[a-zA-Z0-9]{10,100}$/;
    if (!txRegex.test(txHash)) return c.json({ error: 'Invalid transaction hash format' }, 400);

    const supportedCurrencies = ['LTC', 'ETH', 'USDT'];
    if (!currency || typeof currency !== 'string' || !supportedCurrencies.includes(currency.toUpperCase())) {
      return c.json({ error: 'Unsupported or invalid blockchain network' }, 400);
    }

    const parsedCredits = Number(creditsToAdd);
    if (isNaN(parsedCredits) || parsedCredits < MIN_CREDITS_TOPUP || parsedCredits > MAX_CREDITS_TOPUP) {
      return c.json({ error: `Amount must be between ${MIN_CREDITS_TOPUP} and ${MAX_CREDITS_TOPUP} PTS` }, 400);
    }

    const pendingInvoices = await db.select()
      .from(schema.cryptoInvoices)
      .where(and(eq(schema.cryptoInvoices.userId, userId), eq(schema.cryptoInvoices.status, 'pending')));

    if (pendingInvoices.length >= MAX_PENDING_INVOICES) {
      return c.json({ error: `Too many pending requests. Please wait for admin to verify.` }, 429);
    }

    const existingTx = await db.select().from(schema.cryptoInvoices).where(eq(schema.cryptoInvoices.txHash, txHash)).get();
    if (existingTx) return c.json({ error: 'This transaction hash has already been claimed in the system' }, 409);

    // SECURE VIP 5% BONUS CALCULATION
    const finalCredits = isVip ? Math.floor(parsedCredits * 1.05) : parsedCredits;

    await db.insert(schema.cryptoInvoices).values({
      userId,
      txHash,
      currency: currency.toUpperCase(),
      creditsToAdd: finalCredits,
      status: 'pending'
    });

    return c.json({ success: true, message: 'Transaction submitted for verification' });
    
  } catch (err) {
    return c.json({ error: 'Malformed request payload or internal error' }, 400);
  }
});

export default app;
