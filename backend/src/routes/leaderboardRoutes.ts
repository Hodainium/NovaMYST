const { authenticateFirebaseToken } = require('../middleware/authMiddleware');
import { Router } from 'express';
import { Request, Response, NextFunction } from 'express'; // Import NextFunction for proper typing
import { updateLeaderboard, getLeaderboard} from '../controllers/leaderboardController';

const router = Router();

// Route to update or add a user score
router.post('/update', authenticateFirebaseToken, updateLeaderboard);

// Route to get the leaderboard with optional limit and order
router.get('/', authenticateFirebaseToken, getLeaderboard);

// // Sync leaderboard when XP updates
// router.post('/sync-xp', authenticateFirebaseToken, async (req, res, next) => {
//     const { userID } = req.body;

//     if (!userID) {
//       return res.status(400).json({ error: 'UserID is required' });
//     }

//     try {
//       await syncLeaderboardOnXPUpdate(userID);
//       res.status(200).json({ message: 'Leaderboard synced successfully' });
//     } catch (error) {
//       next(error); // Passing error to global error handler, if needed
//     }
// });

export default router;
