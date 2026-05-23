/**
 * File: directory.service.ts
 *
 * Description: Manages the teacher and instructor directory for the mobile app.
 * Provides methods to browse, search, and retrieve detailed profiles of meditation
 * teachers and wellness practitioners available on the platform.
 *
 * Author: Navnit(Ninjacode911)
 */

import { get, post, del } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DirectoryItem {
  id: string;
  title: string;
  description?: string;
  instructor_name: string;
  media_url?: string;
  thumbnail_url?: string;
  duration_seconds?: number;
  category: string;
  tags?: string[];
  language: string;
  is_premium: boolean;
  view_count: number;
  bookmark_count: number;
  is_active: boolean;
}

export interface Bookmark {
  id: string;
  content_id: string;
  created_at: string;
  content_directory: DirectoryItem;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ---------------------------------------------------------------------------
// Service Methods
// ---------------------------------------------------------------------------

/**
 * Browse content directory with full-text search, category filter, and pagination
 * GET /api/directory
 */
export async function browseDirectory(filters?: {
  q?: string;
  category?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<DirectoryItem>> {
  return get<PaginatedResult<DirectoryItem>>('/directory', { params: filters });
}

/**
 * Bookmark a content item
 * POST /api/directory/:id/bookmark
 */
export async function bookmarkContent(id: string): Promise<{ id: string; content_id: string; user_id: string }> {
  return post(`/directory/${id}/bookmark`);
}

/**
 * Remove a bookmark for a content item
 * DELETE /api/directory/:id/bookmark
 */
export async function removeBookmark(id: string): Promise<{ message: string }> {
  return del<{ message: string }>(`/directory/${id}/bookmark`);
}

/**
 * Get user's bookmarked content with content details
 * GET /api/directory/bookmarks
 */
export async function getBookmarks(): Promise<Bookmark[]> {
  return get<Bookmark[]>('/directory/bookmarks');
}

/**
 * Track a content view by incrementing view_count
 * POST /api/directory/:id/view
 */
export async function trackView(id: string): Promise<{ id: string; view_count: number }> {
  return post<{ id: string; view_count: number }>(`/directory/${id}/view`);
}
