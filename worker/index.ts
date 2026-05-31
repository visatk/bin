import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { setGlobalDb } from './db';
import type { Env, Variables } from './types';

// Import Routers
import authRouter from './routes/auth';
import shopRouter from './routes/shop';
import topupRouter from './routes/topup';
import userRouter from './routes/user';
import adminRouter from './routes/admin';
import vipRouter from './routes/vip';
import withdrawRouter from './routes/withdraw';
import supportRouter from './routes/support';

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

// Security & CORS Middleware
app.use('*', cors({
  origin: '*', // For production, replace '*' with your actual domain
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'OPTIONS', 'PUT', 'DELETE'],
}));

// DB Initialization Middleware (Crucial for D1)
app.use('*', async (c, next) => {
  // Bind the Cloudflare D1 environment to our global db instance
  if (c.env.DB) {
    setGlobalDb(c.env.DB);
  } else {
    console.error("D1 Database binding not found!");
  }
  await next();
});

// Health Check
app.get('/api/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Mount Sub-routers
app.route('/api/auth', authRouter);
app.route('/api/shop', shopRouter);
app.route('/api/topup', topupRouter);
app.route('/api/user', userRouter);
app.route('/api/admin', adminRouter);
app.route('/api/vip', vipRouter);
app.route('/api/withdraw', withdrawRouter);
app.route('/api/support', supportRouter);

// Global Error Handler
app.onError((err, c) => {
  console.error(`[Global Error Handler]: ${err.message}`, err);
  return c.json({ error: "Internal Server Error", message: err.message }, 500);
});

// 404 Handler
app.notFound((c) => {
  return c.json({ error: "API Route Not Found" }, 404);
});

export default app;
