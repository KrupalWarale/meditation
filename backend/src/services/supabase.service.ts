/**
 * File: supabase.service.ts
 *
 * Description: Initializes the Supabase client with the service role key for backend operations
 * that bypass RLS. Provides a singleton SupabaseService wrapper with error-handled query
 * execution and RPC function calls.
 *
 * Author: Navnit(Ninjacode911)
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase environment variables');
}

// Create Supabase client with SERVICE ROLE key for backend operations
// This bypasses RLS and should only be used server-side
const supabase: SupabaseClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Supabase service wrapper with error handling
 */
export class SupabaseService {
  private static instance: SupabaseService;
  private client: SupabaseClient;

  private constructor() {
    this.client = supabase;
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  /**
   * Get the Supabase client instance
   */
  public getClient(): SupabaseClient {
    return this.client;
  }

  /**
   * Execute a query with error handling
   */
  public async executeQuery<T>(
    queryFn: (client: SupabaseClient) => Promise<{ data: T | null; error: any }>
  ): Promise<T> {
    try {
      const { data, error } = await queryFn(this.client);
      
      if (error) {
        throw new Error(`Supabase query error: ${error.message}`);
      }
      
      return data as T;
    } catch (error) {
      console.error('Supabase service error:', error);
      throw error;
    }
  }

  /**
   * Execute RPC function with error handling
   */
  public async executeRPC<T>(
    functionName: string,
    params?: Record<string, any>
  ): Promise<T> {
    try {
      const { data, error } = await this.client.rpc(functionName, params);
      
      if (error) {
        throw new Error(`Supabase RPC error: ${error.message}`);
      }
      
      return data as T;
    } catch (error) {
      console.error(`Supabase RPC error (${functionName}):`, error);
      throw error;
    }
  }
}

// Export singleton instance
export const supabaseService = SupabaseService.getInstance();

// Export client for direct access when needed
export { supabase };

/**
 * Key Usage Notes:
 * 
 * SUPABASE_ANON_KEY:
 * - Used in frontend applications (React, React Native)
 * - Respects Row Level Security (RLS) policies
 * - Limited to authenticated user's own data
 * 
 * SUPABASE_SERVICE_ROLE_KEY:
 * - Used ONLY in backend/server applications
 * - Bypasses Row Level Security (RLS)
 * - Full database access - use with extreme caution
 * - Never expose to frontend or client-side code
 */