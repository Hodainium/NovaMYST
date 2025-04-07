import type { Request, Response } from 'express';
const admin = require('firebase-admin'); // we are reinitalizing firebase here; might need to change that in the future to call firebase from index file
const db = admin.firestore();
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const getUserData = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userRef = db.collection('users').doc(user.uid);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnap.data();
    const { xp = 0, coins = 0 } = userData;

    res.status(200).json({ xp, coins });
  } catch (err) {
    console.error("Error fetching user data:", err);
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
};

// Helper function I added
export const fetchUserData = async (userID: string) => {
  try {
    const userRef = db.collection('users').doc(userID);
    const userSnap = await userRef.get();

    if (!userSnap.exists) {
      console.error(`User not found: ${userID}`);
      return null;
    }

    return userSnap.data();
  } catch (err) {
    console.error("Error fetching user data:", err);
    throw err;
  }
};