import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { getUserData, getUserStamina, consumeStamina, updateUsername } from '../controllers/userController';

const router = Router();

// Wrap async middleware manually because having issues with overload
const wrapAsync = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };


router.get('/data', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
  }, getUserData);


router.get('/stamina', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
}, getUserStamina);

router.post('/consumeStamina', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
}, consumeStamina);

router.put("/update-username", wrapAsync(authenticateFirebaseToken), wrapAsync(updateUsername));


export default router;