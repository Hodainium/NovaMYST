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

    const { userName, xp } = userData as typeof User; // Type assertion using the User interface

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
