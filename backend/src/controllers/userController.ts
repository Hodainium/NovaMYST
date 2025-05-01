import type { Request, Response } from 'express';
const admin = require('firebase-admin'); // we are reinitalizing firebase here; might need to change that in the future to call firebase from index file
const db = admin.firestore();
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';

export function calculateStamina(lastSignInDate: Timestamp, currentStamina: number): { newStamina: number, newTimestamp: Timestamp } {
  const now = Timestamp.now();
  const msElapsed = now.toMillis() - lastSignInDate.toMillis();
  const staminaGained = Math.floor(msElapsed / (5 * 1000)); // 2 per 1 minute 0.5 * 60 * 1000

  return {
    newStamina: Math.min(currentStamina + staminaGained, 9999),
    newTimestamp: now
  };
}

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

export const getUserStamina = async (req: Request, res: Response) => {
    try {
        const user = (req as any).user;
        const userRef = db.collection('users').doc(user.uid);
        const userSnap = await userRef.get();
        const userData = userSnap.data();

        const { newStamina, newTimestamp } = calculateStamina(userData.lastSignInDate, userData.stamina || 0);

        await userRef.update({
        stamina: newStamina,
        lastSignInDate: newTimestamp
        });

        res.json({ stamina: newStamina });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch stamina" });
    }
};

export const consumeStamina = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const { difficulty } = req.body;
      const cost = difficulty === 'easy' ? 30 : difficulty === 'medium' ? 60 : 90;
  
      const userRef = db.collection('users').doc(user.uid);
      const userSnap = await userRef.get();
      const userData = userSnap.data();
      const currentStamina = userData.stamina || 0;
  
      if (currentStamina < cost) {
        res.status(400).json({ error: "Not enough stamina" });
      }
  
      await userRef.update({
        stamina: currentStamina - cost
      });
  
      res.json({ message: `Consumed ${cost} stamina`, remaining: currentStamina - cost });
    } catch (err) {
      res.status(500).json({ error: "Failed to consume stamina" });
    }
};