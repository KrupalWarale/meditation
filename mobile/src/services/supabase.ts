/**
 * File: supabase.ts
 *
 * Description: Initializes and exports the Supabase client instance for the mobile app.
 * Configures the connection using environment variables for the Supabase URL and anon key,
 * and sets up any mobile-specific client options such as async storage for session persistence.
 *
 * Author: Navnit(Ninjacode911)
 */

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = process.env.SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('[Supabase] Missing SUPABASE_URL or SUPABASE_ANON_KEY in environment variables.');
}

/**
 * Supabase client configured for React Native:
 * - Uses AsyncStorage for session persistence across app restarts
 * - Uses the anon key (respects RLS policies)
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not applicable in React Native
  },
});
