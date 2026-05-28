import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { cache } from 'hono/cache';
import type { Bindings, Variables } from './types';
import { requireAuth } from './middleware/auth'; // Import your middleware
import auth from './routes/auth';
import shop from './routes/shop';
import user from './routes/user';
import vip from './routes/vip';
import topup from './routes/topup';
import admin from './routes/admin';
import withdraw from './routes/withdraw';
import support from './routes/support';

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

// Apply requireAuth middleware to all core API routes (excluding /api/auth)
app.use('/api/shop/*', requireAuth);
app.use('/api/user/*', requireAuth);
app.use('/api/vip/*', requireAuth);
app.use('/api/topup/*', requireAuth);
app.use('/api/admin/*', requireAuth);
app.use('/api/withdraw/*', requireAuth);
app.use('/api/support/*', requireAuth);

app.onError((err, c) => {
  console.error('API Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Endpoint Not Found' }, 404);
});

// Route Mounts
app.route('/api/auth', auth);
app.route('/api/shop', shop);
app.route('/api/user', user);
app.route('/api/vip', vip);
app.route('/api/topup', topup);
app.route('/api/admin', admin);
app.route('/api/withdraw', withdraw);
app.route('/api/support', support);

export default app;
