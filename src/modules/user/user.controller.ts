import { Request, Response } from 'express';
import axios from 'axios';
import { CONFIG } from '../../config/app-config';
import { findOrCreateGoogleUser } from './user.crud';
import { Types } from 'mongoose'; 

const GOOGLE_OAUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v2/userinfo';

/* 1.  Build the Google consent URL and redirect the browser */
export function googleLogin(_: Request, res: Response) {
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

/* 2.  Exchange code for tokens, fetch profile, create session */
export async function googleCallback(req: Request, res: Response) {
  const { code } = req.query;
  if (!code || typeof code !== 'string') return res.status(400).send('Missing code');

  // ---- trade code for tokens ----
  const tokenResp = await axios.post(GOOGLE_TOKEN_URL, {
    client_id: CONFIG.GOOGLE_CLIENT_ID,
    client_secret: CONFIG.GOOGLE_CLIENT_SECRET,
    code,
    grant_type: 'authorization_code',
    redirect_uri: `${CONFIG.BASE_URL}/api/user/google/callback`,
  });

  const accessToken = tokenResp.data.access_token;

  // ---- fetch user info ----
  const userResp = await axios.get(GOOGLE_USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const profile = userResp.data;

  // ---- create or update user ----
  const user = await findOrCreateGoogleUser({
    id: profile.id,
    email: profile.email,
    name: profile.name,
    picture: profile.picture,
  });

  // ---- create session (example: cookie) ----
  (req.session as any).userId = (user._id as Types.ObjectId).toString();

  // ---- redirect to front-end ----
  res.redirect(CONFIG.CORS_ORIGIN);
}