/**
 * File: event.validator.ts
 *
 * Description: Zod validation schema for event-related route parameters. Validates that
 * the event ID is a properly formatted UUID for event registration endpoints.
 *
 * Author: Navnit(Ninjacode911)
 */

import { z } from 'zod';

export const registerEventParamsSchema = z.object({
  id: z.string().uuid('Invalid event ID'),
});
