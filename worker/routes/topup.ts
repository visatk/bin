import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { transactions, users } from '../db/schema';
import { requireAuth } from '../middleware/auth';

const topupRouter = new Hono();

// POST /api/topup/request
topupRouter.post('/request', requireAuth, async (c) => {
  try {
    const user = c.get('user');
    
    // Parse Incoming Payload
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

    // 2. Duplicate Check (Prevent spamming the same TXID)
    const existingTx = await db.select()
      .from(transactions)
      .where(eq(transactions.trxId, trxHash))
      .limit(1);

    if (existingTx.length > 0) {
      return c.json({ error: "This Transaction Hash has already been submitted." }, 409);
    }

    // 3. Database Insertion (Pending State)
    await db.insert(transactions).values({
      userId: user.id,
      type: 'deposit',
      points: points,
      amountUsd: amountUsd,
      method: method,
      trxId: trxHash,
      status: 'pending', // Requires admin manual approval for MVP
      createdAt: new Date().toISOString()
    });

    // 4. Return Success
    return c.json({ 
      success: true, 
      message: "Deposit request logged. Awaiting manual verification." 
    }, 201);

  } catch (error) {
    console.error("Topup Submission Error:", error);
    return c.json({ error: "Internal server error during submission." }, 500);
  }
});

// GET /api/topup/history (Optional: To show user their past topups)
topupRouter.get('/history', requireAuth, async (c) => {
  const user = c.get('user');
  
  const history = await db.select()
    .from(transactions)
    .where(eq(transactions.userId, user.id))
    // Assuming you sort by date descending in your real app
    .limit(10);
    
  return c.json(history);
});

export default topupRouter;
