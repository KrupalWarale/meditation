/**
 * File: notifications.service.ts
 *
 * Description: Notification CRUD service for managing push notification records
 * including creation, scheduling, and delivery tracking via Supabase.
 *
 * Author: Navnit(Ninjacode911)
 */

import { fetchFromTable, insertIntoTable, updateInTable, deleteFromTable } from './api';

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'push' | 'in_app' | 'email';
  target_audience: 'all' | 'subscribers' | 'free';
  scheduled_at: string | null;
  sent_at: string | null;
  is_sent: boolean;
  created_at: string;
}

export async function getNotifications(): Promise<Notification[]> {
  return fetchFromTable<Notification>('notifications', {
    orderBy: 'created_at',
    ascending: false,
  });
}

export async function createNotification(notification: Partial<Notification>): Promise<Notification> {
  return insertIntoTable<Notification>('notifications', notification);
}

export async function updateNotification(id: string, updates: Partial<Notification>): Promise<Notification> {
  return updateInTable<Notification>('notifications', id, updates);
}

export async function deleteNotification(id: string): Promise<void> {
  return deleteFromTable('notifications', id);
}
