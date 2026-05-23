/**
 * File: notifications.routes.ts
 *
 * Description: Defines the API route for retrieving a user's notifications list.
 * Requires authentication to access.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Router } from 'express';
import { listNotifications } from '../controllers/notifications.controller';
import { authenticateToken } from '../middleware/auth.middleware';

const router = Router();

// GET /api/notifications — list user's notifications
router.get('/', authenticateToken, listNotifications);

export default router;
