import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  credits: integer('credits').default(0).notNull(),
  isVip: integer('is_vip', { mode: 'boolean' }).default(false).notNull(),
  isAdmin: integer('is_admin', { mode: 'boolean' }).default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

export const assets = sqliteTable('assets', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  badge: text('badge'),
  priceCredits: integer('price_credits').notNull(),
  isVipExclusive: integer('is_vip_exclusive', { mode: 'boolean' }).default(false).notNull(),
  assetData: text('asset_data').notNull(), // The actual secret data (CC, Bin, Proxy)
  soldCount: integer('sold_count').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

export const purchases = sqliteTable('purchases', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  assetId: integer('asset_id').references(() => assets.id),
  title: text('title').notNull(),
  category: text('category').notNull(),
  assetData: text('asset_data').notNull(),
  pricePaid: integer('price_paid').notNull(),
  createdAt: text('created_at').notNull(),
});

export const transactions = sqliteTable('transactions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type').notNull(), // 'deposit' or 'withdraw'
  points: integer('points').notNull(),
  amountUsd: real('amount_usd').notNull(),
  method: text('method').notNull(),
  trxId: text('trx_id').notNull().unique(),
  status: text('status').notNull(), // 'pending', 'approved', 'rejected'
  createdAt: text('created_at').notNull(),
});

export const news = sqliteTable('news', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  type: text('type').notNull(), // 'alert', 'event', 'update'
  createdAt: text('created_at').notNull(),
});

// Withdrawal requests table
export const withdrawals = sqliteTable('withdrawals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull().references(() => users.id),
  amountPoints: integer('amount_points').notNull(),
  walletAddress: text('wallet_address').notNull(),
  method: text('method').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
});
