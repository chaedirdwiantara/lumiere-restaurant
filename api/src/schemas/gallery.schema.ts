import { z } from 'zod';

export const uploadImageSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .transform(val => val?.trim() || null),
  alt_text: z
    .string()
    .min(1, 'Alt text is required for accessibility')
    .max(200, 'Alt text must not exceed 200 characters')
    .trim(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters')
    .trim(),
  tags: z
    .array(z.string().min(1).max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional()
    .default([]),
  is_featured: z
    .boolean()
    .optional()
    .default(false),
  display_order: z
    .number()
    .int()
    .min(0, 'Display order must be a non-negative integer')
    .optional()
});

export const updateImageSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must not exceed 200 characters')
    .trim()
    .optional(),
  description: z
    .string()
    .max(1000, 'Description must not exceed 1000 characters')
    .optional()
    .transform(val => val?.trim() || null),
  alt_text: z
    .string()
    .min(1, 'Alt text is required for accessibility')
    .max(200, 'Alt text must not exceed 200 characters')
    .trim()
    .optional(),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(50, 'Category must not exceed 50 characters')
    .trim()
    .optional(),
  tags: z
    .array(z.string().min(1).max(30))
    .max(10, 'Maximum 10 tags allowed')
    .optional(),
  is_featured: z
    .boolean()
    .optional(),
  is_active: z
    .boolean()
    .optional(),
  display_order: z
    .number()
    .int()
    .min(0, 'Display order must be a non-negative integer')
    .optional()
});

export const reorderImagesSchema = z.object({
  imageOrders: z
    .array(
      z.object({
        id: z.string().uuid('Invalid image ID format'),
        display_order: z
          .number()
          .int()
          .min(0, 'Display order must be a non-negative integer')
      })
    )
    .min(1, 'At least one image order is required')
    .max(100, 'Maximum 100 images can be reordered at once')
});

export const galleryQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 1)
    .refine(val => val > 0, 'Page must be a positive integer'),
  limit: z
    .string()
    .optional()
    .transform(val => val ? parseInt(val, 10) : 12)
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
  category: z
    .string()
    .max(50, 'Category must not exceed 50 characters')
    .optional(),
  is_featured: z
    .string()
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  is_active: z
    .string()
    .optional()
    .transform(val => val === 'true' ? true : val === 'false' ? false : undefined),
  search: z
    .string()
    .max(100, 'Search query must not exceed 100 characters')
    .optional(),
  sort_by: z
    .enum(['created_at', 'updated_at', 'display_order', 'title'])
    .optional()
    .default('display_order'),
  sort_order: z
    .enum(['asc', 'desc'])
    .optional()
    .default('asc')
});

export const imageIdSchema = z.object({
  id: z
    .string()
    .uuid('Invalid image ID format')
});

export type UploadImageRequest = z.infer<typeof uploadImageSchema>;
export type UpdateImageRequest = z.infer<typeof updateImageSchema>;
export type ReorderImagesRequest = z.infer<typeof reorderImagesSchema>;
export type GalleryQueryParams = z.infer<typeof galleryQuerySchema>;
export type ImageIdParams = z.infer<typeof imageIdSchema>;