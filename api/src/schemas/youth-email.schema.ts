import { z } from 'zod';

export const createYouthEmailSchema = z.object({
    email: z.string({ message: 'Email is required' }).email('Invalid email format').trim().toLowerCase(),
});

export const youthEmailQuerySchema = z.object({
    page: z.string().optional().transform(v => (v ? parseInt(v, 10) : 1)),
    pageSize: z.string().optional().transform(v => (v ? parseInt(v, 10) : 10)),
    search: z.string().optional(),
    isActive: z.string().optional().transform(v => (v === 'true' ? true : v === 'false' ? false : undefined)),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export const bulkActionSchema = z.object({
    ids: z.array(z.string().min(1)),
});

export const bulkStatusSchema = bulkActionSchema.extend({
    isActive: z.boolean(),
});
