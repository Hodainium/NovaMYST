require('dotenv').config();
const express = require('express');
import type { Request, Response, NextFunction} from "express"; // have to import key words (types) for type script
const admin = require('firebase-admin');
//const cors = require('cors');
import cors from 'cors';
import type { CorsOptionsDelegate, CorsRequest } from 'cors';


const app = express();
const port = process.env.PORT || 3000;

// Firebase initialization
const serviceAccount = require('../firebase-service-account.json'); // one dot means check src two dots means check backend
console.log("Initializing Firebase...");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});
console.log("Firebase initialized.");

const db = admin.firestore(); // Initialize Firestore after app initialization

// Middleware
app.use(express.json());

//cors 

//app.use(cors({ origin: 'http://localhost:5173' }));

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

const taskRoutes = require('./routes/tasks'); // you are in index.js here not index.ts; one dot go to dist then go to routes

// Task routes
app.use('/tasks', taskRoutes);

import achievementRoutes from './routes/achievements';
app.use('/achievements', achievementRoutes);

import userRoutes from './routes/users';
app.use('/user', userRoutes);

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
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});

export { admin, db };
