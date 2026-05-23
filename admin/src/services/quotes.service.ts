/**
 * File: quotes.service.ts
 *
 * Description: Daily quote CRUD service for managing inspirational quotes including
 * creation, scheduling by display date, and activation toggling via Supabase.
 *
 * Author: Navnit(Ninjacode911)
 */

import { fetchFromTable, insertIntoTable, updateInTable, deleteFromTable } from './api';

export interface DailyQuote {
  id: string;
  text: string;
  author: string;
  category: string;
  is_active: boolean;
  display_date: string | null;
  created_at: string;
}

export async function getQuotes(): Promise<DailyQuote[]> {
  return fetchFromTable<DailyQuote>('quotes', {
    orderBy: 'created_at',
    ascending: false,
  });
}

export async function createQuote(quote: Partial<DailyQuote>): Promise<DailyQuote> {
  return insertIntoTable<DailyQuote>('quotes', quote);
}

export async function updateQuote(id: string, updates: Partial<DailyQuote>): Promise<DailyQuote> {
  return updateInTable<DailyQuote>('quotes', id, updates);
}

export async function deleteQuote(id: string): Promise<void> {
  return deleteFromTable('quotes', id);
}
