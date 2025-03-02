const express = require('express');
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  calculateReward,
  registerUser, 
} = require('../controllers/taskController');

const router = express.Router();

// Task routes
router.post('/create', createTask);
router.get('/list', getTasks);
router.put('/update/:id', updateTask);
router.delete('/delete/:id', deleteTask);

// User registration route
router.post('/register', registerUser);

// Reward calculation route
router.post('/calculateReward', calculateReward);

module.exports = router;
