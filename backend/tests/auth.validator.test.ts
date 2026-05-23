/**
 * File: auth.validator.test.ts
 *
 * Description: Unit tests for Zod-based authentication validators. Verifies that requestOTPSchema
 * and verifyOTPSchema correctly accept valid inputs and reject malformed phone numbers and OTP codes.
 *
 * Author: Navnit(Ninjacode911)
 */

import { requestOTPSchema, verifyOTPSchema } from '../src/validators/auth.validator';

describe('Auth Validators (Zod schemas)', () => {
  describe('requestOTPSchema', () => {
    test('accepts valid phone numbers', () => {
      const validPhones = [
        { phone: '+1234567890' },
        { phone: '12345678901' },
      ];
      validPhones.forEach((data) => {
        expect(() => requestOTPSchema.parse(data)).not.toThrow();
      });
    });

    test('rejects invalid phone numbers', () => {
      const invalidPhones = [
        { phone: '12345' }, // too short
        { phone: '+1234567890123456' }, // too long
        { phone: 'abcdefghij' }, // letters
        {}, // missing field
      ];
      invalidPhones.forEach((data) => {
        const result = requestOTPSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('verifyOTPSchema', () => {
    test('accepts valid phone and otp', () => {
      expect(() => verifyOTPSchema.parse({
        phone: '+1234567890',
        otp: '123456'
      })).not.toThrow();
    });

    test('rejects invalid otp', () => {
      const invalidData = [
        { phone: '+1234567890', otp: '12345' }, // too short
        { phone: '+1234567890', otp: '1234567' }, // too long
        { phone: '+1234567890', otp: 123456 }, // not string
        { phone: '+1234567890' } // missing
      ];
      invalidData.forEach((data) => {
        const result = verifyOTPSchema.safeParse(data);
        expect(result.success).toBe(false);
      });
    });
  });
});
