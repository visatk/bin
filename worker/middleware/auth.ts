import type { Context, Next } from 'hono';
import { verify } from 'hono/jwt';
import { getCookie } from 'hono/cookie';
import type { Bindings, Variables } from '../types';

export const requireAuth = async (c: Context<{ Bindings: Bindings, Variables: Variables }>, next: Next) => {
  const token = getCookie(c, 'auth_token');
  if (!token) return c.json({ error: 'Unauthorized' }, 401);

  try {
    // Note: HS256 algorithm specified for security and latest Hono compatibility
    const decoded = await verify(token, c.env.JWT_SECRET, 'HS256');
    c.set('userId', Number(decoded.sub));
    c.set('isVip', Boolean(decoded.isVip));
    await next();
  } catch (e) {
    return c.json({ error: 'Invalid token' }, 401);
  }
};
