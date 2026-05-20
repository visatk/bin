export type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  APIRONE_DEST_BTC: string;
  APIRONE_DEST_LTC: string;
  APIRONE_DEST_TRX: string;
  DOMAIN: string;
};

export type Variables = {
  userId: number;
  isVip: boolean;
  db: any; // Important so c.get('db') works in middleware and routers
};
