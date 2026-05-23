/**
 * File: lessons.service.ts
 *
 * Description: Lesson CRUD service for managing course lessons including ordering,
 * creation, updates, and deletion via Supabase.
 *
 * Author: Navnit(Ninjacode911)
 */

import { fetchFromTable, insertIntoTable, updateInTable, deleteFromTable } from './api';

export interface Lesson {
  id: string;
  course_id: string;
  title: string;
  description: string;
  audio_url: string | null;
  duration_minutes: number;
  sort_order: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export async function getLessons(): Promise<Lesson[]> {
  return fetchFromTable<Lesson>('lessons', {
    orderBy: 'sort_order',
    ascending: true,
  });
}

export async function getLessonsByCourse(courseId: string): Promise<Lesson[]> {
  return fetchFromTable<Lesson>('lessons', {
    orderBy: 'sort_order',
    ascending: true,
  }).then((lessons) => lessons.filter((l) => l.course_id === courseId));
}

export async function createLesson(lesson: Partial<Lesson>): Promise<Lesson> {
  return insertIntoTable<Lesson>('lessons', lesson);
}

export async function updateLesson(id: string, updates: Partial<Lesson>): Promise<Lesson> {
  return updateInTable<Lesson>('lessons', id, updates);
}

export async function deleteLesson(id: string): Promise<void> {
  return deleteFromTable('lessons', id);
}
