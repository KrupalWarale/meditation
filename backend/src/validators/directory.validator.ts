/**
 * File: directory.validator.ts
 *
 * Description: Zod validation schema for content directory route parameters. Validates that
 * the content ID is a properly formatted UUID.
 *
 * Author: Navnit(Ninjacode911)
 */

import { z } from 'zod';

export const contentIdParamSchema = z.object({
  id: z.string().uuid('Invalid content ID format'),
});
