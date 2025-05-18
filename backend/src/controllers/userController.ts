import type { Request, Response } from 'express';
const admin = require('firebase-admin'); 
const db = admin.firestore();
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { Timestamp } from 'firebase-admin/firestore';
import { updateLeaderboard } from './leaderboardController';

export function calculateStamina(lastSignInDate: Timestamp, currentStamina: number): { newStamina: number, newTimestamp: Timestamp } {
  const now = Timestamp.now();
  const msElapsed = now.toMillis() - lastSignInDate.toMillis();
  const staminaGained = Math.floor(msElapsed / (5 * 1000));

  const testStamina = Math.min(currentStamina + staminaGained, 9999);
  console.log("Stamina Regen Debug:");
  console.log("Last sign-in:", lastSignInDate.toDate());
  console.log("Now:", now.toDate());
  console.log("Elapsed (ms):", msElapsed);
  console.log("Stamina gained:", staminaGained);
  console.log("New stamina:", testStamina);

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
      return res.status(404).json({ error: 'User not found' });
    }

    const userData = userSnap.data();
    const { xp = 0, coins = 0, streak = 0 } = userData || {};

    res.status(200).json({ xp, coins, streak });
  } catch (err) {
    console.error("Error fetching user data:", err);
    return res.status(500).json({ error: 'Failed to fetch user data' });
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

        let stamina = 0;
        let lastSignInDate = Timestamp.now();

        if (!userData.lastSignInDate || userData.stamina == null) {
            console.log("New user detected. Initializing with default stamina.");
            stamina = 1000;
        } 
        else 
        {
            const result = calculateStamina(userData.lastSignInDate, userData.stamina);
            stamina = result.newStamina;
            lastSignInDate = result.newTimestamp;
        }

        await userRef.update({
            stamina,
            lastSignInDate
        });

        res.json({ stamina });
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

export const updateUsername = async (req: Request, res: Response) => {
  const uid = (req as any).user.uid;
  const { newUsername } = req.body;

  if (!newUsername || typeof newUsername !== "string" || newUsername.trim() === "") {
    return res.status(400).json({ error: "Invalid username." });
  }

  const trimmedName = newUsername.trim();
  const lowercaseName = trimmedName.toLowerCase();

  try {
    // Check if lowercase version already exists (excluding self)
    const existingSnap = await db.collection("users")
      .where("userName", "==", lowercaseName)
      .get();

    const conflict = existingSnap.docs.find((doc: QueryDocumentSnapshot) => doc.id !== uid);
    if (conflict) {
      return res.status(409).json({ error: "Username already taken." });
    }

    // Update username in Firestore (store as-is)
    await db.collection("users").doc(uid).update({
      userName: trimmedName,
    });

    // Optional: Update displayName in Firebase Auth
    await admin.auth().updateUser(uid, {
      displayName: trimmedName,
    });

    // Optional: Refresh leaderboard (fetches username dynamically anyway)
    await updateLeaderboard(uid);

    res.status(200).json({ message: "Username updated successfully." });
  } catch (err: any) {
    console.error("Error updating username:", err);
    res.status(500).json({ error: "Failed to update username", details: err.message });
  }
};

export const deleteAccount = async (req: Request, res: Response) => {
  const uid = (req as any).user.uid;

  try {
    // Delete user document
    await db.collection("users").doc(uid).delete();

    // Optionally: delete related tasks
    const tasksSnapshot = await db.collection("tasks").where("assignedTo", "==", uid).get();
    const batch = db.batch();
    tasksSnapshot.forEach((doc: QueryDocumentSnapshot) => batch.delete(doc.ref));
    await batch.commit();

    // Optionally: delete friendships
    const friendSnap = await db.collection("friends")
      .where("requesterId", "in", [uid])
      .get();
    const friendSnap2 = await db.collection("friends")
      .where("recipientId", "in", [uid])
      .get();
    const allFriendDocs = [...friendSnap.docs, ...friendSnap2.docs];
    const friendBatch = db.batch();
    allFriendDocs.forEach(doc => friendBatch.delete(doc.ref));
    await friendBatch.commit();

    res.status(200).json({ message: "User data deleted from Firestore." });
  } catch (err: any) {
    console.error("Error deleting user data:", err);
    res.status(500).json({ error: "Failed to delete user data." });
  }
};

export const getCharacterData = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const userRef = db.collection('users').doc(user.uid);
      const userSnap = await userRef.get();
  
      if (!userSnap.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const userData = userSnap.data();
  
      const itemSnap = await db.collection('item_definitions').get();
      const shopItems = itemSnap.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => doc.data());
  
      return res.json({
        coins: userData.coins || 0,
        inventory: userData.inventory || [],
        equipped: userData.equipped || { hat: null, shirt: null, pants: null },
        shopItems,
        gender: userData.gender || "Male"
      });
    } catch (err) {
      console.error("Failed to fetch character data:", err);
      return res.status(500).json({ error: 'Failed to fetch character data' });
    }
};

export const updateGender = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { gender } = req.body;
  
      if (!["Male", "Female"].includes(gender)) {
        return res.status(400).json({ error: "Invalid gender value" });
      }
  
      const userRef = db.collection("users").doc(user.uid);
      await userRef.update({ gender });
      res.json({ success: true });
    } catch (err) {
      console.error("Failed to update gender:", err);
      res.status(500).json({ error: "Failed to update gender" });
    }
};