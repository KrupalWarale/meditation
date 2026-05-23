/**
 * File: events.routes.ts
 *
 * Description: Defines API routes for live events including listing upcoming events,
 * registering for events, and retrieving stream URLs. All routes require authentication.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Router } from 'express';
import {
  listEvents,
  registerForEvent,
  getStreamUrl,
} from '../controllers/events.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { uuidParamSchema } from '../validators/user.validator';

const router = Router();

// GET /api/events — list upcoming events
router.get('/', authenticateToken, listEvents);

// POST /api/events/:id/register — register for an event
router.post('/:id/register', authenticateToken, validate(uuidParamSchema, 'params'), registerForEvent);

// GET /api/events/:id/stream — get stream URL (must be registered)
router.get('/:id/stream', authenticateToken, validate(uuidParamSchema, 'params'), getStreamUrl);

export default router;
