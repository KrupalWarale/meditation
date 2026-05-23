/**
 * File: auth.validator.ts
 *
 * Description: Zod validation schemas for authentication endpoints. Validates phone number
 * format for OTP requests and enforces exact 6-digit OTP length for verification.
 *
 * Author: Navnit(Ninjacode911)
 */

import { z } from 'zod';

export const requestOTPSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number')
});

export const verifyOTPSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{9,14}$/, 'Invalid phone number'),
  otp: z.string().length(6, 'OTP must be exactly 6 digits')
});
