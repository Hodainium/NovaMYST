const admin = require('firebase-admin');
const db = admin.firestore();
const bcrypt = require('bcryptjs');

const TASKS_COLLECTION = 'tasks';
const USERS_COLLECTION = 'users'; //users

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

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds

      // Save user data to Firestore
      const newUser = await db.collection(USERS_COLLECTION).add({ 
          name, 
          email, 
          password: hashedPassword, // Store the hashed password         
          xp: 0, 
          level: 0,
          rank: "bronze", // default rank to bronze
          streak: 0,
          completionRate: 0.00,
          totalTasks: 0, // tot
          currentTasks:[], // store an array of task IDs
          achievements:[], // store an array of achievement IDs
          createdAt: admin.firestore.FieldValue.serverTimestamp()
          // displayName, // make this in the register
      });




      res.status(201).json({ id: newUser.id, message: 'User registered!' });
  } catch (err) {
      console.error("Registration Error:", err); // Add this log
      res.status(500).json({ error: 'Failed to register user', details: err.message });
  }

  
};

exports.loginUser = async (req, res) => {
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

      let userData;
      snapshot.forEach(doc => {
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
  } catch (err) {
      res.status(500).json({ error: 'Failed to log in', details: err.message });
  }
};

exports.testdb = async (req, res) => {
  try {
    const snapshot = await db.collection(USERS_COLLECTION).get(); // Test collection
    const users = snapshot.docs.map(doc => doc.data());
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: 'Firestore connection failed', details: error.message });
  }
};