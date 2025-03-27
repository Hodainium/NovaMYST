const express = require('express');
const { authenticateFirebaseToken } = require('../middleware/authMiddleware');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  calculateReward,
  registerUser,
  loginUser,
  testdb, 
} = require('../controllers/taskController'); // one dot -> you are in routes two dot -> you go into dist

const router = express.Router();

// Task routes
router.post('/create', authenticateFirebaseToken, createTask);
router.get('/list', authenticateFirebaseToken, getTasks);
router.put('/update/:id', authenticateFirebaseToken, updateTask);
router.delete('/delete/:id', authenticateFirebaseToken, deleteTask);

// User registration route
router.post('/register', authenticateFirebaseToken, registerUser);
router.get('/test-firestore', testdb);

// Reward calculation route
router.post('/calculateReward', calculateReward);

module.exports = router;
