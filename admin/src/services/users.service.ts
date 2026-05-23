/**
 * File: users.service.ts
 *
 * Description: User management service for listing, updating, and deleting user profiles
 * from the Supabase profiles table in the admin panel.
 *
 * Author: Navnit(Ninjacode911)
 */

import { fetchFromTable, updateInTable, deleteFromTable } from './api';

export interface User {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export async function getUsers(): Promise<User[]> {
  return fetchFromTable<User>('profiles', {
    orderBy: 'created_at',
    ascending: false,
  });
}

export async function updateUser(id: string, updates: Partial<User>): Promise<User> {
  return updateInTable<User>('profiles', id, updates);
}

export async function deleteUser(id: string): Promise<void> {
  return deleteFromTable('profiles', id);
}
