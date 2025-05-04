import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { getUserData, getUserStamina, consumeStamina } from '../controllers/userController';

const router = Router();

router.get('/data', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
  }, getUserData);


router.get('/stamina', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
}, getUserStamina);

router.post('/consumeStamina', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
}, consumeStamina);

export default router;