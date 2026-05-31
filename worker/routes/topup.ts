import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { transactions } from '../db/schema';
import { requireAuth } from '../middleware/auth';
import type { Env, Variables } from '../types';

// Specify the Types here to fix the "user not assignable to keyof Variables" error
const topupRouter = new Hono<{ Bindings: Env; Variables: Variables }>();

// POST /api/topup/request
topupRouter.post('/request', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    const body = await c.req.json();
    const { points, amountUsd, method, trxHash } = body;

    // 1. Validation Logic
    if (!points || points < 100) {
      return c.json({ error: "Minimum topup limit is 100 PTS." }, 400);
    }
    
    if (!trxHash || trxHash.length < 5) {
      return c.json({ error: "Invalid Transaction Hash or ID provided." }, 400);
    }

    const validMethods = ['binance', 'usdt_trc20', 'ltc', 'eth'];
    if (!validMethods.includes(method)) {
      return c.json({ error: "Invalid payment method selected." }, 400);
    }

    // 2. Duplicate Check
    const existingTx = await db.select()
      .from(transactions)
      .where(eq(transactions.trxId, trxHash))
      .limit(1);

    if (existingTx.length > 0) {
      return c.json({ error: "This Transaction Hash has already been submitted." }, 409);
    }

    // 3. SECURE VIP 5% BONUS CALCULATION
    const actualPointsToCredit = user.isVip ? Math.floor(points * 1.05) : points;

    // 4. Database Insertion
    await db.insert(transactions).values({
      userId: user.id,
      type: 'deposit',
      points: actualPointsToCredit,
      amountUsd: amountUsd,
      method: method,
      trxId: trxHash,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    return c.json({ 
      success: true, 
      message: "Deposit request logged. Awaiting manual verification." 
    }, 201);

  } catch (error) {
    console.error("Topup Submission Error:", error);
    return c.json({ error: "Internal server error during submission." }, 500);
  }
});

// GET /api/topup/history
topupRouter.get('/history', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    const history = await db.select()
      .from(transactions)
      .where(eq(transactions.userId, user.id))
      .limit(10);
      
    return c.json(history);
  } catch (error) {
    return c.json({ error: "Failed to retrieve history." }, 500);
  }
});

export default topupRouter;
