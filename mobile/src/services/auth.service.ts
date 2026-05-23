/**
 * File: auth.service.ts
 *
 * Description: Handles all authentication operations for the mobile app including
 * user sign-up, sign-in, sign-out, password reset, and session management.
 * Interfaces with Supabase Auth to manage user identity and tokens.
 *
 * Author: Navnit(Ninjacode911)
 */

import { post } from './api';
import { supabase } from './supabase';
import type { Session, User } from '@supabase/supabase-js';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    phone?: string;
    email?: string;
  };
}

export interface SignupResult {
  message: string;
  userId?: string;
}

// ---------------------------------------------------------------------------
// Phone OTP Auth (proxied through backend)
// ---------------------------------------------------------------------------

/**
 * Step 1 — Request an OTP to be sent to the given phone number.
 * POST /api/auth/request-otp
 */
export async function requestOTP(phone: string): Promise<{ message: string }> {
  return post<{ message: string }>('/auth/request-otp', { phone });
}

/**
 * Step 2 — Verify the OTP and receive JWT tokens.
 * POST /api/auth/verify-otp
 */
export async function verifyOTP(phone: string, otp: string): Promise<AuthTokens> {
  return post<AuthTokens>('/auth/verify-otp', { phone, otp });
}

// ---------------------------------------------------------------------------
// Email Auth (proxied through backend)
// ---------------------------------------------------------------------------

/**
 * Sign in with email + password.
 * POST /api/auth/email-login
 */
export async function emailLogin(email: string, password: string): Promise<AuthTokens> {
  return post<AuthTokens>('/auth/email-login', { email, password });
}

/**
 * Register with email + password.
 * POST /api/auth/email-signup
 */
export async function emailSignup(email: string, password: string): Promise<SignupResult> {
  return post<SignupResult>('/auth/email-signup', { email, password });
}

// ---------------------------------------------------------------------------
// Session management (via Supabase client directly)
// ---------------------------------------------------------------------------

/**
 * Sign the current user out and clear the local session.
 */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(`Sign-out failed: ${error.message}`);
  }
}

/**
 * Get the currently active Supabase session (null if not logged in).
 */
export async function getSession(): Promise<Session | null> {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw new Error(`Failed to get session: ${error.message}`);
  }
  return data.session;
}

/**
 * Get the currently authenticated user (null if not logged in).
 */
export async function getCurrentUser(): Promise<User | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    return null;
  }
  return data.user;
}
