import { z } from 'zod';

export const tileSizeSchema = z.enum(['SMALL', 'LARGE', 'FULL_WIDTH']);

export const createTileSchema = z.object({
    title: z.string({ message: 'Title is required' }).min(1).max(100),
    imageUrl: z.string({ message: 'Image URL is required' }).url(),
    linkUrl: z.string().url().optional(),
    size: tileSizeSchema,
});

export const updateTileSchema = z.object({
    title: z.string().min(1).max(100).optional(),
    imageUrl: z.string().url().optional(),
    linkUrl: z.string().url().optional().nullable(),
    size: tileSizeSchema.optional(),
});

export type CreateTileInput = z.infer<typeof createTileSchema>;
export type UpdateTileInput = z.infer<typeof updateTileSchema>;
