const express = require('express');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  calculateReward,
  registerUser,
  loginUser,
  testdb, 
} = require('../controllers/taskController');

const router = express.Router();

// Task routes
router.post('/create', createTask);
router.get('/list', getTasks);
router.put('/update/:id', updateTask);
router.delete('/delete/:id', deleteTask);

// User registration route
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/test-firestore', testdb);

// Reward calculation route
router.post('/calculateReward', calculateReward);

module.exports = router;
