/**
 * File: auth.controller.ts
 *
 * Description: Handles authentication endpoints: phone OTP request/verify, email login/signup. Creates user profiles on first login.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response } from 'express';
import { supabase } from '../services/supabase.service';
import { success, error } from '../utils/apiResponse';

/**
 * POST /api/auth/request-otp
 * Send OTP to phone number via Supabase Auth
 */
export const requestOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    if (!phone || phone.length < 10) {
      res.status(400).json(error('INVALID_PHONE', 'Please provide a valid phone number', 400));
      return;
    }

    const { error: supabaseError } = await supabase.auth.signInWithOtp({ phone });
    console.log(`[Auth] signInWithOtp called for ${phone}`);

    if (supabaseError) {
      console.error(`[Auth] Supabase OTP error for ${phone}:`, {
        code: (supabaseError as any).code,
        message: supabaseError.message,
        status: (supabaseError as any).status
      });
      res.status(400).json(error('OTP_SEND_FAILED', supabaseError.message, 400));
      return;
    }

    res.status(200).json(success({ message: `OTP sent to ${phone}` }));
  } catch (err) {
    console.error('requestOTP error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Failed to send OTP', 500));
  }
};

/**
 * POST /api/auth/verify-otp
 * Verify OTP and return JWT tokens
 */
export const verifyOTP = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    const { data, error: supabaseError } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    if (supabaseError || !data.session) {
      res.status(401).json(error('OTP_INVALID', 'Invalid or expired OTP', 401));
      return;
    }

    // Upsert user profile on first login
    const { user, session } = data;
    await supabase.from('users').upsert(
      {
        id: user!.id,
        phone: user!.phone,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id', ignoreDuplicates: false }
    );

    res.status(200).json(
      success({
        accessToken: session.access_token,
        refreshToken: session.refresh_token,
        user: {
          id: user!.id,
          phone: user!.phone,
        },
      })
    );
  } catch (err) {
    console.error('verifyOTP error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'OTP verification failed', 500));
  }
};

/**
 * POST /api/auth/email-login
 * Sign in with email + password via Supabase Auth
 */
export const emailLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (supabaseError || !data.session) {
      res.status(401).json(error('LOGIN_FAILED', 'Invalid email or password', 401));
      return;
    }

    res.status(200).json(
      success({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
        user: {
          id: data.user!.id,
          email: data.user!.email,
        },
      })
    );
  } catch (err) {
    console.error('emailLogin error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Login failed', 500));
  }
};

/**
 * POST /api/auth/email-signup
 * Register with email + password via Supabase Auth
 */
export const emailSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const { data, error: supabaseError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (supabaseError) {
      res.status(400).json(error('SIGNUP_FAILED', supabaseError.message, 400));
      return;
    }

    res.status(201).json(
      success({
        message: 'Account created. Please verify your email.',
        userId: data.user?.id,
      })
    );
  } catch (err) {
    console.error('emailSignup error:', err);
    res.status(500).json(error('INTERNAL_SERVER_ERROR', 'Signup failed', 500));
  }
};
