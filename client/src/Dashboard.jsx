import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Trophy, Coins, LayoutDashboard, ListChecks, User, Award,
  BarChart2, ChevronLeft, ChevronRight, Edit, Trash, Plus, Cog, Users, NotebookPen
} from 'lucide-react';
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Achievements from "./Achievements";
import Settings from "./Settings";
import Leaderboard from './Leaderboard';
import Character from './Character';
import Friends from './Friends';

function Dashboard() {
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [estimatedTime, setEstimatedTime] = useState({ hours: 0, minutes: 0 });
  const [dueDate, setDueDate] = useState('');
  const [isTaskbarOpen, setIsTaskbarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userXP, setUserXP] = useState(0);
  const [userCoins, setUserCoins] = useState(0);
  
  const navigate = useNavigate();

  const refreshUserData = async () => {
    try {
      console.log("🔄 refreshUserData called");
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();

      const res = await fetch(`${import.meta.env.VITE_API_URL}/user/data`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setUserXP(data.xp || 0);
      setUserCoins(data.coins || 0);
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        setLoading(false);
        return;
      }
  
      try {
        const token = await user.getIdToken();

        const userRes = await fetch(`${import.meta.env.VITE_API_URL}/user/data`, {
            headers: {
            Authorization: `Bearer ${token}`,
            },
        });

        const userData = await userRes.json();
        setUserXP(userData.xp || 0);
        setUserCoins(userData.coins || 0);
  
        const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/list`, {
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
          estimatedTime: task.estimatedTime || { hours: 0, minutes: 0 },
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
        time: estimatedTime,
        dueDate: new Date(dueDate).toISOString()
      };
  
      if (editingTaskId) {
        await fetch(`${import.meta.env.VITE_API_URL}/tasks/update/${editingTaskId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(taskData)
        });
  
        setQuests((prev) =>
          prev.map((q) =>
            q.id === editingTaskId ? { ...q, ...taskData } : q
          )
        );
      } else {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/tasks/create`, {
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
  
      setIsModalOpen(false);
      setNewQuest('');
      setSelectedDifficulty('easy');
      setEstimatedTime({ hours: 0, minutes: 0 });
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
  
      await fetch(`${import.meta.env.VITE_API_URL}/tasks/update/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isComplete: true })
      });
  
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
  
      await fetch(`${import.meta.env.VITE_API_URL}/tasks/delete/${id}`, {
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
      setEditingTaskId(id);
      setNewQuest(quest.title);
      setSelectedDifficulty(quest.difficulty);
      setEstimatedTime(quest.estimatedTime || { hours: 0, minutes: 0 });
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
  const totalCoins = userCoins;
  const totalXP = userXP;

  if (loading) {
    return <div className="loading-screen">Loading tasks...</div>;
  }

  const renderQuest = (quest) => (
    <div key={quest.id} className="quest-item">
      <div className="quest-header">
        <h4>{quest.title}</h4>
        {quest.late && <span className="late-indicator">Late</span>}
      </div>
      
      <div className="quest-meta">
        <div className="meta-item">
          <span className="meta-label">Difficulty:</span>
          <span className="meta-value">
            {
              quest.difficulty === 'easy' ? 'Easy' :
              quest.difficulty === 'medium' ? 'Medium' :
              'Hard'
            }
          </span>
        </div>
        
        {quest.estimatedTime && (
          <div className="meta-item">
            <span className="meta-label">Estimated:</span>
            <span className="meta-value">
              {quest.estimatedTime.hours > 0 && `${quest.estimatedTime.hours}h `}
              {quest.estimatedTime.minutes > 0 && `${quest.estimatedTime.minutes}m`}
            </span>
          </div>
        )}
        
        <div className="meta-item">
          <span className="meta-label">Due:</span>
          <span className="meta-value">{new Date(quest.dueDate).toLocaleString()}</span>
        </div>
      </div>
      
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
              { icon: <BarChart2 size={24} />, name: 'leaderboard' },
              { icon: <Users size={24} />, name: 'friends'},
              { icon: <NotebookPen size={24} />, name: 'reflections'},
              { icon: <Cog size={24} />, name: 'settings'}
            ].map(({ icon, name }) => (
              <div 
                key={name} 
                className="taskbar-section" 
                onClick={() => {
                    setActiveSection(name);
                    if (name === 'dashboard') {
                    refreshUserData();
                    }
                }}
                >
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
                      <div className="task-meta">
                        <span>
                          Difficulty:  
                          {
                            quest.difficulty === 'easy' ? ' Easy' :
                            quest.difficulty === 'medium' ? ' Medium' :
                            ' Hard'
                          }
                        </span>
                        {/*{quest.estimatedTime && (
                          <span>
                            Estimated: {quest.estimatedTime.hours > 0 && `${quest.estimatedTime.hours}h `}
                            {quest.estimatedTime.minutes > 0 && `${quest.estimatedTime.minutes}m`}
                          </span>
                        )}*/}
                        <span>Completed on: {new Date(quest.timestamp).toLocaleString()}</span>
                      </div>
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
                <button 
                  className="add-quest-btn" 
                  onClick={() => {
                    setIsModalOpen(true);
                    setEditingTaskId(null); 
                    setNewQuest('');
                    setSelectedDifficulty('easy');
                    setEstimatedTime({ hours: 0, minutes: 0 });
                    setDueDate('');
                  }}
                >
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
                <h2>{editingTaskId ? 'Edit Quest' : 'Add Quest'}</h2>
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
                    <label>Estimated Time</label>
                    <div className="time-inputs">
                      <div className="time-input-group">
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={estimatedTime.hours}
                          onChange={(e) => setEstimatedTime({...estimatedTime, hours: parseInt(e.target.value) || 0})}
                        />
                        <span>Hours</span>
                      </div>
                      <div className="time-input-group">
                        <input 
                          type="number" 
                          min="0"
                          placeholder="0"
                          value={estimatedTime.minutes}
                          onChange={(e) => setEstimatedTime({...estimatedTime, minutes: parseInt(e.target.value) || 0})}
                        />
                        <span>Minutes</span>
                      </div>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
                  </div>
                  <div className="modal-actions">
                    <button type="submit" className="add-quest-btn">{editingTaskId ? 'Update Quest' : 'Add Quest'}</button>
                    <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeSection === 'character' && (
            <div className="character-section">
              <Character/>
            </div>
          )}

          {activeSection === 'achievements' && (
            <div className="achievements-section">
              <Achievements/>
            </div>
          )}

          {activeSection === 'leaderboard' && (
            <div className="leaderboard-section">
              <Leaderboard/>
            </div>
          )}

          {activeSection === 'friends' && (
            <div className="friends-section">
              <Friends/>
            </div>
          )}

          {activeSection === 'reflections' && (
            <div className="reflections-section">
              <h2>Reflections</h2>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="setting-section">
              <h2>Settings</h2>
              <Settings/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;