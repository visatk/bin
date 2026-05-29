import { Hono } from 'hono';
import { eq, desc, and } from 'drizzle-orm';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { requireAuth } from '../middleware/auth';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();
app.use('*', injectDb);

// Business Logic Limits for Lean MVP
const MAX_PENDING_INVOICES = 3;
const MIN_CREDITS_TOPUP = 1;
const MAX_CREDITS_TOPUP = 10000;

// GET: Retrieve user's transaction history
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
    .limit(50); // Performance optimization: Only fetch recent 50
    
    return c.json(history);
  } catch (error) {
    console.error('DB Error [Topup History]:', error);
    return c.json({ error: 'Failed to retrieve transaction history' }, 500);
  }
});

// POST: Submit a new transaction for verification
app.post('/submit', requireAuth, async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  
  try {
    const body = await c.req.json();
    let { txHash, currency, creditsToAdd } = body;

    // 1. Strict Input Sanitization & Format Validation
    if (!txHash || typeof txHash !== 'string') {
      return c.json({ error: 'Valid Transaction Hash is required' }, 400);
    }
    txHash = txHash.trim();

    // Prevent malicious payload injection (TXID usually is 60-66 hex chars or Base58)
    const txRegex = /^[a-zA-Z0-9]{10,100}$/;
    if (!txRegex.test(txHash)) {
      return c.json({ error: 'Invalid transaction hash format' }, 400);
    }

    // Validate supported currencies
    const supportedCurrencies = ['LTC', 'ETH', 'USDT'];
    if (!currency || typeof currency !== 'string' || !supportedCurrencies.includes(currency.toUpperCase())) {
      return c.json({ error: 'Unsupported or invalid blockchain network' }, 400);
    }

    // Validate credits amount
    const parsedCredits = Number(creditsToAdd);
    if (isNaN(parsedCredits) || parsedCredits < MIN_CREDITS_TOPUP || parsedCredits > MAX_CREDITS_TOPUP) {
      return c.json({ error: `Amount must be between ${MIN_CREDITS_TOPUP} and ${MAX_CREDITS_TOPUP} PTS` }, 400);
    }

    // 2. Anti-Spam: Restrict pending invoices (SaaS Logic)
    const pendingInvoices = await db.select()
      .from(schema.cryptoInvoices)
      .where(
        and(
          eq(schema.cryptoInvoices.userId, userId),
          eq(schema.cryptoInvoices.status, 'pending')
        )
      );

    if (pendingInvoices.length >= MAX_PENDING_INVOICES) {
      return c.json({ error: `Too many pending requests. Please wait for admin to verify your previous ${MAX_PENDING_INVOICES} transactions.` }, 429);
    }

    // 3. Global Replay Attack Protection
    // Ensures NO ONE in the system has ever claimed this TXID before
    const existingTx = await db.select()
      .from(schema.cryptoInvoices)
      .where(eq(schema.cryptoInvoices.txHash, txHash))
      .get();
      
    if (existingTx) {
      return c.json({ error: 'This transaction hash has already been claimed in the system' }, 409);
    }

    // 4. Insert Verified Data into D1 Edge Node
    await db.insert(schema.cryptoInvoices).values({
      userId,
      txHash,
      currency: currency.toUpperCase(),
      creditsToAdd: parsedCredits,
      status: 'pending' // Enforced server-side
    });

    return c.json({ success: true, message: 'Transaction submitted for verification' });
    
  } catch (err) {
    console.error('Submit Error [Topup]:', err);
    return c.json({ error: 'Malformed request payload or internal error' }, 400);
  }
});

export default app;
