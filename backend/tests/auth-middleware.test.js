/**
 * File: auth-middleware.test.js
 *
 * Description: Tests for the Supabase JWT authentication middleware. Validates token extraction
 * from Bearer headers, rejection of missing or invalid tokens, and graceful handling of service errors.
 *
 * Author: Navnit(Ninjacode911)
 */

/**
 * Authentication Middleware Tests
 * Tests Supabase JWT token verification middleware
 */

const request = require('supertest');
const express = require('express');
const { authenticateToken } = require('../src/middleware/auth.middleware.js');

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn()
    }
  }))
}));

const { createClient } = require('@supabase/supabase-js');

describe('Authentication Middleware Tests', () => {
  let app;
  let mockSupabase;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    // Mock Supabase client
    mockSupabase = createClient();
    
    // Test route with auth middleware
    app.get('/protected', authenticateToken, (req, res) => {
      res.json({
        success: true,
        user: req.user
      });
    });

    // Test route without auth
    app.get('/public', (req, res) => {
      res.json({ success: true, message: 'Public endpoint' });
    });
  });

  test('Rejects request without Authorization header', async () => {
    const response = await request(app)
      .get('/protected')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Access token required');
    console.log('✅ Correctly rejects requests without auth header');
  });

  test('Rejects request with invalid Authorization format', async () => {
    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'InvalidFormat token123')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Access token required');
    console.log('✅ Correctly rejects invalid auth format');
  });

  test('Rejects request with invalid token', async () => {
    // Mock Supabase to return error for invalid token
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: 'Invalid token' }
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Invalid or expired token');
    console.log('✅ Correctly rejects invalid tokens');
  });

  test('Accepts request with valid token', async () => {
    // Mock Supabase to return valid user
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      user_metadata: { name: 'Test User' }
    };

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: mockUser },
      error: null
    });

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer valid-token')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.user.id).toBe('user-123');
    expect(response.body.user.email).toBe('test@example.com');
    console.log('✅ Correctly accepts valid tokens');
  });

  test('Handles Supabase service errors gracefully', async () => {
    // Mock Supabase to throw an error
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Service unavailable'));

    const response = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer some-token')
      .expect(500);

    expect(response.body.success).toBe(false);
    expect(response.body.error).toContain('Authentication failed');
    console.log('✅ Handles service errors gracefully');
  });

  test('Public endpoints work without authentication', async () => {
    const response = await request(app)
      .get('/public')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Public endpoint');
    console.log('✅ Public endpoints work without auth');
  });

  test('Extracts token correctly from Bearer header', async () => {
    const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test.token';
    
    mockSupabase.auth.getUser.mockImplementation((token) => {
      expect(token).toBe(testToken);
      return Promise.resolve({
        data: { user: { id: 'test-user', email: 'test@example.com' } },
        error: null
      });
    });

    await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${testToken}`)
      .expect(200);

    console.log('✅ Correctly extracts token from Bearer header');
  });

});