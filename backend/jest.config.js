/**
 * File: jest.config.js
 *
 * Description: Jest testing configuration for the backend. Uses ts-jest preset for
 * TypeScript support, targets all test files in the tests directory, and sets a
 * 30-second timeout for integration tests against Supabase.
 *
 * Author: Navnit(Ninjacode911)
 */

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: [
    '**/tests/**/*.test.[jt]s'
  ],
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 30000,
  verbose: true
};