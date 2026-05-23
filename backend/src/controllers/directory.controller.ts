/**
 * File: directory.controller.ts
 *
 * Description: Handles content directory browsing with full-text search, category filtering, pagination, bookmarking, and view tracking.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/directory
 * Browse content directory with full-text search, category filter, and pagination
 */
export const browseDirectory = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const {
      q,
      category,
      page = '1',
      limit = '20',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    let query = supabase
      .from('content_directory')
      .select('*', { count: 'exact' })
      .eq('is_active', true);

    // Full-text search using search_vector
    if (q && typeof q === 'string' && q.trim().length > 0) {
      // Convert search query to tsquery format: split words and join with &
      const searchTerms = q
        .trim()
        .split(/\s+/)
        .map((term) => `'${term}'`)
        .join(' & ');
      query = query.textSearch('search_vector', searchTerms);
    }

    if (category && typeof category === 'string') {
      query = query.eq('category', category);
    }

    query = query
      .order('view_count', { ascending: false })
      .range(offset, offset + limitNum - 1);

    const { data: items, error: queryError, count } = await query;

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(
      success(items ?? [], {
        page: pageNum,
        limit: limitNum,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limitNum) : 0,
      })
    );
  } catch (err) {
    console.error('browseDirectory error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to browse directory', 500));
  }
};

/**
 * POST /api/directory/:id/bookmark
 * Bookmark a content item (upsert to handle duplicates)
 */
export const bookmarkContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: contentId } = req.params;

    // Verify content exists
    const { data: content, error: contentError } = await supabase
      .from('content_directory')
      .select('id')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      res.status(404).json(error('NOT_FOUND', 'Content not found', 404));
      return;
    }

    // Upsert bookmark
    const { data: bookmark, error: insertError } = await supabase
      .from('bookmarks')
      .upsert(
        {
          user_id: userId,
          content_id: contentId,
        },
        { onConflict: 'user_id,content_id', ignoreDuplicates: true }
      )
      .select()
      .single();

    if (insertError) {
      res.status(500).json(error('BOOKMARK_FAILED', insertError.message, 500));
      return;
    }

    // Atomically increment bookmark_count
    await supabase.rpc('increment_counter', {
      p_table: 'content_directory',
      p_column: 'bookmark_count',
      p_id: contentId,
      p_delta: 1
    });

    res.status(201).json(success(bookmark));
  } catch (err) {
    console.error('bookmarkContent error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to bookmark content', 500));
  }
};

/**
 * DELETE /api/directory/:id/bookmark
 * Remove a bookmark for a content item
 */
export const removeBookmark = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: contentId } = req.params;

    // Check if bookmark exists before deleting
    const { data: existing, error: fetchError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('user_id', userId)
      .eq('content_id', contentId)
      .single();

    if (fetchError || !existing) {
      res.status(404).json(error('NOT_FOUND', 'Bookmark not found', 404));
      return;
    }

    // Delete the bookmark
    const { error: deleteError } = await supabase
      .from('bookmarks')
      .delete()
      .eq('user_id', userId)
      .eq('content_id', contentId);

    if (deleteError) {
      res.status(500).json(error('DELETE_FAILED', deleteError.message, 500));
      return;
    }

    // Atomically decrement bookmark_count
    await supabase.rpc('increment_counter', {
      p_table: 'content_directory',
      p_column: 'bookmark_count',
      p_id: contentId,
      p_delta: -1
    });

    res.status(200).json(success({ message: 'Bookmark removed' }));
  } catch (err) {
    console.error('removeBookmark error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to remove bookmark', 500));
  }
};

/**
 * GET /api/directory/bookmarks
 * Get user's bookmarked content with content details
 */
export const getBookmarks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    // Fetch bookmarks with joined content details
    const { data: bookmarks, error: queryError } = await supabase
      .from('bookmarks')
      .select(
        `
        id,
        content_id,
        created_at,
        content_directory (
          id,
          title,
          description,
          instructor_name,
          media_url,
          thumbnail_url,
          duration_seconds,
          category,
          tags,
          language,
          is_premium,
          view_count,
          bookmark_count
        )
      `
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    res.status(200).json(success(bookmarks ?? []));
  } catch (err) {
    console.error('getBookmarks error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch bookmarks', 500));
  }
};

/**
 * POST /api/directory/:id/view
 * Track a content view by incrementing view_count
 */
export const trackView = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: contentId } = req.params;

    // Verify content exists and get current view count
    const { data: content, error: contentError } = await supabase
      .from('content_directory')
      .select('id, view_count')
      .eq('id', contentId)
      .single();

    if (contentError || !content) {
      res.status(404).json(error('NOT_FOUND', 'Content not found', 404));
      return;
    }

    // Atomically increment view_count
    await supabase.rpc('increment_counter', {
      p_table: 'content_directory',
      p_column: 'view_count',
      p_id: contentId,
      p_delta: 1
    });

    res.status(200).json(success({ id: content.id, view_count: (content.view_count ?? 0) + 1 }));
  } catch (err) {
    console.error('trackView error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to track view', 500));
  }
};
