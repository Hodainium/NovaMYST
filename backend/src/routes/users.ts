import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { getUserData } from '../controllers/userController';

const router = Router();

router.get('/data', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
  }, getUserData);

export default router;
