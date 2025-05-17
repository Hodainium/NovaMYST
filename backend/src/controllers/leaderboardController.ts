import type { Request, Response } from 'express';
import { admin, db } from '../index';
import * as userController from './userController';
import { Query, QueryDocumentSnapshot } from 'firebase-admin/firestore';

const LEADERBOARD_COLLECTION = 'leaderboard';
const MONTHLY_LEADERBOARD_COLLECTION = 'monthlyLeaderboards';
const USERS_COLLECTION = 'users';
const FRIENDS_COLLECTION = 'friends';

// Helper to attach usernames from users/{uid} 
const attachUsernames = async (
  docs: FirebaseFirestore.QueryDocumentSnapshot[]
): Promise<object[]> => {
  return await Promise.all(
    docs.map(async (doc) => {
      const data = doc.data();
      const userSnap = await db.collection(USERS_COLLECTION).doc(data.userID).get();
      const userName = userSnap.exists ? userSnap.data()?.userName || "Unknown" : "Unknown";
      return {
        id: doc.id,
        ...data,
        userName,
      };
    })
  );
};

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
      score: monthlyXP,
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

// Get global leaderboard (top 20 monthly XP)
export const getGlobalLeaderboard = async (): Promise<object[]> => {
  try {
    const snapshot = await db
      .collection(LEADERBOARD_COLLECTION)
      .orderBy('score', 'desc')
      .limit(20)
      .get();

    return await attachUsernames(snapshot.docs);
  } catch (error) {
    console.error('Error fetching global leaderboard:', error);
    throw error;
  }
};

// get friend leaderboard 
export const getFriendLeaderboard = async (userID: string): Promise<object[]> => {
  console.log(`[FriendLeaderboard] Fetching leaderboard for user: ${userID}`);

  const snapshot1 = await db.collection(FRIENDS_COLLECTION)
    .where('status', '==', 'accepted')
    .where('requesterId', '==', userID)
    .get();

  const snapshot2 = await db.collection(FRIENDS_COLLECTION)
    .where('status', '==', 'accepted')
    .where('recipientId', '==', userID)
    .get();

  const allDocs = [...snapshot1.docs, ...snapshot2.docs];
  const friendIDs = new Set<string>();
  friendIDs.add(userID); // include self

  for (const doc of allDocs) {
    const data = doc.data();
    const inviteStatus = data.leaderboardInvite;
    const requester = data.requesterId;
    const recipient = data.recipientId;

    if (inviteStatus === 'mutual') {
      friendIDs.add(requester);
      friendIDs.add(recipient);
    }
  }

  const uniqueIDs = [...friendIDs];
  if (uniqueIDs.length === 0) return [];

  // Firestore only allows max 10 values in "in" queries per batch
  const batches: string[][] = [];
  while (uniqueIDs.length) batches.push(uniqueIDs.splice(0, 10));

  const results: FirebaseFirestore.QueryDocumentSnapshot[] = [];

  for (const batch of batches) {
    const snap = await db.collection(LEADERBOARD_COLLECTION)
      .where(admin.firestore.FieldPath.documentId(), 'in', batch)
      .orderBy('score', 'desc')
      .get();
    results.push(...snap.docs);
  }

  return await attachUsernames(results);
};

// get leaderboard from document created in cron file
export const getFrozenSimilarXPLeaderboard = async (userID: string): Promise<object[]> => {
  try {
    const userDoc = await db.collection(USERS_COLLECTION).doc(userID).get();
    const userData = userDoc.data();
    if (!userData) throw new Error('User data not found');

    const now = new Date();
    const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthKey = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

    const myXP = userData.monthlyXPMap?.[lastMonthKey] || 0;
    const lowerBound = Math.max(myXP * 0.9, myXP - 50);
    const upperBound = myXP * 1.1 + 50;

    const frozenSnapshot = await db.collection("monthlyLeaderboard")
      .where("month", "==", lastMonthKey)
      .where("score", ">=", lowerBound)
      .where("score", "<=", upperBound)
      .orderBy("score", "desc")
      .get();

    const docs = frozenSnapshot.docs;

    // Ensure the user is included in the frozen list 
    const alreadyIncluded = docs.some((doc: QueryDocumentSnapshot) => doc.id === userID);
    if (!alreadyIncluded) {
      const selfDoc = await db.collection("monthlyLeaderboard").doc(userID).get();
      if (selfDoc.exists && selfDoc.data()?.month === lastMonthKey) {
        docs.push(selfDoc);
      }
    }

    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const enrichedDocs = await Promise.all(
      docs.map(async (doc: QueryDocumentSnapshot) => {
        const frozenData = doc.data();
        const userId = frozenData.userID;

        const userSnap = await db.collection(USERS_COLLECTION).doc(userId).get();
        const liveXP = userSnap.exists
          ? userSnap.data()?.monthlyXP?.[currentMonthKey] ?? 0
          : 0;

        const userName = userSnap.exists
          ? userSnap.data()?.userName ?? "Unknown"
          : "Unknown";

        return {
          userID: userId,
          userName,
          score: liveXP,
        };
      })
    );

    // Sort based on live XP
    enrichedDocs.sort((a, b) => b.score - a.score);

    return enrichedDocs;
  } catch (error) {
    console.error("Error fetching frozen similar leaderboard:", error);
    throw error;
  }
};
