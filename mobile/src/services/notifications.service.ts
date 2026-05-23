/**
 * File: notifications.service.ts
 *
 * Description: Manages push notifications and in-app notification delivery for the
 * mobile app. Handles device token registration, notification preferences, scheduling
 * meditation reminders, and retrieving notification history.
 *
 * Author: Navnit(Ninjacode911)
 */

import { get } from './api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  body: string;
  data: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
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
 * List the user's notifications (paginated)
 * GET /api/notifications
 */
export async function listNotifications(page: number = 1, limit: number = 20): Promise<PaginatedResult<Notification>> {
  return get<PaginatedResult<Notification>>('/notifications', { params: { page, limit } });
}
