// src/modules/user/user.controller.ts
import { Request, Response } from 'express';
import axios from 'axios';
import jwt from 'jsonwebtoken';
import { CONFIG } from '../../config/app-config';
import { findOrCreateGoogleUser } from './user.crud';
import { Types } from 'mongoose';

/* ---------- constants ---------- */
const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/* ---------- 1.  send browser to Google ---------- */
export function googleLogin(_: Request, res: Response): void {
  const params = new URLSearchParams({
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    redirect_uri: `${CONFIG.BASE_URL}/api/user/google/callback`,
    scope: 'openid email profile',
    response_type: 'code',
    access_type: 'offline',
    prompt: 'select_account',
    ...(CONFIG.GOOGLE_HD && { hd: CONFIG.GOOGLE_HD }),
  });
  res.redirect(`${GOOGLE_OAUTH_URL}?${params.toString()}`);
}

/* ---------- 2.  Google calls us back ---------- */
export async function googleCallback(req: Request, res: Response): Promise<void> {
  const { code } = req.query;
  if (!code || typeof code !== 'string') {
    res.status(400).send('Missing authorization code');
    return;
  }

  try {
    /* ---- exchange code for tokens ---- */
    const tokenResp = await axios.post(GOOGLE_TOKEN_URL, {
      client_id: CONFIG.GOOGLE_CLIENT_ID,
      client_secret: CONFIG.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: `${CONFIG.BASE_URL}/api/user/google/callback`,
    });

    const accessToken = tokenResp.data.access_token as string;

    /* ---- fetch Google profile ---- */
    const userResp = await axios.get(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    const profile = userResp.data as {
      id: string;
      email: string;
      name?: string;
      picture?: string;
    };

    /* ---- create / update user in DB ---- */
    const user = await findOrCreateGoogleUser(profile);
    const userId = (user._id as Types.ObjectId).toString();

    /* ---- keep existing session cookie ---- */
    (req.session as any).userId = userId;

    /* ---- NEW: issue signed JWT ---- */
    const token = jwt.sign(
      { userId, email: user.email },
      CONFIG.SESSION_SECRET,
      { expiresIn: '7d' }
    );

    /* ---- redirect to front-end with token ---- */
    const frontEndUrl = new URL(CONFIG.CORS_ORIGIN);
    frontEndUrl.searchParams.set('token', token);
    res.redirect(frontEndUrl.toString());
  } catch (err: any) {
    console.error('Google OAuth error:', err.response?.data || err.message);
    res.redirect(`${CONFIG.CORS_ORIGIN}?error=oauth_failed`);
  }
}