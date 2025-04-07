import type { Request, Response } from 'express';
import admin from 'firebase-admin';
const db = admin.firestore();
import { getUserData, fetchUserData } from './userController'; 
const { User } = require('../models/user') // import user models

// Update leaderboard entry for a user
export const updateLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { userID } = req.body;
  
      if (!userID) {
        res.status(400).json({ error: 'UserID is required' });
        return;
      }
  
      const userData = await fetchUserData(userID);
  
      if (!userData) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      const leaderboardRef = db.collection('leaderboard').doc(userID);
  
      await leaderboardRef.set(
        {
          userID,
          userName: userData.userName,
          xp: userData.xp,
        },
        { merge: true }
      );
  
      res.status(200).json({ message: 'Leaderboard updated successfully' });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error updating leaderboard:", error.message);
        res.status(500).json({ error: error.message });
      } else {
        console.error("Unknown error updating leaderboard:", error);
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  };
  
// Get leaderboard with optional limit and order
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = 10, orderBy = 'xp', orderDirection = 'desc' } = req.query; // order by xp
  
      // Ensure limit is a number and we are limiting amount of people 
      const limitNumber = parseInt(limit as string, 10);
  
      if (isNaN(limitNumber) || limitNumber <= 0) { 
        res.status(400).json({ error: 'Limit must be a positive number' });
        return;
      }
  
      const snapshot = await db
        .collection('leaderboard')
        .orderBy(orderBy as string, orderDirection as FirebaseFirestore.OrderByDirection)
        .limit(limitNumber)
        .get();
  
      const leaderboard = snapshot.docs.map(doc => doc.data());
  
      res.status(200).json(leaderboard);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error fetching leaderboard:", error.message);
        res.status(500).json({ error: error.message });
      } else {
        console.error("Unknown error fetching leaderboard:", error);
        res.status(500).json({ error: 'An unknown error occurred' });
      }
    }
  };
  
  
//   // Sync leaderboard when XP updates
//   export const syncLeaderboardOnXPUpdate = async (userID: string): Promise<void> => {
//     try {
//       const userData = await fetchUserData(userID);
  
//       if (!userData) {
//         console.error(`User not found for leaderboard sync: ${userID}`);
//         return;
//       }
  
//       const leaderboardRef = db.collection('leaderboard').doc(userID);
  
//       await leaderboardRef.set(
//         {
//           userID,
//           userName: userData.userName,
//           xp: userData.xp,
//         },
//         { merge: true }
//       );
  
//       console.log(`Leaderboard synced for userID: ${userID}`);
//     } catch (error: unknown) {
//       if (error instanceof Error) {
//         console.error(`Error syncing leaderboard for userID: ${userID}`, error.message);
//       } else {
//         console.error(`Unknown error syncing leaderboard for userID: ${userID}`, error);
//       }
//     }
//   };