/**
 * File: supabase.ts
 *
 * Description: Initializes Supabase client for the admin panel using Vite environment variables.
 *
 * Author: Navnit(Ninjacode911)
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
