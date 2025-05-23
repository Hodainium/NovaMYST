require('dotenv').config();
const express = require('express');
import type { Request, Response, NextFunction} from "express"; 
const admin = require('firebase-admin');
import cors from 'cors';
import type { CorsOptionsDelegate, CorsRequest } from 'cors';

const app = express();
const port = process.env.PORT || 3000;

// Firebase initialization
const serviceAccount = JSON.parse(process.env.FIREBASE_CONFIG!);
console.log("Initializing Firebase...");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
console.log("Firebase initialized.");

const db = admin.firestore(); // Initialize Firestore after app initialization

// Middleware
app.use(express.json());


const allowedOrigins = [
    "http://localhost:5173",
    process.env.FRONTEND_URL
  ].filter(Boolean) as string[];
  
  const corsOptions: CorsOptionsDelegate<CorsRequest> = (req, callback) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, { origin: true });
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  };
  
  app.use(cors(corsOptions));


////////////////////////////////////////////////////////

const taskRoutes = require('./routes/tasks'); 

// Task routes
app.use('/tasks', taskRoutes);

import achievementRoutes from './routes/achievements';
app.use('/achievements', achievementRoutes);

import userRoutes from './routes/users';
app.use('/user', userRoutes);

import shopRoutes from './routes/shop';
app.use('/shop', shopRoutes);

import leaderboardRoutes from './routes/leaderboardRoutes';
app.use('/leaderboard', leaderboardRoutes);

import friendRoutes from './routes/friendRoutes';
app.use('/friends', friendRoutes)

import reflectionRoutes from './routes/reflectionRoutes';
app.use("/api", reflectionRoutes);


// Test route
app.get('/', (req: Request, res: Response) => {
  res.send('Backend is running with Firebase!');
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, async () => {
  console.log(`Server running at http://localhost:${port}`);

  // Only NOW import cron and start it
  const { startMonthlyXPResetCron } = await import('./cron/cron');
  startMonthlyXPResetCron();
});

export { admin, db };
