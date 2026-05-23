/**
 * File: settings.service.ts
 *
 * Description: Application settings service for reading and updating key-value configuration
 * entries organized by category (general, security, appearance, localization, database) via Supabase.
 *
 * Author: Navnit(Ninjacode911)
 */

import { supabase } from './supabase';

export interface AppSettings {
  id: string;
  key: string;
  value: string;
  category: 'general' | 'security' | 'appearance' | 'localization' | 'database';
  updated_at: string;
}

export async function getSettings(): Promise<AppSettings[]> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .order('category', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch settings: ${error.message}`);
  }

  return (data as AppSettings[]) ?? [];
}

export async function updateSetting(id: string, value: string): Promise<AppSettings> {
  const { data, error } = await supabase
    .from('app_settings')
    .update({ value, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update setting: ${error.message}`);
  }

  return data as AppSettings;
}
