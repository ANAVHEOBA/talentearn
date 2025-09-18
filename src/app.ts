// src/app.ts
import express from 'express';
import session from 'express-session';
import cors from 'cors';
import MongoStore from 'connect-mongo';
import { CONFIG } from './config/app-config';
import userRouter from './modules/user/user.router';

export const app = express();

/* ---------- middleware ---------- */
app.use(
  cors({
    origin: CONFIG.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json());

/* ---------- session ---------- */
app.use(
  session({
    secret: CONFIG.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: CONFIG.MONGODB_URI }),
    cookie: {
      httpOnly: true,
      secure: CONFIG.NODE_ENV === 'production',
      domain: CONFIG.COOKIE_DOMAIN,
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  })
);

/* ---------- routes ---------- */
app.use('/api', userRouter);

/* ---------- health check ---------- */
app.get('/ping', (_, res) => res.send('pong'));