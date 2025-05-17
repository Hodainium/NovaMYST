import cron from 'node-cron';
import { admin, db } from '../index'; 
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { updateLeaderboard } from '../controllers/leaderboardController'

// This function saves last month's XP into a frozen monthlyLeaderboard collection to compare users from last month who got similar xp to you
const generateMonthlyLeaderboardSnapshot = async () => {
  console.log("Creating frozen leaderboard snapshot...");
  try {
    const usersSnapshot = await db.collection('users').get();
    const batch = db.batch();
    const now = new Date();
    const lastMonthKey = `${now.getFullYear()}-${String(now.getMonth()).padStart(2, '0')}`; // e.g., 2025-04

    usersSnapshot.forEach((userDoc: QueryDocumentSnapshot) => {
      const userData = userDoc.data();
      const userID = userDoc.id;
      const monthlyXP = userData.monthlyXP || 0;

      const frozenRef = db.collection('monthlyLeaderboard').doc(`${lastMonthKey}_${userID}`);
      batch.set(frozenRef, {
        userID,
        score: monthlyXP,
        month: lastMonthKey,
      });
    });

    await batch.commit();
    console.log("Frozen monthlyLeaderboard saved.");
  } catch (error) {
    console.error("Failed to create monthly leaderboard snapshot:", error);
  }
};
// Export the function to be called in index.ts this function will be used for the monthly reset on the leaderboard
export const startMonthlyXPResetCron = () => {
  cron.schedule('0 0 1 * *', async () => {  // reset every minute (* * * * *); reset every month (0 0 1 * *)
    console.log("Running monthly XP reset job!");

    try {
      const usersSnapshot = await db.collection('users').get();

      const batch = db.batch();
      const monthKey = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }).replace(' ', '');

      usersSnapshot.forEach((userDoc: QueryDocumentSnapshot) => {
        const userRef = db.collection('users').doc(userDoc.id);
        const userData = userDoc.data();

        const monthlyXP = userData.monthlyXP || 0;
        const monthlyXPMap = userData.monthlyXPMap || {};

        const updatedMonthlyXPMap = { 
          ...monthlyXPMap, 
          [monthKey]: monthlyXP 
        };

        batch.update(userRef, {
          monthlyXP: 0, // reset monthly XP for new month
          monthlyXPMap: updatedMonthlyXPMap, // archive XP
        });
      });

      await batch.commit();
      
      console.log("Monthly XP reset and archived into monthlyXPMap!");
      console.log("Starting leaderboard reset for all users...");
      const updatePromises = usersSnapshot.docs.map((doc: QueryDocumentSnapshot) => {
        const userId = doc.id;
        return updateLeaderboard(userId);
      });
      
      await Promise.all(updatePromises);
      await generateMonthlyLeaderboardSnapshot();
      console.log("Leaderboard reset completed!");

    } catch (error) {
      console.error("Failed monthly XP reset:", error);
    }
  });
};

