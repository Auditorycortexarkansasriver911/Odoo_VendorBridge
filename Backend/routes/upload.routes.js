import { Router } from 'express';
import { getUploadAuth, deleteFile } from '../controllers/uploadController.js';
import { verifyJWT } from '../middleware/auth.js';

const router = Router();

router.use(verifyJWT);

router.get('/auth', getUploadAuth);
router.delete('/file', deleteFile);

export default router;
