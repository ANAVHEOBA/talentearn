// src/modules/user/user.router.ts
import { Router } from 'express';
import { googleLogin, googleCallback } from './user.controller';

const router = Router();

router.get('/user/google', googleLogin);         
router.get('/user/google/callback', googleCallback);

export default router;