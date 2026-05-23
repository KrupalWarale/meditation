/**
 * File: events.controller.ts
 *
 * Description: Manages event endpoints: listing upcoming events, user registration with capacity checks, and stream URL access for registered users.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * GET /api/events
 * List upcoming events ordered by event_date ascending
 */
export const listEvents = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 20));
    const offset = (pageNum - 1) * limitNum;

    const now = new Date().toISOString();

    const { data: events, error: queryError, count } = await supabase
      .from('events')
      .select('*', { count: 'exact' })
      .gt('event_date', now)
      .neq('status', 'cancelled')
      .order('event_date', { ascending: true })
      .range(offset, offset + limitNum - 1);

    if (queryError) {
      res.status(500).json(error('QUERY_FAILED', queryError.message, 500));
      return;
    }

    // Check which events the user is registered for
    const eventIds = (events ?? []).map((e) => e.id as string);
    let registrationMap: Record<string, boolean> = {};

    if (eventIds.length > 0) {
      const { data: registrations } = await supabase
        .from('event_registrations')
        .select('event_id, status')
        .eq('user_id', userId)
        .in('event_id', eventIds)
        .eq('status', 'registered');

      if (registrations) {
        registrationMap = registrations.reduce<Record<string, boolean>>((acc, r) => {
          acc[r.event_id] = true;
          return acc;
        }, {});
      }
    }

    const eventsWithRegistration = (events ?? []).map((event) => ({
      ...event,
      is_registered: registrationMap[event.id] ?? false,
    }));

    res.status(200).json(
      success(eventsWithRegistration, {
        page: pageNum,
        limit: limitNum,
        total: count ?? 0,
        totalPages: count ? Math.ceil(count / limitNum) : 0,
      })
    );
  } catch (err) {
    console.error('listEvents error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to fetch events', 500));
  }
};

/**
 * POST /api/events/:id/register
 * Register the authenticated user for an event
 */
export const registerForEvent = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: eventId } = req.params;

    // Verify event exists and is upcoming
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, status, max_participants, registration_count')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      res.status(404).json(error('NOT_FOUND', 'Event not found', 404));
      return;
    }

    if (event.status === 'cancelled') {
      res.status(400).json(error('EVENT_CANCELLED', 'This event has been cancelled', 400));
      return;
    }

    if (event.status === 'completed') {
      res.status(400).json(error('EVENT_COMPLETED', 'This event has already ended', 400));
      return;
    }

    // Check capacity
    if (event.max_participants && event.registration_count >= event.max_participants) {
      res.status(400).json(error('EVENT_FULL', 'Event has reached maximum capacity', 400));
      return;
    }

    // Check if already registered
    const { data: existing } = await supabase
      .from('event_registrations')
      .select('id')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      res.status(200).json(success(existing));
      return;
    }

    // Insert new registration
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .insert({
        event_id: eventId,
        user_id: userId,
        status: 'registered',
        registered_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (regError) {
      res.status(500).json(error('REGISTRATION_FAILED', regError.message, 500));
      return;
    }

    // Atomically increment registration_count
    await supabase.rpc('increment_counter', {
      p_table: 'events',
      p_column: 'registration_count',
      p_id: eventId,
      p_delta: 1
    });

    res.status(201).json(success(registration));
  } catch (err) {
    console.error('registerForEvent error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to register for event', 500));
  }
};

/**
 * GET /api/events/:id/stream
 * Get the stream URL for a registered event
 */
export const getStreamUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json(error('UNAUTHORIZED', 'Authentication required', 401));
      return;
    }

    const { id: eventId } = req.params;

    // Verify user is registered for the event
    const { data: registration, error: regError } = await supabase
      .from('event_registrations')
      .select('id, status')
      .eq('event_id', eventId)
      .eq('user_id', userId)
      .eq('status', 'registered')
      .single();

    if (regError || !registration) {
      res.status(403).json(
        error('NOT_REGISTERED', 'You must be registered for this event to access the stream', 403)
      );
      return;
    }

    // Fetch stream URL
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id, title, stream_url, recording_url, is_live, status')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      res.status(404).json(error('NOT_FOUND', 'Event not found', 404));
      return;
    }

    res.status(200).json(
      success({
        event_id: event.id,
        title: event.title,
        stream_url: event.stream_url ?? null,
        recording_url: event.recording_url ?? null,
        is_live: event.is_live,
        status: event.status,
      })
    );
  } catch (err) {
    console.error('getStreamUrl error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to get stream URL', 500));
  }
};
