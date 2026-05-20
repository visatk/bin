import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();
app.use('*', injectDb);

// GET: Retrieve user's transaction history
app.get('/history', requireAuth, async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  
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
  .orderBy(desc(schema.cryptoInvoices.createdAt));
  
  return c.json(history);
});

// POST: Submit a new transaction for verification
app.post('/submit', requireAuth, async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  
  try {
    const body = await c.req.json();
    const { txHash, currency, creditsToAdd } = body;

    // Strict input validation
    if (!txHash || typeof txHash !== 'string' || txHash.trim() === '') {
      return c.json({ error: 'Valid Transaction Hash is required' }, 400);
    }
    if (!currency || typeof currency !== 'string') {
      return c.json({ error: 'Currency selection is required' }, 400);
    }
    if (!creditsToAdd || isNaN(Number(creditsToAdd)) || Number(creditsToAdd) <= 0) {
      return c.json({ error: 'Invalid credits amount' }, 400);
    }

    // Cryptographic security: Prevent replay attacks via duplicate TxHashes
    const existingTx = await db.select()
      .from(schema.cryptoInvoices)
      .where(eq(schema.cryptoInvoices.txHash, txHash.trim()))
      .get();
      
    if (existingTx) {
      return c.json({ error: 'Transaction hash has already been submitted' }, 409);
    }

    // Insert pending invoice
    await db.insert(schema.cryptoInvoices).values({
      userId,
      txHash: txHash.trim(),
      currency: currency.toUpperCase(),
      creditsToAdd: Number(creditsToAdd),
      status: 'pending' // Enforced default state
    });

    return c.json({ success: true, message: 'Transaction submitted for verification' });
  } catch (err) {
    return c.json({ error: 'Malformed request payload' }, 400);
  }
});

export default app;
