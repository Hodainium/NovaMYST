const admin = require('firebase-admin');
const db = admin.firestore();

const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users';

//Google node

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, completed } = req.body;
    const newTask = await db.collection(TASKS_COLLECTION).add({ 
      title: title || 'New Task', 
      completed: completed || false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    res.status(201).json({ id: newTask.id, message: 'Task created!' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task', details: err.message });
  }
};

// List all tasks
exports.getTasks = async (req, res) => {
  try {
    const snapshot = await db.collection(TASKS_COLLECTION).get();
    const tasks = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    await db.collection(TASKS_COLLECTION).doc(id).update(updatedData);
    res.json({ message: 'Task updated successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task', details: err.message });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection(TASKS_COLLECTION).doc(id).delete();
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task', details: err.message });
  }
};

// Calculate reward (placeholder logic)
exports.calculateReward = (req, res) => {
  const { taskDifficulty } = req.body;
  // Call Gemini API or use a custom algorithm
  res.json({ reward: taskDifficulty === 'hard' ? 'Gold Star' : 'Silver Star' });
};

exports.registerUser = async (req, res) => {
  try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
          return res.status(400).json({ error: 'Name, email, and password are required' });
      }

      // Save user data to Firestore
      const newUser = await db.collection(USERS_COLLECTION).add({ 
          name, 
          email, 
          password,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
      });

      res.status(201).json({ id: newUser.id, message: 'User registered!' });
  } catch (err) {
      res.status(500).json({ error: 'Failed to register user', details: err.message });
  }
};