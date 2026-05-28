import { Hono } from 'hono';
import { eq, desc } from 'drizzle-orm';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();
app.use('*', injectDb);

// Get user's support tickets
app.get('/', async (c) => {
  const db = c.get('db');
  const userId = c.get('userId');
  
  const tickets = await db.select()
    .from(schema.supportTickets)
    .where(eq(schema.supportTickets.userId, userId))
    .orderBy(desc(schema.supportTickets.createdAt));
    
  return c.json(tickets);
});

// Create a new support ticket
app.post('/', zValidator('json', z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(100),
  message: z.string().min(10, "Message must be at least 10 characters").max(1000)
})), async (c) => {
  const { subject, message } = c.req.valid('json');
  const db = c.get('db');
  const userId = c.get('userId');

  await db.insert(schema.supportTickets).values({
    userId,
    subject,
    message,
    status: 'open'
  });

  return c.json({ success: true });
});

export default app;
