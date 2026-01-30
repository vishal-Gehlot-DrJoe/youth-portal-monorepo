import { Router } from 'express';
import { tileController } from '../controllers/tile.controller';
import { controllerHandler, validateRequest, verifyFirebaseToken, requireAdmin } from '../middlewares';
import { createTileSchema } from '../schemas/tile.schema';

const router = Router();

router.post(
    '/',
    verifyFirebaseToken,
    requireAdmin,
    validateRequest(createTileSchema),
    controllerHandler(tileController.createTile.bind(tileController))
);

router.get(
    '/',
    verifyFirebaseToken,
    controllerHandler(tileController.getTiles.bind(tileController))
);

router.put(
    '/:id',
    verifyFirebaseToken,
    requireAdmin,
    validateRequest(createTileSchema.partial()),
    controllerHandler(tileController.updateTile.bind(tileController))
);

export default router;
