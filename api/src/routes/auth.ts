import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { controllerHandler, validateRequest } from '../middlewares';
import { verifyFirebaseToken } from '../middlewares/auth.middleware';
import { validateAccessSchema } from '../schemas/auth.schema';

const router = Router();

router.post(
    '/validate-access',
    validateRequest(validateAccessSchema),
    controllerHandler(authController.validateAccess.bind(authController))
);

router.get(
    '/get-user-role',
    verifyFirebaseToken,
    controllerHandler(authController.getUserRole.bind(authController))
);

export default router;
