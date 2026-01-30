import { z } from 'zod';

export const tilePositionSchema = z.object({
    tileId: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
    order: z.number(),
});

export const saveDraftLayoutSchema = z.object({
    tiles: z.array(tilePositionSchema),
});

export type SaveDraftLayoutInput = z.infer<typeof saveDraftLayoutSchema>;
