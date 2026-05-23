/**
 * File: directory.routes.ts
 *
 * Description: Defines API routes for the content directory, enabling users to browse, search,
 * bookmark, and track views on meditation content items. All routes are protected by authentication.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Router } from 'express';
import {
  browseDirectory,
  bookmarkContent,
  removeBookmark,
  getBookmarks,
  trackView,
} from '../controllers/directory.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { validate } from '../middleware/validator.middleware';
import { contentIdParamSchema } from '../validators/directory.validator';

const router = Router();

// GET /api/directory — browse content with search, filter, pagination
router.get('/', authenticateToken, browseDirectory);

// GET /api/directory/bookmarks — get user's bookmarked content
// NOTE: This must be before /:id routes to avoid conflict
router.get('/bookmarks', authenticateToken, getBookmarks);

// POST /api/directory/:id/bookmark — bookmark a content item
router.post('/:id/bookmark', authenticateToken, validate(contentIdParamSchema, 'params'), bookmarkContent);

// DELETE /api/directory/:id/bookmark — remove a bookmark
router.delete('/:id/bookmark', authenticateToken, validate(contentIdParamSchema, 'params'), removeBookmark);

// POST /api/directory/:id/view — track a content view
router.post('/:id/view', authenticateToken, validate(contentIdParamSchema, 'params'), trackView);

export default router;
