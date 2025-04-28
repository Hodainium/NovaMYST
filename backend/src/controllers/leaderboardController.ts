import type { Request, Response } from 'express';
// import admin from 'firebase-admin';
// const db = admin.firestore();
import { admin, db } from '../index'; 
import * as userController from './userController';
const LEADERBOARD_COLLECTION = 'leaderboard';

// --- Update leaderboard for a user ---
export const updateLeaderboard = async (userID: string): Promise<void> => {
  console.log(`[LEADERBOARD UPDATE] for user: ${userID}`);
  try {
    const userData = await userController.fetchUserData(userID);
    if (!userData) {
      console.error(`User not found: ${userID}`);
      return;
    }

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthlyXP = userData.monthlyXP?.[monthKey] || 0;

    const leaderboardRef = db.collection(LEADERBOARD_COLLECTION).doc(userID);
    const doc = await leaderboardRef.get();

    const updateData = {
      userName: userData.userName ?? 'Unknown User',
      score: monthlyXP, // Always use monthlyXP
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (doc.exists) {
      await leaderboardRef.update(updateData);
    } else {
      await leaderboardRef.set({ userID, ...updateData });
    }
  } catch (error: any) {
    console.error('Error updating leaderboard:', error);
    throw error;
  }
};

// --- Get Global Leaderboard (Top 20 Monthly XP) ---
export const getGlobalLeaderboard = async (): Promise<object[]> => {
  try {
    const snapshot = await db
      .collection(LEADERBOARD_COLLECTION)
      .orderBy('score', 'desc')
      .limit(20)
      .get();

    return snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    throw error;
  }
};

// --- Get Similar XP Leaderboard ---
export const getSimilarXPLeaderboard = async (userID: string): Promise<object[]> => {
  try {
    const userData = await userController.fetchUserData(userID);
    if (!userData) throw new Error('User data not found.');

    const now = new Date();
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const myXP = userData.monthlyXP?.[monthKey] || 0;

    const lowerBound = Math.max(myXP * 0.9, myXP - 50); // query for the XP range decided to go
    const upperBound = myXP * 1.1 + 50;

    const snapshot = await db.collection(LEADERBOARD_COLLECTION)
      .where('score', '>=', lowerBound)
      .where('score', '<=', upperBound)
      .orderBy('score', 'desc')
      .limit(20)
      .get();

    return snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot)  => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error fetching similar XP leaderboard:', error);
    throw error;
  }
};
