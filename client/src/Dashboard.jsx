import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2, Trophy, Coins, LayoutDashboard, ListChecks, User, Award,
  BarChart2, ChevronLeft, ChevronRight, Edit, Flame, Trash, Plus, Cog, Users, NotebookPen
} from 'lucide-react';
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import Achievements from "./Achievements";
import Settings from "./Settings";
import Leaderboard from './Leaderboard';
import Character from './Character';
import Friends from './Friends';
import Reflections from './Reflections';

function Dashboard() {
  const [streak, setStreak] = useState(0);
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
  const [stamina, setStamina] = useState(0);
  const [prevStamina, setPrevStamina] = useState(0);
  const [pulse, setPulse] = useState(false);
  const [staminaAnimation, setStaminaAnimation] = useState(null); // 'pulse' | 'drain' | null
  const [username, setUsername] = useState("Loading...");

  
  const navigate = useNavigate();

// RGB wheel-based stamina loop (green start → clockwise):
const staminaColors = [
    '#4ade80', // 
    '#34d399', // Spring Green
    '#22d3ee', // Cyan
    '#3b82f6', // Blue
    '#8b5cf6', // Violet
    '#ec4899', // Magenta
    '#ef4444', // Red
    '#f97316', // Orange
    '#eab308'  // Yellow
  ];

  const currentStamina = stamina % 100;
  const loopCount = Math.floor(stamina / 100);
  const fillColor = staminaColors[loopCount % staminaColors.length];

  const fetchStamina = async (user) => {
    if (!user) return;
    const token = await user.getIdToken();
  
    try {
      const staminaRes = await fetch(`${import.meta.env.VITE_API_URL}/user/stamina`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await staminaRes.json();
      const newStamina = data.stamina || 0;
  
      setStamina(newStamina);
  
      if (newStamina > prevStamina) {
        setStaminaAnimation('pulse');
      } else if (newStamina < prevStamina) {
        setStaminaAnimation('drain');
      }
  
      setTimeout(() => setStaminaAnimation(null), 600); // reset animation state
      setPrevStamina(newStamina);
    } catch (err) {
      console.error("Failed to fetch stamina:", err);
    }
  };

  const refreshUserData = async () => {
    try {
      console.log("refreshUserData called");
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
      setStreak(data.streak || 0); 
      // setUsername(data.userName || user.displayName || "Player");
    } catch (err) {
      console.error("Failed to refresh user data:", err);
    }
  };

  const fetchTasks = async () => {
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/tasks/list`, {
        headers: {
        Authorization: `Bearer ${token}`
        }
    });

    const tasks = await res.json();

    const formattedTasks = tasks.map(task => ({
      id: task.id,
      title: task.title,
      difficulty: task.difficulty,
      estimatedTime: task.estimatedTime || { hours: 0, minutes: 0 },
      dueDate: task.dueDate,
      completed: task.isComplete,
      late: new Date(task.dueDate) < new Date(),
      xp: task.xp,
    }));
    
    setQuests(formattedTasks);    
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
        setUsername(userData.userName || user.displayName || "Player");
        setUserXP(userData.xp || 0);
        setUserCoins(userData.coins || 0);
        setStreak(userData.streak || 0);

        // const fetchStamina = async () => {
        //     try {
        //       const staminaRes = await fetch(`${import.meta.env.VITE_API_URL}/user/stamina`, {
        //         headers: {
        //           Authorization: `Bearer ${token}`,
        //         }
        //       });
        //       const data = await staminaRes.json();
        //       setStamina(data.stamina || 0);
        //       if (data.stamina > prevStamina) {
        //         setPulse(true);
        //         setTimeout(() => setPulse(false), 600); // match the CSS animation duration
        //       }
        //       setPrevStamina(data.stamina);
        //     } catch (err) {
        //       console.error("Failed to fetch stamina:", err);
        //     }
        //   };
        //await fetchStamina();

        await fetchStamina(user);
 
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
        })));
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    });
 
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const user = auth.currentUser;
      if (!user) return;
      const token = await user.getIdToken();
  
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/user/stamina`, {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        });
        const data = await res.json();
        setStamina(data.stamina || 0);
      } catch (err) {
        console.error("Failed to poll stamina:", err);
      }
    }, 20 * 1000); // every 1 minute staminatimer 1 * 60 * 1000
  
    return () => clearInterval(interval);
  }, []);


  const taskTypes = [
    { value: 'easy', label: 'Easy', reward: { coins: 0.5, xp: 0.5 } },
    { value: 'medium', label: 'Medium', reward: { coins: 1, xp: 1 } },
    { value: 'medium-hard', label: 'Medium Hard', reward: { coins: 3, xp: 3 } },
    { value: 'hard', label: 'Hard', reward: { coins: 5, xp: 5 } },
    { value: 'very-hard', label: 'Very Hard' }
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
 
        // setQuests([...quests, {
        //   id: data.id,
        //   ...taskData,
        //   completed: false,
        //   late: false,
        //   reward: taskTypes.find(t => t.value === selectedDifficulty)?.reward || { coins: 0, xp: 0 },
        //   timestamp: Date.now()
        // }]);
        
        await fetchTasks();
      }
 
      setIsModalOpen(false);
      setNewQuest('');
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

      await fetchStamina(user);
      await refreshUserData();
      await fetchTasks();

    //   setQuests((prev) =>
    //     prev.map((q) =>
    //       q.id === id ? { ...q, completed: true, timestamp: Date.now() } : q
    //     )
    //   );
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
              quest.difficulty === 'medium-hard' ? 'Medium Hard' :
              quest.difficulty === 'hard' ? 'Hard' :
              'Very Hard'
            }
          </span>
        </div>
       
        {/*{quest.estimatedTime && (
          <div className="meta-item">
            <span className="meta-label">Estimated:</span>
            <span className="meta-value">
              {quest.estimatedTime.hours > 0 && `${quest.estimatedTime.hours}h `}
              {quest.estimatedTime.minutes > 0 && `${quest.estimatedTime.minutes}m`}
            </span>
          </div>
        )}*/}
       
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

        <div 
          className="dashboard-content"
          style={{ padding: (activeSection === 'character' ? '0' : '2rem') }}
        >
        {!['character', 'leaderboard', 'settings'].includes(activeSection) && (
        <div className="minimal-header">
          <div className="header-left">
            <div className="profile-pic-placeholder">test</div>
            <div className="user-info">
              <h2>{username}</h2>
              <p>XP: {userXP} | Coins: {userCoins}</p>
            </div>
          </div>
      
          <div className="header-right">
            <div className="stamina-container">
              <p className="stamina-text">Stamina: {stamina}</p>
              <div className="stamina-bar" style={{ position: 'relative' }}>
                {stamina >= 100 && (
                    <div
                    style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: staminaColors[(loopCount - 1) % staminaColors.length],
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        borderRadius: '8px',
                        zIndex: 0
                    }}
                    />
                )}
                <div
                    className={`stamina-fill ${pulse ? 'pulse' : ''}`}
                    style={{
                        width: `${currentStamina}%`,
                        backgroundColor: fillColor,
                        height: '100%',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        borderTopLeftRadius: currentStamina > 0 ? '8px' : '0',
                        borderBottomLeftRadius: currentStamina > 0 ? '8px' : '0',
                        borderTopRightRadius: '0',
                        borderBottomRightRadius: '0',
                        zIndex: 1,
                        transition: 'width 0.5s ease-in-out, background-color 0.5s ease-in-out'
                    }}
                />
                </div>
              </div>
            </div>
          </div>
        )}
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
                  }, { 
                    icon: <Flame size={24} />, label: 'Streaks', value: `${streak} days` 
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
                <h3>Previous Tasks</h3>
                <hr className="task-divider" />
                <div className="finished-tasks-grid">
                  {quests.filter((q) => q.completed).map((quest) => (
                    <div key={quest.id} className="finished-task-item aligned-task">
                      <div className="quest-header">
                        <h4>
                          {quest.title}
                          {/*{quest.late && <span className="late-indicator-inline"> (Late)</span>}*/}
                        </h4>
                        
                      </div>
                      {/*<div className="task-meta">*/}
                        {/*
                        <span>
                          Difficulty:  
                          {
                            quest.difficulty === 'easy' ? ' Easy' :
                            quest.difficulty === 'medium' ? ' Medium' :
                            ' Hard'
                          }
                        </span>
                        */}
                        {/*{quest.estimatedTime && (
                          <span>
                            Estimated: {quest.estimatedTime.hours > 0 && `${quest.estimatedTime.hours}h `}
                            {quest.estimatedTime.minutes > 0 && `${quest.estimatedTime.minutes}m`}
                          </span>
                        )}*/}
                        {/* <span>Completed on: {new Date(quest.timestamp).toLocaleString()}</span> */}
                      {/*</div>*/}
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
              <div className="tasks-group">
              {/* Tasks Due Today or Late */}
              <div className="task-column">
                <h3>Tasks Due Today or Late Tasks</h3>
                <hr className="task-divider" />
                  {quests
                    .filter((q) => {
                      const now = new Date();
                      const due = new Date(q.dueDate);
                      return (
                        !q.completed &&
                        (q.late || (
                          due.getFullYear() === now.getFullYear() &&
                          due.getMonth() === now.getMonth() &&
                          due.getDate() === now.getDate()
                        ))
                      );
                    })
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map(renderQuest)}
                  </div>

                  {/* Tasks Due This Week */}
                  <div className="task-column">
                    <h3>Tasks Due This Week</h3>
                    <hr className="task-divider" />
                    {quests
                      .filter((q) => {
                        const now = new Date();
                        const due = new Date(q.dueDate);
                        const isToday = due.getFullYear() === now.getFullYear() &&
                          due.getMonth() === now.getMonth() &&
                          due.getDate() === now.getDate();
                        const diff = (due - now) / (1000 * 60 * 60 * 24);
                        return (
                          !q.completed &&
                          !q.late &&
                          !isToday &&
                          diff > 0 && diff <= 7
                        );

                      })
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map(renderQuest)}
                  </div>

                  {/* Other Tasks */}
                  <div className="task-column">
                    <h3>Other Tasks</h3>
                    <hr className="task-divider" />
                    {quests
                      .filter((q) => {
                        const now = new Date();
                        const due = new Date(q.dueDate);
                        const diff = (due - now) / (1000 * 60 * 60 * 24);
                          return (
                            !q.completed &&
                            !q.late &&
                            diff > 7
                          );
                        })
                    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
                    .map(renderQuest)}
                </div>
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
                  {/*
                  <div className="form-group">
                    <label>Difficulty</label>
                    <select value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                      {taskTypes.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  */}
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
              <Reflections/>
            </div>
          )}

          {activeSection === 'settings' && (
            <div className="setting-section">
              <h2>Settings</h2>
              <Settings setUsername={setUsername} /> {/* Pass settings username change here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;