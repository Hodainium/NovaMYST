const { authenticateFirebaseToken } = require('../middleware/authMiddleware');
import { Router } from 'express';
import { Request, Response, NextFunction } from 'express'; // Import NextFunction for proper typing
import { updateLeaderboard, getLeaderboard} from '../controllers/leaderboardController';

const router = Router();

// Route to update or add a user score
router.post('/update', authenticateFirebaseToken, updateLeaderboard);

// Route to get the leaderboard with optional limit and order
router.get('/', authenticateFirebaseToken, async (req: Request, res: Response) => {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    try {
        const leaderboardData = await getLeaderboard(limit);
        res.status(200).json(leaderboardData);
    } catch (error: any) {
        console.error("Error fetching leaderboard:", error);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

export default router;
