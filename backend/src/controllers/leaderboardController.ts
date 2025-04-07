import type { Request, Response } from 'express';
import admin from 'firebase-admin';
const db = admin.firestore();
import { getUserData, fetchUserData } from './userController'; 
const { User } = require('../models/user') // import user models
import * as userController from './userController';
const LEADERBOARD_COLLECTION = 'leaderboard';

/**
 * Updates the leaderboard for a given user.
 * Fetches the user's name and XP using the users controller.
 * If the user exists on the leaderboard, updates their score and last updated time.
 * If the user doesn't exist, adds a new entry.
 *
 * @param {string} userID - The unique ID of the user.
 * @returns {Promise<void>}
 */
export const updateLeaderboard = async (userID: string): Promise<void> => {
  console.log(`[LEADERBOARD UPDATE TRIGGERED] for user: ${userID}`);
  try {
    const userData = await userController.fetchUserData(userID);

    if (!userData) {
      console.error(`User data not found for ID: ${userID}. Cannot update leaderboard.`);
      return;
    }

    const { userName, xp } = userData as User; // Type assertion using the User interface

    const leaderboardRef = db.collection('leaderboard').doc(userID);
    const doc = await leaderboardRef.get();

    const updateData = {
      userName: userName,
      score: xp,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (doc.exists) {
      await leaderboardRef.update(updateData);
      console.log(`Leaderboard updated for user: ${userID}`);
    } else {
      await leaderboardRef.set({
        userID: userID,
        ...updateData,
      });
      console.log(`Leaderboard entry created for user: ${userID}`);
    }
  } catch (error: any) {
    console.error('Error updating leaderboard:', error);
    throw error;
  }
};

/**
 * Retrieves the leaderboard data, ordered by score (XP) in descending order.
 * Optionally limits the number of results based on the provided argument.
 *
 * @param {number | undefined} limit - The maximum number of leaderboard entries to retrieve.
 * @returns {Promise<Array<object>>} - An array of leaderboard entries.
 */
export const getLeaderboard = async (limit?: number): Promise<Array<object>> => {
  try {
      let query = db.collection('leaderboard').orderBy('score', 'desc');
      if (limit) {
          query = query.limit(limit);
      }
      const snapshot = await query.get();

      const leaderboardData = snapshot.docs.map(doc => ({
          id: doc.id, // Optionally include the Firestore document ID
          ...doc.data(),
      }));
      return leaderboardData;
  } catch (error: any) {
      console.error('Error fetching leaderboard:', error);
      throw error;
  }
};


// /**
//  * Initializes the leaderboard for a new user. This can be called during user registration.
//  * Fetches the new user's name and initial XP using the users controller.
//  *
//  * @param {string} userID - The unique ID of the new user.
//  * @returns {Promise<void>}
//  */
// export const initializeLeaderboardForNewUser = async (userID: string): Promise<void> => {
//   try {
//     const userData = await userController.fetchUserData(userID);

//     if (!userData) {
//       console.error(`User data not found for ID: ${userID}. Cannot initialize leaderboard.`);
//       return;
//     }

//     const { userName, xp = 0 } = userData as User; // Type assertion using the User interface

//     const leaderboardRef = db.collection('leaderboard').doc(userID);
//     const doc = await leaderboardRef.get();

//     if (!doc.exists) {
//       await leaderboardRef.set({
//         userID: userID,
//         userName: userName,
//         score: xp,
//         lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
//       });
//       console.log(`Leaderboard initialized for new user: ${userID}`);
//     } else {
//       console.log(`Leaderboard entry already exists for user: ${userID}`);
//     }
//   } catch (error: any) {
//     console.error('Error initializing leaderboard for new user:', error);
//     throw error;
//   }
// };

// /**
//  * Retrieves a specific user's rank on the leaderboard.
//  * This can be less efficient for very large leaderboards as it requires fetching all scores.
//  * Consider more optimized approaches for large scale.
//  *
//  * @param {string} userID - The unique ID of the user to find the rank for.
//  * @returns {Promise<number|null>} - The user's rank (1-based) or null if not found.
//  */
// export const getUserRank = async (userID: string): Promise<number | null> => {
//   try {
//     const snapshot = await db.collection('leaderboard')
//       .orderBy('score', 'desc')
//       .get();

//     const leaderboardData = snapshot.docs.map(doc => doc.id);
//     const rank = leaderboardData.indexOf(userID) + 1; // +1 for 1-based ranking
//     return rank === 0 ? null : rank; // Return null if not found (indexOf returns -1)
//   } catch (error: any) {
//     console.error('Error getting user rank:', error);
//     throw error;
//   }
// };

// /**
//  * Removes a user's entry from the leaderboard.
//  *
//  * @param {string} userID - The unique ID of the user to remove.
//  * @returns {Promise<void>}
//  */
// export const removeUserFromLeaderboard = async (userID: string): Promise<void> => {
//   try {
//     const leaderboardRef = db.collection('leaderboard').doc(userID);
//     await leaderboardRef.delete();
//     console.log(`Removed user ${userID} from the leaderboard.`);
//   } catch (error: any) {
//     console.error('Error removing user from leaderboard:', error);
//     throw error;
//   }
// };