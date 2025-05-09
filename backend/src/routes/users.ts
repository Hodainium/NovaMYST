import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { getUserData, getUserStamina, consumeStamina, updateUsername, deleteAccount } from '../controllers/userController';
import type { Request, Response, NextFunction} from 'express';

const router = Router();

// Wrap async middleware manually because having issues with overload
const wrapAsync = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };


router.get('/data', (req: Request, res: Response, next: NextFunction) => {
    authenticateFirebaseToken(req, res, next);
  }, wrapAsync(getUserData));


router.get('/stamina', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
}, getUserStamina);

router.post('/consumeStamina', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
}, consumeStamina);

router.put("/update-username", wrapAsync(authenticateFirebaseToken), wrapAsync(updateUsername));

router.delete('/delete-account', wrapAsync(authenticateFirebaseToken), deleteAccount);

export default router;