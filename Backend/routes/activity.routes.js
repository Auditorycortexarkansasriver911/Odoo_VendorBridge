import { Router } from 'express';
import { listActivityLogs, getMyActivityLogs } from '../controllers/activityController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = Router();

router.use(verifyJWT);

router.get('/', listActivityLogs);
router.get('/mine', getMyActivityLogs);

export default router;
