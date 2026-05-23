/**
 * File: auth.integration.test.ts
 *
 * Description: Integration tests for the authentication API layer. Validates OTP request and
 * verification endpoints using supertest against an Express app with mocked Supabase services.
 *
 * Author: Navnit(Ninjacode911)
 */

import request from 'supertest';
import express from 'express';
import authRoutes from '../src/routes/auth.routes';
import { supabase } from '../src/services/supabase.service';
import { errorHandler } from '../src/middleware/errorHandler.middleware';

/**
 * We mock the supabase service out of the way for integration testing the API layer.
 */
jest.mock('../src/services/supabase.service', () => {
  const upsertMock = jest.fn();
  return {
    supabase: {
      auth: {
        signInWithOtp: jest.fn(),
        verifyOtp: jest.fn(),
        signInWithPassword: jest.fn(),
        signUp: jest.fn(),
      },
      from: jest.fn(() => ({
        upsert: upsertMock,
      })),
    },
  };
});

describe('Auth Integration Tests', () => {
  let app: express.Application;

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    // Attach routes
    app.use('/api/auth', authRoutes);
    app.use(errorHandler);
  });

  describe('POST /api/auth/request-otp', () => {
    it('should successfully send OTP with valid phone number', async () => {
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValueOnce({
        data: {},
        error: null,
      });

      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ phone: '+1234567890' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toContain('+1234567890');
      expect(supabase.auth.signInWithOtp).toHaveBeenCalledWith({ phone: '+1234567890' });
    });

    it('should reject invalid phone number due to validation middleware', async () => {
      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ phone: '12' }); // Invalid phone

      // Validator intercepts it and returns 400
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(supabase.auth.signInWithOtp).not.toHaveBeenCalled();
    });

    it('should handle Supabase service error', async () => {
      (supabase.auth.signInWithOtp as jest.Mock).mockResolvedValueOnce({
        data: {},
        error: { message: 'Failed to send SMS message' },
      });

      const res = await request(app)
        .post('/api/auth/request-otp')
        .send({ phone: '+1234567890' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Failed to send SMS message');
    });
  });

  describe('POST /api/auth/verify-otp', () => {
    it('should verify valid OTP and return token', async () => {
      // Mock verifyOtp
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValueOnce({
        data: {
          user: { id: 'user-id', phone: '+1234567890' },
          session: { access_token: 'acc-tkn', refresh_token: 'ref-tkn' },
        },
        error: null,
      });

      // Mock upsert
      const mockUpsert = supabase.from('users').upsert as jest.Mock;
      mockUpsert.mockResolvedValueOnce({ data: null, error: null });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phone: '+1234567890', otp: '123456' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBe('acc-tkn');
      expect(res.body.data.refreshToken).toBe('ref-tkn');
      expect(supabase.auth.verifyOtp).toHaveBeenCalledWith({
        phone: '+1234567890',
        token: '123456',
        type: 'sms'
      });
      expect(supabase.from).toHaveBeenCalledWith('users');
      expect(mockUpsert).toHaveBeenCalled();
    });

    it('should return 401 if OTP is invalid', async () => {
      (supabase.auth.verifyOtp as jest.Mock).mockResolvedValueOnce({
        data: { session: null, user: null },
        error: { message: 'Token has expired or is invalid' },
      });

      const res = await request(app)
        .post('/api/auth/verify-otp')
        .send({ phone: '+1234567890', otp: '123456' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.error.message).toContain('Invalid or expired OTP');
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });
});
