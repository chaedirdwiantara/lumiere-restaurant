import { z } from 'zod';

export const homeContentSchema = z.object({
  section_key: z
    .string()
    .min(1, 'Section key is required')
    .max(50, 'Section key must not exceed 50 characters')
    .regex(/^[a-z0-9_]+$/, 'Section key must contain only lowercase letters, numbers, and underscores')
    .trim(),
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  subtitle: z
    .string()
    .max(300, 'Subtitle must not exceed 300 characters')
    .optional()
    .transform(val => val?.trim() || null),
  content: z
    .string()
    .max(5000, 'Content must not exceed 5000 characters')
    .optional()
    .transform(val => val?.trim() || null),
  image_url: z
    .string()
    .url('Invalid image URL format')
    .max(500, 'Image URL must not exceed 500 characters')
    .optional()
    .transform(val => val?.trim() || null),
  button_text: z
    .string()
    .max(50, 'Button text must not exceed 50 characters')
    .optional()
    .transform(val => val?.trim() || null),
  button_url: z
    .string()
    .max(500, 'Button URL must not exceed 500 characters')
    .optional()
    .transform(val => val?.trim() || null),
  display_order: z
    .number()
    .int()
    .min(0, 'Display order must be a non-negative integer')
    .optional()
    .default(0),
  is_active: z
    .boolean()
    .optional()
    .default(true),
  metadata: z
    .record(z.any())
    .optional()
    .default({})
});

export const updateHomeContentSchema = homeContentSchema.partial().omit({ section_key: true });

export const createHomeContentSchema = homeContentSchema;

export const heroContentSchema = z.object({
  title: z
    .string()
    .min(1, 'Hero title is required')
    .max(200, 'Hero title must not exceed 200 characters')
    .trim(),
  subtitle: z
    .string()
    .max(300, 'Hero subtitle must not exceed 300 characters')
    .optional()
    .transform(val => val?.trim() || null),
  content: z
    .string()
    .max(1000, 'Hero content must not exceed 1000 characters')
    .optional()
    .transform(val => val?.trim() || null),
  image_url: z
    .string()
    .url('Invalid hero image URL format')
    .max(500, 'Hero image URL must not exceed 500 characters')
    .optional()
    .transform(val => val?.trim() || null),
  button_text: z
    .string()
    .max(50, 'Hero button text must not exceed 50 characters')
    .optional()
    .transform(val => val?.trim() || null),
  button_url: z
    .string()
    .max(500, 'Hero button URL must not exceed 500 characters')
    .optional()
    .transform(val => val?.trim() || null),
  is_active: z
    .boolean()
    .optional()
    .default(true)
});

export const homeQuerySchema = z.object({
  is_active: z
    .string()
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  sort_by: z
    .enum(['display_order', 'created_at', 'updated_at', 'section_key'])
    .optional()
    .default('display_order'),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc')
});

export const sectionKeySchema = z.object({
  section: z
    .string()
    .min(1, 'Section key is required')
    .max(50, 'Section key must not exceed 50 characters')
    .regex(/^[a-z0-9_]+$/, 'Section key must contain only lowercase letters, numbers, and underscores')
});

export type HomeContentRequest = z.infer<typeof homeContentSchema>;
export type UpdateHomeContentRequest = z.infer<typeof updateHomeContentSchema>;
export type CreateHomeContentRequest = z.infer<typeof createHomeContentSchema>;
export type HeroContentRequest = z.infer<typeof heroContentSchema>;
export type HomeQueryParams = z.infer<typeof homeQuerySchema>;
export type SectionKeyParams = z.infer<typeof sectionKeySchema>;