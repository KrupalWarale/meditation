/**
 * File: courses.service.ts
 *
 * Description: Course CRUD service for creating, reading, updating, and deleting
 * meditation courses via Supabase.
 *
 * Author: Navnit(Ninjacode911)
 */

import { fetchFromTable, insertIntoTable, updateInTable, deleteFromTable } from './api';

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail_url: string | null;
  duration_minutes: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export async function getCourses(): Promise<Course[]> {
  return fetchFromTable<Course>('courses', {
    orderBy: 'created_at',
    ascending: false,
  });
}

export async function createCourse(course: Partial<Course>): Promise<Course> {
  return insertIntoTable<Course>('courses', course);
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<Course> {
  return updateInTable<Course>('courses', id, updates);
}

export async function deleteCourse(id: string): Promise<void> {
  return deleteFromTable('courses', id);
}
