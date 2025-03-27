import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Timer, CheckCircle2, Trophy, Coins, LayoutDashboard, ListChecks, User, Award,
  BarChart2, ChevronLeft, ChevronRight, Edit, Trash, Plus
} from 'lucide-react';
import AchievementDashboard from "./Achievements";
import Settings from "./Settings";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [dueDate, setDueDate] = useState('');
  const [isTaskbarOpen, setIsTaskbarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        setLoading(false);
        return;
      }
  
      try {
        const token = await user.getIdToken();
  
        const res = await fetch("http://localhost:3000/tasks/list", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch tasks");
  
        setQuests(data.map(task => ({
          id: task.id,
          title: task.title,
          difficulty: task.difficulty,
          dueDate: task.dueDate,
          completed: task.isComplete,
          late: false,
          reward: taskTypes.find(t => t.value === task.difficulty)?.reward || { coins: 0, xp: 0 },
          timestamp: Date.now(),
        })));
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, []);

  const taskTypes = [
    /*The coins, xp, and time estimates are just placeholders I made up. Subject to change*/
    { value: 'easy', label: 'Easy', reward: { coins: 1, xp: 1 }, timeEstimate: '5 mins - 1 hour' },  
    { value: 'medium', label: 'Medium', reward: { coins: 3, xp: 3 }, timeEstimate: '1 hour - 1 day' },
    { value: 'hard', label: 'Hard', reward: { coins: 5, xp: 5 }, timeEstimate: '1 day - 1 year' },
  ];

  const handleAddQuest = async (e) => {
    e.preventDefault();
    if (!newQuest.trim()) return;
  
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
  
      const token = await user.getIdToken();
  
      const taskData = {
        title: newQuest,
        difficulty: selectedDifficulty,
        dueDate: new Date(dueDate).toISOString()
      };
  
      if (editingTaskId) {
        // Update existing task
        await fetch(`http://localhost:3000/tasks/update/${editingTaskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });
  
        // Update local state
        setQuests((prev) =>
          prev.map((q) =>
            q.id === editingTaskId ? { ...q, ...taskData } : q
          )
        );
      } else {
        // Create new task
        const response = await fetch("http://localhost:3000/tasks/create", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ ...taskData, assignedTo: user.uid })
        });
  
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to create task");
  
        setQuests([...quests, {
          id: data.id,
          ...taskData,
          completed: false,
          late: false,
          reward: taskTypes.find(t => t.value === selectedDifficulty)?.reward || { coins: 0, xp: 0 },
          timestamp: Date.now()
        }]);
      }
  
      // Reset form and modal
      setIsModalOpen(false);
      setNewQuest('');
      setSelectedDifficulty('easy');
      setDueDate('');
      setEditingTaskId(null);
    } catch (error) {
      console.error("Error saving task:", error);
      alert(error.message);
    }
  };

  const handleCompleteQuest = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
      const token = await user.getIdToken();
  
      // Tell backend to mark this task as complete
      await fetch(`http://localhost:3000/tasks/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isComplete: true })
      });
  
      // Reflect change in local state
      setQuests((prev) =>
        prev.map((q) =>
          q.id === id ? { ...q, completed: true, timestamp: Date.now() } : q
        )
      );
    } catch (err) {
      console.error("Error completing task:", err);
    }
  };

  const handleDeleteQuest = async (id) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
      const token = await user.getIdToken();
  
      await fetch(`http://localhost:3000/tasks/delete/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setQuests((prev) => prev.filter((q) => q.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleEditQuest = (id) => {
    const quest = quests.find((q) => q.id === id);
    if (quest) {
      setEditingTaskId(id); // track the ID being edited
      setNewQuest(quest.title);
      setSelectedDifficulty(quest.difficulty);
      setDueDate(quest.dueDate);
      setIsModalOpen(true);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setQuests((prev) => prev.map((q) =>
        !q.completed && new Date(q.dueDate) < new Date() ? { ...q, late: true } : q
      ));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const toggleTaskbar = () => setIsTaskbarOpen(!isTaskbarOpen);

  const completedQuests = quests.filter((q) => q.completed).length;
  const completionRate = quests.length ? ((completedQuests / quests.length) * 100).toFixed(2) : 0;
  const totalCoins = quests.reduce((acc, q) => q.completed ? acc + q.reward.coins : acc, 0);
  const totalXP = quests.reduce((acc, q) => q.completed ? acc + q.reward.xp : acc, 0);

  if (loading) {
    return <div className="loading-screen">Loading tasks...</div>;
  }

  const renderQuest = (quest) => (
    <div key={quest.id} className="quest-item">
      <h4>{quest.title}{quest.late && <p className="late-indicator">Late</p>}</h4>
      <p>Due: {new Date(quest.dueDate).toLocaleString()}</p>
      <div className="quest-actions">
        <button className="complete-btn" onClick={() => handleCompleteQuest(quest.id)}>
          <CheckCircle2 size={20} /> Complete
        </button>
        <button className="edit-btn" onClick={() => handleEditQuest(quest.id)}>
          <Edit size={20} />
        </button>
        <button className="delete-btn" onClick={() => handleDeleteQuest(quest.id)}>
          <Trash size={20} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-layout">
        <div className={`taskbar ${isTaskbarOpen ? 'open' : 'closed'}`}>
          <div className="taskbar-header">
            <div className="logo-section">
              {isTaskbarOpen && <h1>NovaMyst</h1>}
            </div>
            <button className="toggle-taskbar" onClick={toggleTaskbar}>
              {isTaskbarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
            </button>
          </div>
          <div className="taskbar-content">
            {[
              { icon: <LayoutDashboard size={24} />, name: 'dashboard' },
              { icon: <ListChecks size={24} />, name: 'tasks' },
              { icon: <User size={24} />, name: 'character' },
              { icon: <Award size={24} />, name: 'achievements' },
              { icon: <BarChart2 size={24} />, name: 'leaderboard' }
            ].map(({ icon, name }) => (
              <div key={name} className="taskbar-section" onClick={() => setActiveSection(name)}>
                {icon}
                {isTaskbarOpen && <span>{name.charAt(0).toUpperCase() + name.slice(1)}</span>}
              </div>
            ))}
          </div>
          <div className="taskbar-footer">
            <Link to="/" className="logout-btn">Logout</Link>
          </div>
        </div>

        <div className="dashboard-content">
          {activeSection === 'dashboard' && (
            <>
              <div className="dashboard-section">
                <h2>Dashboard</h2>
                <div className="stats-grid">
                  {[{
                    icon: <Trophy size={24} />, label: 'Total Tasks', value: quests.length
                  }, {
                    icon: <CheckCircle2 size={24} />, label: 'Completion Rate', value: `${completionRate}%`
                  }, {
                    icon: <Coins size={24} />, label: 'Total Coins', value: totalCoins
                  }, {
                    icon: <Trophy size={24} />, label: 'Total XP', value: totalXP
                  }].map(({ icon, label, value }) => (
                    <div key={label} className="stat-item">
                      {icon}
                      <div className="stat-text">
                        <h4>{label}</h4>
                        <p>{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="finished-tasks-section">
                <h3>Recent Tasks</h3>
                <hr className="task-divider" />
                <div className="finished-tasks-list">
                  {quests.filter((q) => q.completed).map((quest) => (
                    <div key={quest.id} className="finished-task-item">
                      <h4>
                        {quest.title}
                        {quest.late && <span className="late-indicator-inline"> (Late)</span>}
                      </h4>
                      <p>Difficulty: {quest.difficulty}</p>
                      <p>Completed on: {new Date(quest.timestamp).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeSection === 'tasks' && (
            <>
              <div className="tasks-section">
                <h2>Tasks</h2>
                <button className="add-quest-btn" onClick={() => setIsModalOpen(true)}>
                  <Plus size={20} /> Add Quest
                </button>
              </div>
              <div className="tasks-grid">
                {taskTypes.map((type) => (
                  <div key={type.value} className="task-column">
                    <h3>{type.label} Tasks ({type.timeEstimate})</h3>
                    <hr className="task-divider" />
                    {quests.filter((q) => q.difficulty === type.value && !q.completed).map(renderQuest)}
                  </div>
                ))}
              </div>
            </>
          )}

          {isModalOpen && (
            <div className="modal-overlay">
              <div className="modal">
                <h2>Add Quest</h2>
                <form onSubmit={handleAddQuest}>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" value={newQuest} onChange={(e) => setNewQuest(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                      {taskTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                  </div>
                  <button type="submit" className="add-quest-btn">Add Quest</button>
                  <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'character' && (
            <div className="character-section">
              <h2>Character</h2>
              {/* Character content goes here */}
            </div>
          )}

          {activeSection === 'achievements' && (
              <div className="achievements-section">
                <h2>Achievements</h2>
                <AchievementDashboard/>
              </div>
          )}

          {activeSection === 'leaderboard' && (
            <div className="leaderboard-section">
              <h2>Leaderboard</h2>
              {/* Leaderboard content goes here */}
            </div>
          )}

          {activeSection === 'setting' && (
            <div className="setting-section">
              <h2>Setting</h2>
              <Settings/>
            </div>
        )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;