import { z } from 'zod';

export const validateAccessSchema = z.object({
    email: z
        .string({ message: 'Email is required' })
        .email('Invalid email format')
        .transform((val) => val.toLowerCase().trim()),
});

export type ValidateAccessInput = z.infer<typeof validateAccessSchema>;
