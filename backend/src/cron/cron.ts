import cron from 'node-cron';
import { admin, db } from '../index'; 
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import { updateLeaderboard } from '../controllers/leaderboardController'

// Export the function to be called in index.ts
export const startMonthlyXPResetCron = () => {
  cron.schedule('0 0 1 * *', async () => {  // reset every month
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
      
      console.log("Leaderboard reset completed!");

    } catch (error) {
      console.error("Failed monthly XP reset:", error);
    }
  });
};

