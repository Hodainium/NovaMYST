require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const cors = require('cors');


const app = express();
const port = process.env.PORT || 3000;

// Firebase initialization
const serviceAccount = require('./firebase-service-account.json');
admin.initializeApp({
  // credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // Initialize Firestore after app initialization

// Middleware
app.use(express.json());
app.use(cors({ origin: 'http://localhost:5173' }));

const taskRoutes = require('./routes/tasks');

// Task routes
app.use('/tasks', taskRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running with Firebase!');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});