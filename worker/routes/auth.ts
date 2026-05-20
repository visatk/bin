import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { sign } from 'hono/jwt';
import { setCookie } from 'hono/cookie';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';
import * as schema from '../db/schema';
import type { Bindings, Variables } from '../types';
import { hashPassword, verifyPassword } from '../utils/crypto';
import { injectDb } from '../middleware/db';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

app.use('*', injectDb);

const generateReferral = () => crypto.randomUUID().split('-')[0].toUpperCase();

app.post('/register', zValidator('json', z.object({
  username: z.string().min(3),
  password: z.string().min(8),
  referralCode: z.string().optional()
})), async (c) => {
  const { username, password, referralCode } = c.req.valid('json');
  const db = c.get('db');
  
  let referredBy = null;
  if (referralCode) {
    const referrer = await db.select().from(schema.users).where(eq(schema.users.referralCode, referralCode)).get();
    if (referrer) referredBy = referrer.id;
  }

  const passwordHash = hashPassword(password);
  
  try {
    const result = await db.insert(schema.users).values({ 
      username, 
      passwordHash, 
      referralCode: generateReferral(),
      referredBy
    }).returning().get();
    return c.json({ success: true, userId: result.id });
  } catch {
    return c.json({ error: 'Username taken' }, 400);
  }
});

app.post('/login', zValidator('json', z.object({
  username: z.string(),
  password: z.string()
})), async (c) => {
  const { username, password } = c.req.valid('json');
  const db = c.get('db');
  
  const user = await db.select().from(schema.users).where(eq(schema.users.username, username)).get();
  
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // FIX: Explicit string -> Date mapping for accurate time evaluation
  const isVip = Boolean(user.isVip && user.vipUntil && new Date(user.vipUntil) > new Date());
  
  const token = await sign({ 
    sub: user.id, 
    username: user.username, 
    isVip, 
    exp: Math.floor(Date.now() / 1000) + 604800 
  }, c.env.JWT_SECRET);

  // FIX: sameSite changed to 'None' for proper Cross-Origin SPA support
  setCookie(c, 'auth_token', token, { 
    httpOnly: true, secure: true, sameSite: 'None', maxAge: 604800, path: '/' 
  });
  
  return c.json({ success: true, credits: user.credits, isVip });
});

app.post('/logout', (c) => {
  setCookie(c, 'auth_token', '', { 
    httpOnly: true, secure: true, sameSite: 'None', maxAge: 0, path: '/' 
  });
  return c.json({ success: true });
});

export default app;
