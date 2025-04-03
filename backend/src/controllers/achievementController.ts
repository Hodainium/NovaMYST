import type { Request, Response } from 'express';
const admin = require('firebase-admin'); // we are reinitalizing firebase here; might need to change that in the future to call firebase from index file
const db = admin.firestore();
import { Achievement, AchievementProgress } from '../models/achievement';
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

export const syncUserAchievements = async (userID: string) => {
  const userRef = db.collection('users').doc(userID);
  const userSnap = await userRef.get();

  if (!userSnap.exists) return;

  const userData = userSnap.data();
  const existingProgress: AchievementProgress[] = userData?.achievements || [];

  const allAchievementsSnap = await db.collection('achievement_definitions').get();
  const allAchievements = allAchievementsSnap.docs.map((doc: QueryDocumentSnapshot) => doc.data() as Achievement);

  const updatedProgress: AchievementProgress[] = [...existingProgress];

  for (const achievement of allAchievements) {
    let progress = updatedProgress.find(p => p.achievementID === achievement.achievementID);
  
    if (!progress) {
      progress = {
        achievementID: achievement.achievementID,
        current: 0,
        completed: false,
        claimed: false,
      };
      updatedProgress.push(progress);
    }
  
    if (progress.completed) continue;
  
    if (achievement.goalType === 'taskCompletion') {
      const taskSnapshot = await db.collection('tasks')
        .where('assignedTo', '==', userID)
        .where('isComplete', '==', true)
        .get();
  
      progress.current = taskSnapshot.size;
    }
  
    if (achievement.goalType === 'xpGained') {
      progress.current = userData?.xp || 0;
      console.log(`User XP: ${userData?.xp}`);
    }
  
    if (achievement.goalType === 'hardTasks') {
      const hardTaskSnap = await db.collection('tasks')
        .where('assignedTo', '==', userID)
        .where('difficulty', '==', 'hard')
        .where('isComplete', '==', true)
        .get();
  
      progress.current = hardTaskSnap.size;
    }
  
    // Update completion flag (only if it wasn't already completed)
    progress.completed = progress.current >= achievement.goalNum;
  }

  await userRef.update({ achievements: updatedProgress });
};

export const getUserAchievements = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = (req as any).user;
      const userID: string = user.uid;
  
      await syncUserAchievements(userID);
  
      const userRef = db.collection('users').doc(userID);
      const userSnap = await userRef.get();
  
      if (!userSnap.exists) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
  
      const userData = userSnap.data();
      const progressArray: AchievementProgress[] = userData?.achievements || [];
  
      const definitionsSnap = await db.collection('achievement_definitions').get();
      const definitions: Achievement[] = definitionsSnap.docs.map(
        (doc: QueryDocumentSnapshot<Achievement>) => doc.data()
      );
  
      const merged = definitions.map(def => {
        const progress = progressArray.find(p => p.achievementID === def.achievementID) || {
          achievementID: def.achievementID,
          current: 0,
          completed: false,
          claimed: false,
        };
  
        return {
          ...def,
          ...progress,
        };
      });
  
      res.json(merged);
    } catch (err) {
      console.error("Error in getUserAchievements:", err);
      res.status(500).json({ error: "Internal server error" });
    }
};

export const claimAchievement = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { achievementID } = req.params;
  
      const userRef = db.collection('users').doc(user.uid);
      const userDoc = await userRef.get();
  
      if (!userDoc.exists) res.status(404).json({ error: 'User not found' });
  
      const userData = userDoc.data();
      const achievements = userData?.achievements || [];
  
      const target = achievements.find((a: any) => a.achievementID === achievementID);
      if (!target || !target.completed || target.claimed) {
        res.status(400).json({ error: 'Cannot claim this achievement' });
      }
  
      // Mark as claimed
      target.claimed = true;
  
      // Fetch reward from definitions
      const defSnap = await db.collection('achievement_definitions').doc(achievementID).get();
      const def = defSnap.data();
      if (!def) res.status(404).json({ error: 'Achievement definition not found' });
  
      // Update user data with reward
      const update: any = {
        achievements,
      };
      if (def.rewardType === 'xp') {
        update.xp = admin.firestore.FieldValue.increment(def.rewardValue || 0);
      } else if (def.rewardType === 'coins') {
        update.coins = admin.firestore.FieldValue.increment(def.rewardValue || 0);
      }
  
      await userRef.update(update);
  
      res.status(200).json({ message: 'Achievement claimed successfully', reward: def.rewardValue, rewardType: def.rewardType });
    } catch (err) {
      console.error("Error claiming achievement:", err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };