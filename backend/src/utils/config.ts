/**
 * File: config.ts
 *
 * Description: Centralizes application configuration by loading environment variables via dotenv.
 * Exports a typed config object for Supabase credentials and server settings, and validates
 * that all required environment variables are present at startup.
 *
 * Author: Navnit(Ninjacode911)
 */

import dotenv from 'dotenv';

dotenv.config();

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
  },
  server: {
    port: parseInt(process.env.PORT || '3000', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3001'],
    isDev: process.env.NODE_ENV === 'development',
  },
};

// Validate required env vars on startup
const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}
