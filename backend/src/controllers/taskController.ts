const admin = require('firebase-admin'); // we are reinitalizing firebase here; might need to change that in the future to call firebase from index file
const db = admin.firestore();
const bcrypt = require('bcryptjs');
const { User } = require('../models/user') // import user models
const { Task, difficultyConfig } = require('../models/task') // import task models
import type { Request, Response} from "express"; // have to import key words (types) for type script
import { QueryDocumentSnapshot } from 'firebase-admin/firestore';

const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users'; //users

// console.log("Imported Task Model:", Task, difficultyConfig);
// Create a new task

exports.createTask = async (req: Request, res: Response) => {
  try {
    const { assignedTo, difficulty, title, dueDate } = req.body;

    // Generate unique ID from Firestore
    const taskRef = db.collection("tasks").doc();
    const taskID = taskRef.id;

    const newTask : Task = { // generate a task to put into firestore with some attributes from the frontend
      taskID, 
      title,
      assignedTo,
      difficulty,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      isComplete: false,
      dueDate: dueDate,
    };

    // Store task in Firestore
    await taskRef.set(newTask);

    // Send full task data back to frontend
    res.status(201).json({ 
      id: taskID, 
      title, 
      assignedTo, 
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
    const snapshot = await db.collection(TASKS_COLLECTION).get();
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

// Update a task
exports.updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    await db.collection(TASKS_COLLECTION).doc(id).update(updatedData);
    res.json({ message: 'Task updated successfully' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: 'Failed to update task', details: err.message });
    } else {
      res.status(500).json({ error: 'Failed to update task', details: 'Unknown error occurred' });
    }
  }
};

// Delete a task
exports.deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.collection(TASKS_COLLECTION).doc(id).delete();
    res.json({ message: 'Task deleted successfully' });
  } catch (err: unknown) {
    if (err instanceof Error) {
      res.status(500).json({ error: 'Failed to delete task', details: err.message });
    } else {
      res.status(500).json({ error: 'Failed to delete task', details: 'Unknown error occurred' });
    }
  }
};

// Calculate reward (placeholder logic)
exports.calculateReward = (req: Request, res: Response) => {
  const { taskDifficulty } = req.body;
  // Call Gemini API or use a custom algorithm
  res.json({ reward: taskDifficulty === 'hard' ? 'Gold Star' : 'Silver Star' });
};

// console.log("Imported User Model:", User);
exports.registerUser = async (req: Request, res: Response) => {
  try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
          return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      // Generate a unique ID first from firebase
      const userRef = db.collection("users").doc(); 
      // Firebase-generated unique ID to store into userID
      const userID = userRef.id; 

      // Save user data to Firestore
      const newUser: User = { 
          userID: userID,
          userName: name, 
          email: email, 
          password: hashedPassword, // Store the hashed password         
          xp: 0, 
          level: 0,
          rank: "bronze", // default rank to bronze
          streak: 0,
          currentTasks:[], // store an array of task IDs of current tasks
          completedTasks:[], // store an array of task IDs of finished tasks
          unfinishedTasks:[], // store an array of task IDs of unfinished tasks
          achievements:[], // store an array of achievement IDs that the user has earned
          createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      // Store the user with the ID in Firestore (single write)
      await userRef.set(newUser);
      res.status(201).json({ id: userID, message: 'User registered!' }); 
      // add edge case where there are duplicate emails (user names too? Dont know if we want to make user names unique)
  } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Registration Error:", err);
        res.status(500).json({ error: 'Failed to register user', details: err.message });
    } else {
        res.status(500).json({ error: 'Failed to register user', details: 'Unknown error occurred' });
    }
  }
};

exports.loginUser = async (req: Request, res: Response) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
      }

      console.log(db);

      const normalizedEmail = email.toLowerCase();
      console.log("Normalized Email for Login:", normalizedEmail);

      const usersRef = db.collection(USERS_COLLECTION);
      console.log("Hiya");
      const snapshot = await usersRef.where('email', '==', normalizedEmail).get();

      console.log("Snapshot size:", snapshot.size);

      if (snapshot.empty) {
          return res.status(404).json({ error: 'Login failed. Please try again with a valid email.' });
      }

      let userData: any;
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
          userData = { id: doc.id, ...doc.data() };
      });

      // if (userData.password !== password) {
      //     return res.status(401).json({ error: 'Incorrect password' });
      // }

      // Compare entered password with the hashed password from the database
      const isPasswordCorrect = await bcrypt.compare(password, userData.password);

      if (!isPasswordCorrect) {
        return res.status(401).json({ error: 'Incorrect password' });
      }

      res.status(200).json({ message: 'Login successful', user: userData });
  } catch (err: unknown) {
      if (err instanceof Error) {
        res.status(500).json({ error: 'Failed to log in', details: err.message });
      } else {
        res.status(500).json({ error: 'Failed to log in', details: 'Unknown error occurred' });
      }
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