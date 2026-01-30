import { Router } from 'express';
import { layoutController } from '../controllers/layout.controller';
import { controllerHandler, validateRequest, verifyFirebaseToken, requireAdmin } from '../middlewares';
import { saveDraftLayoutSchema } from '../schemas/layout.schema';

const router = Router();

router.post(
    '/draft',
    verifyFirebaseToken,
    requireAdmin,
    validateRequest(saveDraftLayoutSchema),
    controllerHandler(layoutController.saveDraft.bind(layoutController))
);

router.post(
    '/publish',
    verifyFirebaseToken,
    requireAdmin,
    validateRequest(saveDraftLayoutSchema), 
    controllerHandler(layoutController.publish.bind(layoutController))
);

router.get(
    '/draft',
    verifyFirebaseToken,
    requireAdmin,
    controllerHandler(layoutController.getDraftLayout.bind(layoutController))
);

router.get('/active', verifyFirebaseToken, controllerHandler(layoutController.getActiveLayout.bind(layoutController)));

export default router;
