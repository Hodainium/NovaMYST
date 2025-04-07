const admin = require('firebase-admin'); // we are reinitalizing firebase here; might need to change that in the future to call firebase from index file
const db = admin.firestore();
const bcrypt = require('bcryptjs');
const { User } = require('../models/user') // import user models
const { Task, difficultyConfig } = require('../models/task') // import task models
import type { Request, Response} from "express"; // have to import key words (types) for type script
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';
import fetch from 'node-fetch';
import { syncUserAchievements } from './achievementController';
import { updateLeaderboard } from './leaderboardController';

const API_URL = process.env.API_URL || "http://localhost:3000";

const GEMINI_API_KEY = 'AIzaSyAiLjiiDRYgo129Pj7k7Ba5FTel42EmAFk';
const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users'; //users

// console.log("Imported Task Model:", Task, difficultyConfig);
// Create a new task

exports.createTask = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user; // Verified Firebase user
  
      const { difficulty, title, time, dueDate } = req.body;
  
      const taskRef = db.collection("tasks").doc();
      const taskID = taskRef.id;
      const estimatedMinutes = (time?.hours || 0) * 60 + (time?.minutes || 0);
      const difficultyLevel = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 5;

      const xp = await getXPFromGemini(title, estimatedMinutes, difficultyLevel);

    //   const rewardRes = await fetch(`${API_URL}/tasks/calculateReward`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify({
    //       taskTitle: title,
    //       estimatedMinutes, // You can later replace this with real input from frontend
    //       difficulty: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 3 : 5
    //     })
    //   });
      
    //   const rewardData = await rewardRes.json();
    //   const xp = (rewardData as any).xp || 1;
  
      const newTask: Task = {
        taskID,
        title,
        assignedTo: user.uid, // secure — ignore client-provided assignedTo
        difficulty,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        isComplete: false,
        dueDate,
        xp
      };
  
      await taskRef.set(newTask);

      await syncUserAchievements(user.uid);
  
      res.status(201).json({ 
        id: taskID,
        title,
        assignedTo: user.uid,
        difficulty,
        dueDate,
        isComplete: false,
        createdAt: new Date().toISOString(),
        message: 'Task created!'
      });
  
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ error: 'Failed to create task', details: err.message });
      } else {
        res.status(500).json({ error: 'Failed to create task', details: 'Unknown error occurred' });
      }
    }
};

// List all tasks
exports.getTasks = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const snapshot = await db
        .collection(TASKS_COLLECTION)
        .where('assignedTo', '==', user.uid) // filter by user
        .get();
  
      const tasks = snapshot.docs.map((doc: QueryDocumentSnapshot) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      res.json(tasks);
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
      } else {
        res.status(500).json({ error: 'Failed to fetch tasks', details: 'Unknown error occurred' });
      }
    }
};

exports.updateTask = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const updatedData = req.body;
  
      const taskRef = db.collection(TASKS_COLLECTION).doc(id);
      const doc = await taskRef.get();
  
      if (!doc.exists || doc.data()?.assignedTo !== user.uid) {
        return res.status(403).json({ error: 'Unauthorized to update this task' });
      }
  
      const wasPreviouslyComplete = doc.data()?.isComplete === true;
      const isNowComplete = updatedData.isComplete === true;
  
      await taskRef.update(updatedData);
  
      if (!wasPreviouslyComplete && isNowComplete) {
        const updatedDoc = await taskRef.get();
        const taskXP = updatedDoc.data()?.xp || 0;

        console.log(`Granting ${taskXP} XP to user ${user.uid} for completing task ${id}`);

        const userRef = db.collection(USERS_COLLECTION).doc(user.uid);
        await userRef.update({
            xp: admin.firestore.FieldValue.increment(taskXP),
            completedTasks: admin.firestore.FieldValue.arrayUnion(id)
        });
        await syncUserAchievements(user.uid);
        // --- CALL UPDATE LEADERBOARD HERE ---
        await updateLeaderboard(user.uid);
        console.log(`Leaderboard update triggered for user: ${user.uid} on task completion.`);
        // --- END LEADERBOARD INTEGRATION ---
      }
  
      res.json({ message: 'Task updated successfully' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ error: 'Failed to update task', details: err.message });
      } else {
        res.status(500).json({ error: 'Failed to update task', details: 'Unknown error occurred' });
      }
    }
  };

exports.deleteTask = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { id } = req.params;
  
      const taskRef = db.collection(TASKS_COLLECTION).doc(id);
      const doc = await taskRef.get();
  
      if (!doc.exists || doc.data()?.assignedTo !== user.uid) {
        return res.status(403).json({ error: 'Unauthorized to delete this task' });
      }
  
      await taskRef.delete();
      res.json({ message: 'Task deleted successfully' });
    } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ error: 'Failed to delete task', details: err.message });
      } else {
        res.status(500).json({ error: 'Failed to delete task', details: 'Unknown error occurred' });
      }
    }
};

export const getXPFromGemini = async (taskTitle: string, estimatedMinutes: number, difficulty: number): Promise<number> => {
    const prompt = `Given a task with the following details:
  - Description: ${taskTitle}
  - Estimated time: ${estimatedMinutes} minutes
  - Self-assigned difficulty: ${difficulty} (1-5)
  
  Assign an appropriate XP value between 1 and 100,000, considering task complexity, time, and difficulty. Please provide the XP value as a number.
  
  The XP value should be consistent across different runs for the same input. If you generate multiple responses, ensure that the XP value is consistent each time.
  
  Example tasks:
  1. Task: Doing the dishes
     Estimated time: 15 minutes
     Difficulty: 1
     XP: 100
  
  2. Task: Studying for an exam
     Estimated time: 120 minutes
     Difficulty: 3
     XP: 2500
  
  3. Task: Writing a report
     Estimated time: 60 minutes
     Difficulty: 2
     XP: 500
  
  4. Task: Buying a house
     Estimated time: 50000 minutes
     Difficulty: 5
     XP: 100000
  
  5. Task: Having a baby
     Estimated time: 525600 minutes (1 year)
     Difficulty: 5
     XP: 100000
  
  Now, process the following task:
  Task: ${taskTitle}
  Estimated time: ${estimatedMinutes} minutes
  Difficulty: ${difficulty}
  `;
  
    console.log("🚀 Calling Gemini with:", { taskTitle, estimatedMinutes, difficulty });
  
    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          generationConfig: { temperature: 0 },
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });
  
      const data = await geminiRes.json();
      const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      const xpMatch = outputText?.match(/(\d{1,6})/); // match first 1-6 digit number
      const xp = xpMatch ? parseInt(xpMatch[1], 10) : null;
  
      console.log("🔎 Gemini raw output:", outputText);
      console.log(`✅ Assigned XP: ${xp} for task "${taskTitle}"`);
  
      return xp || 1; // Fallback to 1 if parsing fails
    } catch (err: any) {
      console.error("❌ Gemini API call failed:", err);
      return 1; // Fallback XP in case of error
    }
};

exports.calculateReward = async (req: Request, res: Response) => {
    const { taskTitle, estimatedMinutes, difficulty } = req.body;
  
    const prompt = `Given a task with the following details:
  - Description: ${taskTitle}
  - Estimated time: ${estimatedMinutes} minutes
  - Self-assigned difficulty: ${difficulty} (1-5)
  
  Assign an appropriate XP value between 1 and 100,000, considering task complexity, time, and difficulty. Please provide the XP value as a number.
  
  The XP value should be consistent across different runs for the same input. If you generate multiple responses, ensure that the XP value is consistent each time.
  
  Example tasks:
  1. Task: Doing the dishes
     Estimated time: 15 minutes
     Difficulty: 1
     XP: 100
  
  2. Task: Studying for an exam
     Estimated time: 120 minutes
     Difficulty: 3
     XP: 2500
  
  3. Task: Writing a report
     Estimated time: 60 minutes
     Difficulty: 2
     XP: 500
  
  4. Task: Buying a house
     Estimated time: 50000 minutes
     Difficulty: 5
     XP: 100000
  
  5. Task: Having a baby
     Estimated time: 525600 minutes (1 year)
     Difficulty: 5
     XP: 100000
  
  Now, process the following task:
  Task: ${taskTitle}
  Estimated time: ${estimatedMinutes} minutes
  Difficulty: ${difficulty}
  `;

  console.log("🚀 Calling Gemini with:", { taskTitle, estimatedMinutes, difficulty });

    try {
      const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          generationConfig: {
            temperature: 0
          },
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });
  
      const data = await geminiRes.json() as any;
      const outputText = data.candidates?.[0]?.content?.parts?.[0]?.text;
  
      const xpMatch = outputText?.match(/(\d{1,6})/); // match 1-6 digit number
      const xp = xpMatch ? parseInt(xpMatch[1], 10) : null;
  
      if (!xp) {
        return res.status(400).json({ error: 'Could not extract XP value from Gemini response.', raw: outputText });
      }

      res.json({ xp, raw: outputText });
      console.log("Gemini raw output:", outputText);
      console.log(`Assigned XP: ${xp} for task "${taskTitle}"`);
    } catch (err: any) {
      console.error("Gemini API call failed:", err);
      res.status(500).json({ error: 'Gemini API call failed', details: err.message });
    }
};

exports.registerUser = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name } = req.body;
  
      const userRef = db.collection("users").doc(user.uid);
      const userSnap = await userRef.get();
  
      if (!userSnap.exists) {
        const newUser = {
          userID: user.uid,
          userName: name || user.name || "Anonymous",
          email: user.email,
          xp: 0,
          level: 0,
          rank: "bronze",
          streak: 0,
          coins: 0,
          currentTasks: [],
          completedTasks: [],
          unfinishedTasks: [],
          achievements: [],
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        };
  
        await userRef.set(newUser);
        await syncUserAchievements(user.uid);
        return res.status(201).json({ message: 'User document created!' });
      }
  
      res.status(200).json({ message: 'User already exists. No update needed.' });
    } catch (err: any) {
      res.status(500).json({ error: 'Failed to create user', details: err.message });
    }
};

exports.testdb = async (req: Request, res: Response) => {
  try {
    const snapshot = await db.collection(USERS_COLLECTION).get(); // Test collection
    const users = snapshot.docs.map((doc: QueryDocumentSnapshot) => doc.data());
    res.status(200).json(users);
  } catch (error: unknown) {
      if (error instanceof Error) {
        res.status(500).json({ error: 'Firestore connection failed', details: error.message });
      } else {
        res.status(500).json({ error: 'Firestore connection failed', details: 'Unknown error occurred' });
    }
  }
};