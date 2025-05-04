import { Router } from 'express';
import { authenticateFirebaseToken } from '../middleware/authMiddleware';
import {
  updateLeaderboard,
  getGlobalLeaderboard,
  getSimilarXPLeaderboard,
  getFriendLeaderboard
} from '../controllers/leaderboardController';
import type { Request, Response } from 'express';

const router = Router();

// Wrap async middleware manually because having issues with overload
const wrapAsync = (fn: any) => (req: any, res: any, next: any) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
  
router.post('/update', wrapAsync(authenticateFirebaseToken), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    await updateLeaderboard(user.uid);
    res.status(200).json({ message: 'Leaderboard updated' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update leaderboard' });
  }
});

router.get('/global', wrapAsync(authenticateFirebaseToken), async (req: Request, res: Response) => {
  try {
    const leaderboard = await getGlobalLeaderboard();
    res.status(200).json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch global leaderboard' });
  }
});

router.get('/similar', wrapAsync(authenticateFirebaseToken), async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const leaderboard = await getSimilarXPLeaderboard(user.uid);
    res.status(200).json(leaderboard);
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch similar XP leaderboard' });
  }
});

router.get('/friends', wrapAsync(authenticateFirebaseToken), async (req: Request, res: Response) => {
  const userId = (req as any).user.uid;
  const data = await getFriendLeaderboard(userId);
  res.json(data);
});

export default router;
