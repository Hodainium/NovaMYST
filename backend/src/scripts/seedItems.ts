// import * as admin from 'firebase-admin';
// import * as dotenv from 'dotenv';
// dotenv.config();

// // Firebase initialization
// const serviceAccount = require('../../firebase-service-account.json');

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
// });

// const db = admin.firestore();

// const itemList = [
//   {
//     itemID: "testItem",
//     name: "Test Item",
//     emoji: "🔧",
//     slot: "hat",
//     cost: 0
//   }
// ];

// async function seeditems() {
//   const collectionRef = db.collection('item_definitions');

//   for (const item of itemList) {
//     try {
//       await collectionRef.doc(item.itemID).set(item);
//       console.log(`Seeded: ${item.name}`);
//     } catch (err) {
//       console.error(`Failed to seed ${item.name}:`, err);
//     }
//   }

//   console.log('✅ Seeding complete!');
//   process.exit(0);
// }

// seeditems();
