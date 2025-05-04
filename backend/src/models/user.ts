// const { admin, db } = require('../index'); 
// const admin = require('firebase-admin');
// const db = admin.firestore();

import { InventoryItem } from "./item";

export type EquippedSlots = {
    hat: string | null;
    shirt: string | null;
    pants: string | null;
};

export interface User {
    userID: string;
    userName: string; 
    email: string;
    password: string;
    xp: number;
    level: number;
    rank: string; // might need to change rank to an enum depending on if the rank system is based on the leaderboard
    streak: number;
    currentTasks: string[]; // store an array of task IDs of current tasks
    completedTasks: string[]; // store an array of task IDs of finished tasks
    unfinishedTasks: string[]; // store an array of task IDs of unfinished tasks
    achievements: string[]; // store an array of achievement IDs that the user has earned
    createdAt: FirebaseFirestore.Timestamp;
    inventory: InventoryItem[];
    equipped: EquippedSlots;
    coins: number;
    monthlyXP: {
      [month: string]: number;
    }
    lastSignInDate: FirebaseFirestore.Timestamp;
    // add in profile pictures; store them as strings here to the URL of their picture?
    // add in character fields when that is implemented
}

module.exports = {
    User: {
      userID: "",
      userName: "",
      email: "",
      password: "",
      xp: 0,
      level: 0,
      rank: "",
      streak: 0,
      currentTasks: [],
      completedTasks: [],
      unfinishedTasks: [],
      achievements: [],
      createdAt: null,
      inventory: [],
      equipped: {
        hat: null,
        shirt: null,
        pants: null
      },
      coins: 0,
      monthlyXP: {},
      lastSignInDate: null,
    }
  };