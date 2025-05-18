// import * as admin from 'firebase-admin';
// import * as dotenv from 'dotenv';
// dotenv.config();

// // Firebase initialization
// const serviceAccount = require('../../firebase-service-account.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// const achievementList = [
//   {
//     achievementID: 'first_ten',
//     icon: '🔥',
//     name: 'Ten Completed',
//     description: 'You have completed 10 tasks.',
//     goalNum: 10,
//     goalType: 'taskCompletion',
//     rewardType: 'coins',
//     rewardValue: 100,
//   }
// ];

// async function seedAchievements() {
//   const collectionRef = db.collection('achievement_definitions');

//   for (const achievement of achievementList) {
//     try {
//       await collectionRef.doc(achievement.achievementID).set(achievement);
//       console.log(`Seeded: ${achievement.name}`);
//     } catch (err) {
//       console.error(`Failed to seed ${achievement.name}:`, err);
//     }
//   }

//   console.log('Seeding complete!');
//   process.exit(0);
// }

// seedAchievements();
