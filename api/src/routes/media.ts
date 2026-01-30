import { Router } from 'express';
import { mediaController } from '../controllers/media.controller';
import { controllerHandler, verifyFirebaseToken, requireAdmin } from '../middlewares';

const router = Router();

router.post(
    '/upload-url',
    verifyFirebaseToken,
    requireAdmin,
    controllerHandler(mediaController.getSignedUrl.bind(mediaController))
);

export default router;
