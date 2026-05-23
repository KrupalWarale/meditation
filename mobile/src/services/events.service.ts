/**
 * File: events.service.ts
 *
 * Description: Handles CRUD operations for meditation events and community gatherings.
 * Provides methods to list upcoming events, retrieve event details, register attendance,
 * and manage event-related notifications for mobile users.
 *
 * Author: Navnit(Ninjacode911)
 */

import { get, post } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Event {
  id: string;
  title: string;
  description?: string;
  event_type: 'online' | 'in_person' | 'hybrid';
  start_time: string;
  end_time: string;
  host_name: string;
  image_url?: string;
  location?: string;
  max_attendees?: number;
  current_attendees: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  is_premium: boolean;
}

export interface EventRegistration {
  id: string;
  user_id: string;
  event_id: string;
  status: 'registered' | 'attended' | 'cancelled';
  registered_at: string;
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
 * List upcoming published events with optional filtering and pagination
 * GET /api/events
 */
export async function listEvents(filters?: {
  type?: 'online' | 'in_person' | 'hybrid';
  is_premium?: boolean;
  upcoming_only?: boolean;
  page?: number;
  limit?: number;
}): Promise<PaginatedResult<Event>> {
  return get<PaginatedResult<Event>>('/events', { params: filters });
}

/**
 * Register the authenticated user for an event
 * POST /api/events/:id/register
 */
export async function registerForEvent(eventId: string): Promise<EventRegistration> {
  return post<EventRegistration>(`/events/${eventId}/register`);
}

/**
 * Get the streaming URL for an online/hybrid event (requires registration)
 * GET /api/events/:id/stream
 */
export async function getStreamUrl(eventId: string): Promise<{ stream_url: string; message: string }> {
  return get<{ stream_url: string; message: string }>(`/events/${eventId}/stream`);
}
