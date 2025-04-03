import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import { getUserAchievements, claimAchievement } from '../controllers/achievementController';

const router = Router();

router.get('/progress', (req, res, next) => {
  authenticateFirebaseToken(req, res, next);
}, getUserAchievements);

router.post('/claim/:achievementID', (req, res, next) => {
    authenticateFirebaseToken(req, res, next);
  }, claimAchievement);

export default router;