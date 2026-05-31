export type User = {
  id: string;
  username: string;
  credits: number;
  isVip: boolean;
  isAdmin: boolean;
};

export type Variables = {
  user: User;
};

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
};
