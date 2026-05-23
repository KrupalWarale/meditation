/**
 * File: validator.middleware.ts
 *
 * Description: Generic Zod-based request validation middleware. Accepts a Zod schema and a
 * validation source (body, params, or query), parses the incoming data, and returns structured
 * validation error responses with field-level details on failure.
 *
 * Author: Navnit(Ninjacode911)
 */

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationSource = 'body' | 'params' | 'query';

export const validate = (schema: ZodSchema, source: ValidationSource = 'body') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        res.status(400).json({
          success: false,
          data: null,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: err.issues.map((issue) => ({
              field: issue.path.join('.'),
              message: issue.message,
            })),
          },
          meta: null,
        });
        return;
      }
      next(err);
    }
  };
};
