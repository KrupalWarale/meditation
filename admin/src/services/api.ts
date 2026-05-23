/**
 * File: api.ts
 *
 * Description: Generic CRUD helpers for Supabase table operations with error handling.
 *
 * Author: Navnit(Ninjacode911)
 */

import { supabase } from './supabase';

/**
 * Generic API helper for making authenticated Supabase queries.
 * Provides a centralized error handling pattern for all service calls.
 */
export async function fetchFromTable<T>(
  table: string,
  options?: {
    select?: string;
    orderBy?: string;
    ascending?: boolean;
    limit?: number;
  }
): Promise<T[]> {
  let query = supabase.from(table).select(options?.select ?? '*');

  if (options?.orderBy) {
    query = query.order(options.orderBy, { ascending: options.ascending ?? true });
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch from ${table}: ${error.message}`);
  }

  return (data as T[]) ?? [];
}

export async function insertIntoTable<T>(
  table: string,
  record: Partial<T>
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .insert(record)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to insert into ${table}: ${error.message}`);
  }

  return data as T;
}

export async function updateInTable<T>(
  table: string,
  id: string,
  updates: Partial<T>
): Promise<T> {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update in ${table}: ${error.message}`);
  }

  return data as T;
}

export async function deleteFromTable(
  table: string,
  id: string
): Promise<void> {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete from ${table}: ${error.message}`);
  }
}
