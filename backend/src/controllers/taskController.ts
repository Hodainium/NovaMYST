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
import { calculateStamina } from './userController';

const API_URL = process.env.API_URL || "http://localhost:3000";

const GEMINI_API_KEY = 'AIzaSyAiLjiiDRYgo129Pj7k7Ba5FTel42EmAFk';
const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users'; //users

// console.log("Imported Task Model:", Task, difficultyConfig);
// Create a new task

exports.createTask = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { title, time, dueDate } = req.body;
  
      const taskRef = db.collection("tasks").doc();
      const taskID = taskRef.id;
  
      const estimatedMinutes = (time?.hours || 0) * 60 + (time?.minutes || 0);
      const rawDifficulty = await getDifficultyFromGemini(title, estimatedMinutes);
  
      if (rawDifficulty === 'unclear') {
        return res.status(400).json({ error: 'Task is too vague. Please rewrite.' });
      }
  
      const { difficultyConfig } = require('../models/task');
  
      if (!difficultyConfig[rawDifficulty]) {
        return res.status(400).json({ error: 'Unsupported difficulty level assigned by Gemini.' });
      }
  
      const xp = difficultyConfig[rawDifficulty].xp;
  
      const newTask: Task = {
        taskID,
        title,
        assignedTo: user.uid,
        difficulty: rawDifficulty,
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
        difficulty: rawDifficulty,
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
        const now = new Date(); // Real Date object


        await taskRef.update({
          ...updatedData,
          completedAt: now
        });
      
        const updatedDoc = await taskRef.get();
        const taskData = updatedDoc.data();
        const taskXP = taskData?.xp || 0;
        const difficulty = taskData?.difficulty || 'easy';
  
        const userRef = db.collection(USERS_COLLECTION).doc(user.uid);
        const userSnap = await userRef.get();
        const userData = userSnap.data();
  
        if (!userData) {
          throw new Error('User data not found while updating task XP');
        }

        const stamina = userData.stamina ?? 0;
        const staminaCost =
          difficulty === 'easy' ? 30 :
          difficulty === 'medium' ? 60 :
          90;
  
        const updates: any = {
          completedTasks: admin.firestore.FieldValue.arrayUnion(id)
        };

          // --- STREAK UPDATE ---
        const lastStreakDateRaw = userData.lastStreakDate;
        const lastStreakDate = lastStreakDateRaw instanceof admin.firestore.Timestamp
          ? lastStreakDateRaw.toDate()
          : lastStreakDateRaw ?? null;

        const today = new Date(now.toDateString()); // strip time
        const lastDate = lastStreakDate ? new Date(lastStreakDate.toDateString()) : null;

        let newStreak = 1;
        if (lastDate) {
          const diffInDays = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
          if (diffInDays === 1) {
            newStreak = (userData.streak || 0) + 1;
          } else if (diffInDays > 1) {
            newStreak = 0;
          } else {
            newStreak = userData.streak || 1;
          }
        }

        updates.streak = newStreak;
        updates.lastStreakDate = admin.firestore.Timestamp.fromDate(now);
  
        if (stamina >= staminaCost) {
          const now = new Date();
          const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const monthlyXP = userData.monthlyXP || {};
          monthlyXP[monthKey] = (monthlyXP[monthKey] || 0) + taskXP;
  
          updates.xp = admin.firestore.FieldValue.increment(taskXP);
          updates.stamina = stamina - staminaCost;
          updates.monthlyXP = monthlyXP;
  
          await userRef.update(updates);
          await syncUserAchievements(user.uid);
          await updateLeaderboard(user.uid);
          console.log(`✅ Task ${id} complete — granted ${taskXP} XP, -${staminaCost} stamina to ${user.uid}`);
        } else {
          await userRef.update(updates);
          console.log(`⚠️ Task ${id} completed with no XP (insufficient stamina: ${stamina}/${staminaCost})`);
        }
      }
  
      res.json({ message: 'Task updated successfully' });
    } catch (err: unknown) {
      // console.error("Failed to update task:", err); // test
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

exports.registerUser = async (req: Request, res: Response) => {
    try {
      const user = (req as any).user;
      const { name } = req.body;
  
      const userRef = db.collection("users").doc(user.uid);
      const userSnap = await userRef.get();

      const currentTime = admin.firestore.FieldValue.serverTimestamp();
      const getCurrentMonthKey = () => {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      };
          // no duplicate username check
      const chosenName = name || user.name || "Anonymous";
      const lowercaseName = chosenName.trim().toLowerCase();

      // Check for duplicate (case-insensitive)
      const existingNameSnap = await db.collection("users")
        .where("userName", "==", lowercaseName)
        .limit(1)
        .get();

      if (!existingNameSnap.empty) {
        return res.status(409).json({ error: "Username already taken (case-insensitive)." });
      }

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
          createdAt: currentTime,
          monthlyXP: {
            [getCurrentMonthKey()]: 0
          },
          lastSignInDate: currentTime
        };
  
        await userRef.set(newUser);
        await syncUserAchievements(user.uid);
        // Update leaderboard after user is created
        await updateLeaderboard(user.uid);
        return res.status(201).json({ message: 'User document created!' });
      }

      const userData = userSnap.data();
      const currentStamina = userData?.stamina || -1;
      const lastSignInDate = userData?.lastSignInDate;
      
      if (lastSignInDate && currentStamina != -1) {
        const { newStamina, newTimestamp } = calculateStamina(lastSignInDate, currentStamina);
      
        await userRef.update({
          stamina: newStamina,
          lastSignInDate: newTimestamp
        });
      
        console.log("Stamina updated:", newStamina);
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

export const getDifficultyFromGemini = async (
    taskTitle: string,
    estimatedMinutes: number
  ): Promise<'easy' | 'medium' | 'medium-hard' | 'hard' | 'very-hard' | 'unclear'> => {
    const prompt = `You are an assistant that classifies user-submitted tasks into difficulty levels for a motivational task tracking app.
  
  Given:
  - Task description: ${taskTitle}
  - Estimated time: ${estimatedMinutes} minutes
  
  Return a JSON object like one of the following:
  
  For valid tasks:
  {
    "status": "ok",
    "difficulty": "easy" | "medium" | "medium-hard" | "hard" | "very-hard"
  }
  
  For vague or garbage tasks (e.g. "asdf", "123", "hi", "a"):
  {
    "status": "error",
    "message": "Task unclear. Please rewrite."
  }
  
  Always respond with only the JSON object. Do not include any additional text or explanation.
  
  Examples:

    // Easy
    Task: Take out the trash — 10 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Water houseplants — 5 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Send a thank you email — 10 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Wash a single dish — 3 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Make your bed — 4 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Sort 5 emails into folders — 6 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Refill water bottle — 2 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Walk around the block — 10 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Feed the cat — 5 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Stretch for a few minutes — 7 minutes
    → { "status": "ok", "difficulty": "easy" }

    Task: Take a shower — 30 minutes
    → { "status": "ok", "difficulty": "easy" }

    // Medium
    Task: Clean your desk — 25 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Fold and put away laundry — 30 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Review lecture notes — 40 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Schedule a doctor’s appointment — 20 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Update resume — 45 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Cook a simple meal — 30 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Backup your phone — 25 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Study flashcards — 30 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Call the bank for an account inquiry — 35 minutes
    → { "status": "ok", "difficulty": "medium" }

    Task: Watch a tutorial video and take notes — 45 minutes
    → { "status": "ok", "difficulty": "medium" }

    // Medium-Hard
    Task: Deep clean the kitchen — 90 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Draft a 2-page essay — 75 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Apply to 3 job postings — 90 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Pack for a weekend trip — 60 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Compare renters insurance plans — 90 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Reorganize your workspace — 80 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Set up budget in a spreadsheet — 70 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Edit a 5-minute video — 90 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Install and configure a new router — 75 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    Task: Practice a speech — 90 minutes
    → { "status": "ok", "difficulty": "medium-hard" }

    // Hard
    Task: File taxes with deductions — 120 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Study 3 textbook chapters — 150 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Fix a bike chain — 100 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Write a research outline — 130 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Troubleshoot WiFi for your house — 120 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Clean and detail a car interior — 140 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Complete a long online form (e.g. FAFSA) — 150 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Build IKEA furniture — 120 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Prepare presentation slides — 100 minutes
    → { "status": "ok", "difficulty": "hard" }

    Task: Research for a term paper — 150 minutes
    → { "status": "ok", "difficulty": "hard" }

    // Very-Hard
    Task: Create a portfolio website from scratch — 240 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Write and edit a 10-page essay — 300 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Migrate files from one PC to another and set up everything — 360 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Create a business plan — 300 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Study for final exams — 300 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Organize a community event — 400 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Rewire a home network — 360 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Write a short story — 300 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Apply to multiple graduate programs — 400 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    Task: Do a complete apartment move — 480 minutes
    → { "status": "ok", "difficulty": "very-hard" }

    // Error / Garbage
    Task: lol — 5 minutes
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: a — 1 minute
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: 123456 — 3 minutes
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: . — 1 minute
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: [empty string] — 0 minutes
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: hi — 1 minute
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: ? — 2 minutes
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: asdfgh — 1 minute
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: thing — 1 minute
    → { "status": "error", "message": "Task unclear. Please rewrite." }

    Task: random — 1 minute
    → { "status": "error", "message": "Task unclear. Please rewrite." }
  
  Now evaluate:
  Task: ${taskTitle}  
  Estimated time: ${estimatedMinutes} minutes`;
  
    console.log("🚀 Calling Gemini with:", { taskTitle, estimatedMinutes });
  
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            generationConfig: { temperature: 0 },
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );
  
      const data = await geminiRes.json();
      const outputText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  
      console.log("🔎 Gemini raw output:", outputText);
  
      const cleanedText = outputText
        ?.replace(/```json|```/g, '')
        .trim();

      const parsed = JSON.parse(cleanedText || '');
  
      if (parsed.status === 'ok' && typeof parsed.difficulty === 'string') {
        console.log(`✅ Assigned difficulty: ${parsed.difficulty}`);
        return parsed.difficulty;
      }
  
      if (parsed.status === 'error' && parsed.message) {
        console.warn(`⚠️ Gemini rejected task: ${parsed.message}`);
        return 'unclear';
      }
  
      throw new Error("Unexpected response structure");
    } catch (err: any) {
      console.error("❌ Gemini API call or parsing failed:", err);
      return 'medium'; // fallback difficulty
    }
};

export const getLastCompletedTask = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userRef = db.collection(USERS_COLLECTION).doc(user.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    const completedTaskIds = userData?.completedTasks || [];

        // ✅ Log completed task IDs
        console.log("Fetched completed tasks:", completedTaskIds);

    if (completedTaskIds.length === 0) {
      return res.status(404).json({ error: "No completed tasks found." });
    }

    // Fetch all completed tasks
    const taskDocs = await Promise.all(
      completedTaskIds.map((id: string) =>
        db.collection(TASKS_COLLECTION).doc(id).get()
      )
    );

    // Extract task data with completedAt
    const completedTasks = taskDocs
    .map(doc => {
      const task = { id: doc.id, ...doc.data() };

      // ✅ Log each task and its completedAt field
      console.log("Task:", task.id, "completedAt:", task.completedAt);

      return task;
    })
    .filter(task => task.completedAt)
    .sort((a, b) => b.completedAt.toMillis() - a.completedAt.toMillis());


    if (completedTasks.length === 0) {
      return res.status(404).json({ error: "No valid completed tasks with timestamps." });
    }

    res.status(200).json({ task: completedTasks[0] });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: "Failed to fetch last completed task", details: err.message });
    } else {
      res.status(500).json({ error: "Failed to fetch last completed task", details: "Unknown error occurred" });
    }
  }
};

export const getCompletedTasks = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userRef = db.collection("users").doc(user.uid);
    const userSnap = await userRef.get();
    const userData = userSnap.data();

    const completedTaskIds = userData?.completedTasks || [];

    if (completedTaskIds.length === 0) {
      return res.status(200).json({ tasks: [] });
    }

    const taskDocs = await Promise.all(
      completedTaskIds.map((id: string) =>
        db.collection("tasks").doc(id).get()
      )
    );

    const tasks = taskDocs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(task => task.title && task.completedAt) // filter junk

    res.status(200).json({ tasks });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch completed tasks" });
  }
};
