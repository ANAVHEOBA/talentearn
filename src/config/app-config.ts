import dotenv from 'dotenv';
dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

export const CONFIG = {
  PORT: Number(process.env.PORT ?? 5000),
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  BASE_URL: process.env.BASE_URL!,
  CORS_ORIGIN: process.env.CORS_ORIGIN!,
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN!,
  MONGODB_URI: process.env.MONGODB_URI!,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID!,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET!,
  SESSION_SECRET: process.env.SESSION_SECRET!,
  GOOGLE_HD: process.env.GOOGLE_HD,
  GOOGLE_REDIRECT_URIS:
    process.env.GOOGLE_REDIRECT_URIS?.split(',').map((s) => s.trim()) ?? [],
} as const;