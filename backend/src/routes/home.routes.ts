/**
 * File: home.routes.ts
 *
 * Description: Defines the home feed API route that serves personalized content to authenticated
 * users on the app's main screen.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Router } from 'express';
import { getHomeFeed } from '../controllers/home.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();
router.get('/feed', authenticateToken, getHomeFeed);
export default router;
