/**
 * File: errorHandler.middleware.ts
 *
 * Description: Global Express error-handling middleware. Catches unhandled
 * errors, logs them server-side, and returns a sanitized JSON response.
 * In production, 5xx error messages are replaced with a generic string so we
 * never leak DB errors, stack hints, or internal paths to API consumers.
 * 4xx errors keep their original messages since those are user-relevant
 * (validation failures, auth, not-found).
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  statusCode?: number;
  code?: string;
}

const IS_PRODUCTION = process.env.NODE_ENV === 'production';

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  const statusCode = err.statusCode || 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const isClientError = statusCode >= 400 && statusCode < 500;

  // Always log server-side so we can debug. Stack only in dev — production
  // logs go to Fly/Render which already capture them with metadata.
  // eslint-disable-next-line no-console
  console.error(
    `[ErrorHandler] ${req.method} ${req.path} ${statusCode} ${code}: ${err.message}`,
    IS_PRODUCTION ? '' : err.stack,
  );

  // Sanitize 5xx messages in production so we don't leak internals.
  const safeMessage =
    IS_PRODUCTION && !isClientError
      ? 'Something went wrong. Please try again.'
      : err.message || 'An unexpected error occurred';

  res.status(statusCode).json({
    success: false,
    data: null,
    error: {
      code,
      message: safeMessage,
    },
    meta: null,
  });
};
