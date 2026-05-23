/**
 * File: directory.controller.test.ts
 *
 * Description: Unit tests for the content directory controller. Covers browsing with search and
 * category filters, bookmark creation and removal, view tracking, and pagination edge cases.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import {
  browseDirectory,
  bookmarkContent,
  removeBookmark,
  getBookmarks,
  trackView,
} from '../src/controllers/directory.controller';
import { supabase } from '../src/services/supabase.service';

jest.mock('../src/services/supabase.service', () => {
  const chainable: Record<string, jest.Mock> = {
    from: jest.fn(),
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn(),
    insert: jest.fn(),
    upsert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    order: jest.fn(),
    range: jest.fn(),
    limit: jest.fn(),
    rpc: jest.fn(),
    textSearch: jest.fn(),
  };

  // Every chainable method returns the chain object so calls can be stacked
  for (const key of Object.keys(chainable)) {
    chainable[key].mockReturnValue(chainable);
  }

  return { supabase: chainable };
});

// Cast for convenience
const db = supabase as unknown as Record<string, jest.Mock>;

/** Helper: build a mock Express request */
const mockReq = (overrides: Partial<Request> = {}): Request =>
  ({
    user: { id: 'test-user-id' },
    params: {},
    query: {},
    body: {},
    ...overrides,
  } as unknown as Request);

/** Helper: build a mock Express response with spy methods */
const mockRes = (): Response => {
  const res: Partial<Response> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as Response;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Directory Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-establish chainability after clearAllMocks
    for (const key of Object.keys(db)) {
      db[key].mockReturnValue(db);
    }
  });

  // -----------------------------------------------------------------------
  // browseDirectory
  // -----------------------------------------------------------------------
  describe('browseDirectory', () => {
    it('returns 200 with content list and pagination meta', async () => {
      const items = [
        {
          id: 'content-1',
          title: 'Morning Meditation',
          category: 'meditation',
          view_count: 150,
          is_active: true,
        },
        {
          id: 'content-2',
          title: 'Evening Chanting',
          category: 'chanting',
          view_count: 80,
          is_active: true,
        },
      ];

      // browseDirectory chains: from -> select -> eq -> order -> range
      // range() is the terminal awaited call
      db.range.mockResolvedValueOnce({ data: items, error: null, count: 2 });

      const req = mockReq({ query: { page: '1', limit: '20' } });
      const res = mockRes();

      await browseDirectory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: items,
          meta: expect.objectContaining({
            page: 1,
            limit: 20,
            total: 2,
            totalPages: 1,
          }),
        })
      );

      // Verify it queried the correct table with active filter
      expect(db.from).toHaveBeenCalledWith('content_directory');
      expect(db.eq).toHaveBeenCalledWith('is_active', true);
      expect(db.order).toHaveBeenCalledWith('view_count', { ascending: false });
    });

    it('filters results when search query is provided', async () => {
      const filtered = [
        {
          id: 'content-1',
          title: 'Morning Meditation',
          category: 'meditation',
          view_count: 150,
        },
      ];

      db.range.mockResolvedValueOnce({ data: filtered, error: null, count: 1 });

      const req = mockReq({ query: { q: 'morning meditation', page: '1', limit: '20' } });
      const res = mockRes();

      await browseDirectory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: filtered,
          meta: expect.objectContaining({ total: 1 }),
        })
      );

      // Verify textSearch was called with properly formatted tsquery
      expect(db.textSearch).toHaveBeenCalledWith(
        'search_vector',
        "'morning' & 'meditation'"
      );
    });

    it('filters results when category filter is provided', async () => {
      const filtered = [
        {
          id: 'content-3',
          title: 'Bhajan Collection',
          category: 'bhajan',
          view_count: 200,
        },
      ];

      db.range.mockResolvedValueOnce({ data: filtered, error: null, count: 1 });

      const req = mockReq({ query: { category: 'bhajan', page: '1', limit: '10' } });
      const res = mockRes();

      await browseDirectory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: filtered,
          meta: expect.objectContaining({ total: 1, limit: 10 }),
        })
      );

      // Verify category filter was applied (second eq call after is_active)
      expect(db.eq).toHaveBeenCalledWith('category', 'bhajan');
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await browseDirectory(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('returns 500 when the database query fails', async () => {
      db.range.mockResolvedValueOnce({
        data: null,
        error: { message: 'connection timeout' },
        count: null,
      });

      const req = mockReq({ query: {} });
      const res = mockRes();

      await browseDirectory(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'QUERY_FAILED' }),
        })
      );
    });

    it('clamps page and limit to valid ranges', async () => {
      db.range.mockResolvedValueOnce({ data: [], error: null, count: 0 });

      // page=-1 should clamp to 1, limit=100 should clamp to 50
      const req = mockReq({ query: { page: '-1', limit: '100' } });
      const res = mockRes();

      await browseDirectory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
          meta: expect.objectContaining({
            page: 1,
            limit: 50,
          }),
        })
      );
    });

    it('returns empty array when no items match', async () => {
      db.range.mockResolvedValueOnce({ data: null, error: null, count: 0 });

      const req = mockReq({ query: { q: 'nonexistent' } });
      const res = mockRes();

      await browseDirectory(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
          meta: expect.objectContaining({ total: 0, totalPages: 0 }),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // bookmarkContent
  // -----------------------------------------------------------------------
  describe('bookmarkContent', () => {
    it('creates a bookmark record and returns 201', async () => {
      const content = { id: 'content-1' };
      const bookmark = {
        id: 'bookmark-1',
        user_id: 'test-user-id',
        content_id: 'content-1',
      };

      // bookmarkContent flow:
      // 1. from('content_directory').select('id').eq('id', contentId).single()
      //    -> single() is terminal
      // 2. from('bookmarks').upsert(...).select().single()
      //    -> single() is terminal
      // 3. rpc('increment_counter', ...)
      db.single
        .mockResolvedValueOnce({ data: content, error: null })  // content exists
        .mockResolvedValueOnce({ data: bookmark, error: null }); // bookmark upserted

      db.rpc.mockResolvedValueOnce({ data: null, error: null });

      const req = mockReq({ params: { id: 'content-1' } });
      const res = mockRes();

      await bookmarkContent(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'bookmark-1',
            user_id: 'test-user-id',
            content_id: 'content-1',
          }),
        })
      );

      expect(db.from).toHaveBeenCalledWith('content_directory');
      expect(db.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'test-user-id',
          content_id: 'content-1',
        }),
        expect.objectContaining({
          onConflict: 'user_id,content_id',
          ignoreDuplicates: true,
        })
      );
      expect(db.rpc).toHaveBeenCalledWith('increment_counter', {
        p_table: 'content_directory',
        p_column: 'bookmark_count',
        p_id: 'content-1',
        p_delta: 1,
      });
    });

    it('returns 404 when content does not exist', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'not found', code: 'PGRST116' },
      });

      const req = mockReq({ params: { id: 'nonexistent' } });
      const res = mockRes();

      await bookmarkContent(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'NOT_FOUND' }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await bookmarkContent(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('returns 500 when upsert fails', async () => {
      const content = { id: 'content-1' };

      db.single
        .mockResolvedValueOnce({ data: content, error: null })
        .mockResolvedValueOnce({ data: null, error: { message: 'upsert error' } });

      const req = mockReq({ params: { id: 'content-1' } });
      const res = mockRes();

      await bookmarkContent(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'BOOKMARK_FAILED' }),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // removeBookmark
  // -----------------------------------------------------------------------
  describe('removeBookmark', () => {
    it('deletes a bookmark and returns 200', async () => {
      const existing = { id: 'bookmark-1' };

      // removeBookmark flow:
      // 1. from('bookmarks').select('id').eq('user_id').eq('content_id').single()
      //    -> single() is terminal (1st single call)
      // 2. from('bookmarks').delete().eq('user_id').eq('content_id')
      //    -> last eq() is terminal — need the 4th eq call to resolve
      // 3. rpc('increment_counter', ...)

      // single() resolves the existing bookmark check
      db.single.mockResolvedValueOnce({ data: existing, error: null });

      // For the delete chain, eq is called 4 times total:
      // #1 eq('user_id', ...) in select chain - returns db (chainable)
      // #2 eq('content_id', ...) in select chain - returns db (chainable, single() is terminal)
      // #3 eq('user_id', ...) in delete chain - returns db (chainable)
      // #4 eq('content_id', ...) in delete chain - this is the terminal await
      // We skip 3 eq calls (they return db by default), then resolve the 4th
      db.eq
        .mockReturnValueOnce(db)  // #1 select chain: eq('user_id')
        .mockReturnValueOnce(db)  // #2 select chain: eq('content_id')
        .mockReturnValueOnce(db)  // #3 delete chain: eq('user_id')
        .mockResolvedValueOnce({ error: null }); // #4 delete chain: eq('content_id') - terminal

      db.rpc.mockResolvedValueOnce({ data: null, error: null });

      const req = mockReq({ params: { id: 'content-1' } });
      const res = mockRes();

      await removeBookmark(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({ message: 'Bookmark removed' }),
        })
      );

      expect(db.from).toHaveBeenCalledWith('bookmarks');
      expect(db.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(db.eq).toHaveBeenCalledWith('content_id', 'content-1');
      expect(db.rpc).toHaveBeenCalledWith('increment_counter', {
        p_table: 'content_directory',
        p_column: 'bookmark_count',
        p_id: 'content-1',
        p_delta: -1,
      });
    });

    it('returns 404 when bookmark does not exist', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'not found' },
      });

      const req = mockReq({ params: { id: 'content-1' } });
      const res = mockRes();

      await removeBookmark(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'NOT_FOUND' }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await removeBookmark(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('returns 500 when delete operation fails', async () => {
      const existing = { id: 'bookmark-1' };

      db.single.mockResolvedValueOnce({ data: existing, error: null });

      // Same 4 eq calls, but the 4th resolves with an error
      db.eq
        .mockReturnValueOnce(db)
        .mockReturnValueOnce(db)
        .mockReturnValueOnce(db)
        .mockResolvedValueOnce({ error: { message: 'delete failed' } });

      const req = mockReq({ params: { id: 'content-1' } });
      const res = mockRes();

      await removeBookmark(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'DELETE_FAILED' }),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // getBookmarks
  // -----------------------------------------------------------------------
  describe('getBookmarks', () => {
    it('returns 200 with user bookmarks including content details', async () => {
      const bookmarks = [
        {
          id: 'bookmark-1',
          content_id: 'content-1',
          created_at: '2026-03-01T10:00:00Z',
          content_directory: {
            id: 'content-1',
            title: 'Morning Meditation',
            description: 'A calming start to your day',
            instructor_name: 'Swami Ananda',
            media_url: 'https://cdn.maa.org/audio/morning.mp3',
            thumbnail_url: 'https://cdn.maa.org/img/morning.jpg',
            duration_seconds: 600,
            category: 'meditation',
            tags: ['morning', 'calm'],
            language: 'en',
            is_premium: false,
            view_count: 150,
            bookmark_count: 25,
          },
        },
        {
          id: 'bookmark-2',
          content_id: 'content-2',
          created_at: '2026-03-02T14:00:00Z',
          content_directory: {
            id: 'content-2',
            title: 'Evening Bhajan',
            description: 'Sacred evening chanting',
            instructor_name: 'Devi Ma',
            media_url: 'https://cdn.maa.org/audio/bhajan.mp3',
            thumbnail_url: 'https://cdn.maa.org/img/bhajan.jpg',
            duration_seconds: 900,
            category: 'bhajan',
            tags: ['evening', 'bhajan'],
            language: 'hi',
            is_premium: true,
            view_count: 300,
            bookmark_count: 42,
          },
        },
      ];

      // getBookmarks chain: from('bookmarks').select(...).eq('user_id').order(...)
      // order() is the terminal awaited call
      db.order.mockResolvedValueOnce({ data: bookmarks, error: null });

      const req = mockReq();
      const res = mockRes();

      await getBookmarks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.arrayContaining([
            expect.objectContaining({
              id: 'bookmark-1',
              content_id: 'content-1',
              content_directory: expect.objectContaining({
                title: 'Morning Meditation',
                instructor_name: 'Swami Ananda',
              }),
            }),
            expect.objectContaining({
              id: 'bookmark-2',
              content_id: 'content-2',
              content_directory: expect.objectContaining({
                title: 'Evening Bhajan',
                is_premium: true,
              }),
            }),
          ]),
        })
      );

      expect(db.from).toHaveBeenCalledWith('bookmarks');
      expect(db.eq).toHaveBeenCalledWith('user_id', 'test-user-id');
      expect(db.order).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('returns empty array when user has no bookmarks', async () => {
      db.order.mockResolvedValueOnce({ data: [], error: null });

      const req = mockReq();
      const res = mockRes();

      await getBookmarks(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: [],
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await getBookmarks(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('returns 500 when the query fails', async () => {
      db.order.mockResolvedValueOnce({
        data: null,
        error: { message: 'query failed' },
      });

      const req = mockReq();
      const res = mockRes();

      await getBookmarks(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'QUERY_FAILED' }),
        })
      );
    });
  });

  // -----------------------------------------------------------------------
  // trackView
  // -----------------------------------------------------------------------
  describe('trackView', () => {
    it('increments view count and returns updated count', async () => {
      const content = { id: 'content-1', view_count: 42 };

      // trackView chain: from('content_directory').select('id, view_count').eq('id', contentId).single()
      // single() is terminal
      db.single.mockResolvedValueOnce({ data: content, error: null });

      // rpc to increment view_count
      db.rpc.mockResolvedValueOnce({ data: null, error: null });

      const req = mockReq({ params: { id: 'content-1' } });
      const res = mockRes();

      await trackView(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'content-1',
            view_count: 43,
          }),
        })
      );

      expect(db.from).toHaveBeenCalledWith('content_directory');
      expect(db.eq).toHaveBeenCalledWith('id', 'content-1');
      expect(db.rpc).toHaveBeenCalledWith('increment_counter', {
        p_table: 'content_directory',
        p_column: 'view_count',
        p_id: 'content-1',
        p_delta: 1,
      });
    });

    it('returns 404 when content does not exist', async () => {
      db.single.mockResolvedValueOnce({
        data: null,
        error: { message: 'not found' },
      });

      const req = mockReq({ params: { id: 'nonexistent' } });
      const res = mockRes();

      await trackView(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'NOT_FOUND' }),
        })
      );
    });

    it('returns 401 when user is not authenticated', async () => {
      const req = mockReq({ user: undefined });
      const res = mockRes();

      await trackView(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: expect.objectContaining({ code: 'UNAUTHORIZED' }),
        })
      );
    });

    it('handles null view_count gracefully by returning 1', async () => {
      const content = { id: 'content-1', view_count: null };

      db.single.mockResolvedValueOnce({ data: content, error: null });
      db.rpc.mockResolvedValueOnce({ data: null, error: null });

      const req = mockReq({ params: { id: 'content-1' } });
      const res = mockRes();

      await trackView(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data: expect.objectContaining({
            id: 'content-1',
            view_count: 1,
          }),
        })
      );
    });
  });
});
