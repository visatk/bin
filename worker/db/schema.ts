import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  credits: integer('credits').notNull().default(0),
  isAdmin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
  isVip: integer('is_vip', { mode: 'boolean' }).notNull().default(false),
  vipUntil: integer('vip_until', { mode: 'timestamp' }),
  referralCode: text('referral_code').notNull().unique(),
  referredBy: integer('referred_by'),
  referralEarnings: integer('referral_earnings').notNull().default(0),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const items = sqliteTable('items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  category: text('category').notNull(),
  date: text('date').notNull(),
  soldCount: integer('sold_count').notNull().default(0),
  priceCredits: integer('price_credits').notNull(),
  badge: text('badge'),
  isVipExclusive: integer('is_vip_exclusive', { mode: 'boolean' }).notNull().default(false),
  assetData: text('asset_data').notNull().default(''), // Revealed only post-purchase
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const purchases = sqliteTable('purchases', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  itemId: integer('item_id').notNull().references(() => items.id),
  pricePaid: integer('price_paid').notNull(),
  purchasedAt: integer('purchased_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const cryptoInvoices = sqliteTable('crypto_invoices', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  txHash: text('tx_hash').notNull(),
  currency: text('currency').notNull(), 
  creditsToAdd: integer('credits_to_add').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'paid', 'rejected'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const announcements = sqliteTable('announcements', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  title: text('title').notNull(),
  type: text('type').notNull().default('update'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const withdrawals = sqliteTable('withdrawals', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: integer('user_id').notNull().references(() => users.id),
  amountPts: integer('amount_pts').notNull(),
  amountUsdt: integer('amount_usdt').notNull(),
  address: text('address').notNull(),
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});
