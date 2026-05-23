/**
 * File: apiResponse.ts
 *
 * Description: Standardized API response helpers. Provides success and error factory functions
 * that enforce a consistent JSON response shape across all endpoints.
 *
 * Author: Navnit(Ninjacode911)
 */

export const success = (data: unknown, meta?: unknown) => ({
  success: true, data, error: null, meta
});
export const error = (code: string, message: string, _status: number) => ({
  success: false, data: null, error: { code, message }, meta: null
});
