/**
 * File: events.service.ts
 *
 * Description: Event CRUD service for creating, reading, updating, and deleting
 * meditation events and workshops via Supabase.
 *
 * Author: Navnit(Ninjacode911)
 */

import { fetchFromTable, insertIntoTable, updateInTable, deleteFromTable } from './api';

export interface MeditationEvent {
  id: string;
  title: string;
  description: string;
  event_date: string;
  location: string;
  is_virtual: boolean;
  max_participants: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export async function getEvents(): Promise<MeditationEvent[]> {
  return fetchFromTable<MeditationEvent>('events', {
    orderBy: 'event_date',
    ascending: true,
  });
}

export async function createEvent(event: Partial<MeditationEvent>): Promise<MeditationEvent> {
  return insertIntoTable<MeditationEvent>('events', event);
}

export async function updateEvent(id: string, updates: Partial<MeditationEvent>): Promise<MeditationEvent> {
  return updateInTable<MeditationEvent>('events', id, updates);
}

export async function deleteEvent(id: string): Promise<void> {
  return deleteFromTable('events', id);
}
