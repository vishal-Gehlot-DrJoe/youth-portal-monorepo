import { Router } from 'express';
import { youthEmailController } from '../controllers/youth-email.controller';
import { verifyFirebaseToken, requireAdmin, controllerHandler } from '../middlewares';

const router = Router();

router.use(verifyFirebaseToken, requireAdmin);

router.get('/', youthEmailController.getEmails);
router.post('/', youthEmailController.addEmail);
router.post('/bulk', youthEmailController.bulkUpload);
router.patch('/status', youthEmailController.bulkUpdateStatus);
router.post('/delete', youthEmailController.bulkDelete);

export default router;

