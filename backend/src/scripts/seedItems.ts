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
    // Default Set
    // { itemID: "default_hat", name: "Default Hat", slot: "hat", cost: 0, set: "default" },
    // { itemID: "default_shirt", name: "Default Shirt", slot: "shirt", cost: 0, set: "default" },
    // { itemID: "default_pants", name: "Default Pants", slot: "pants", cost: 0, set: "default" },
    // { itemID: "default_shoes", name: "Default Shoes", slot: "shoes", cost: 0, set: "default" },
  
    // // Knight Set
    // { itemID: "knight_helmet", name: "Knight Helmet", slot: "hat", cost: 35, set: "knight" },
    // { itemID: "knight_chest", name: "Knight Chest", slot: "shirt", cost: 35, set: "knight" },
    // { itemID: "knight_legs", name: "Knight Leggings", slot: "pants", cost: 35, set: "knight" },
    // { itemID: "knight_boots", name: "Knight Boots", slot: "shoes", cost: 35, set: "knight" },
  
    // Princess Set
//     { itemID: "princess_tiara", name: "Princess Tiara", slot: "hat", cost: 35, set: "princess" },
//     { itemID: "princess_dress", name: "Princess Dress", slot: "shirt", cost: 35, set: "princess" },
//     { itemID: "princess_stockings", name: "Princess Stockings", slot: "pants", cost: 35, set: "princess" },
//     { itemID: "princess_heels", name: "Princess Heels", slot: "shoes", cost: 35, set: "princess" },
  
//     // Cowboy Set
//     { itemID: "cowboy_hat", name: "Cowboy Hat", slot: "hat", cost: 35, set: "cowboy" },
//     { itemID: "cowboy_vest", name: "Cowboy Vest", slot: "shirt", cost: 35, set: "cowboy" },
//     { itemID: "cowboy_pants", name: "Cowboy Pants", slot: "pants", cost: 35, set: "cowboy" },
//     { itemID: "cowboy_spurs", name: "Cowboy Spurs", slot: "shoes", cost: 35, set: "cowboy" }
//   ];
  
//   async function seeditems() {
//     const collectionRef = db.collection('item_definitions');
//     for (const item of itemList) {
//       try {
//         await collectionRef.doc(item.itemID).set(item);
//         console.log(`Seeded: ${item.name}`);
//       } catch (err) {
//         console.error(`Failed to seed ${item.name}:`, err);
//       }
//     }
//     console.log('Seeding complete!');
//     process.exit(0);
//   }
  
//   seeditems();
  