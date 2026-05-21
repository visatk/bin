import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { cache } from 'hono/cache';
import type { Bindings, Variables } from './types';
import auth from './routes/auth';
import shop from './routes/shop';
import user from './routes/user';
import vip from './routes/vip';
import topup from './routes/topup';
import admin from './routes/admin';

const app = new Hono<{ Bindings: Bindings, Variables: Variables }>();

app.use('/api/*', secureHeaders());
app.use('/api/*', cors({ 
  origin: ['http://localhost:5173', 'https://visatk.us'], 
  allowHeaders: ['Content-Type', 'Authorization'], 
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'], 
  credentials: true 
}));

app.get(
  '/api/shop/*',
  cache({
    cacheName: 'binmarket-shop-cache',
    cacheControl: 'max-age=60, stale-while-revalidate=30',
  })
);

app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Endpoint Not Found' }, 404);
});

app.route('/api/auth', auth);
app.route('/api/shop', shop);
app.route('/api/user', user);
app.route('/api/vip', vip);
app.route('/api/topup', topup);
app.route('/api/admin', admin);

export default app;
