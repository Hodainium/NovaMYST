import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Timer, CheckCircle2, Trophy, Coins, LayoutDashboard, ListChecks, User, Award,
  BarChart2, ChevronLeft, ChevronRight, Edit, Trash, Plus
} from 'lucide-react';
import AchievementCollection from "./Achievements";

function Dashboard() {
  const [quests, setQuests] = useState([]);
  const [newQuest, setNewQuest] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('easy');
  const [dueDate, setDueDate] = useState('');
  const [isTaskbarOpen, setIsTaskbarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const taskTypes = [
    /*The coins, xp, and time estimates are just placeholders I made up. Subject to change*/
    { value: 'easy', label: 'Easy', reward: { coins: 1, xp: 1 }, timeEstimate: '5 mins - 1 hour' },  
    { value: 'medium', label: 'Medium', reward: { coins: 3, xp: 3 }, timeEstimate: '1 hour - 1 day' },
    { value: 'hard', label: 'Hard', reward: { coins: 5, xp: 5 }, timeEstimate: '1 day - 1 year' },
  ];

  const handleAddQuest = (e) => {
    e.preventDefault();
    if (newQuest.trim()) {
      const newTask = {
        id: Date.now(),
        title: newQuest,
        difficulty: selectedDifficulty,
        dueDate,
        completed: false,
        late: false,
        reward: taskTypes.find(t => t.value === selectedDifficulty).reward,
        timestamp: new Date().getTime(),
      };
      setQuests([...quests, newTask]);
      setIsModalOpen(false);
      setNewQuest('');
      setSelectedDifficulty('easy');
      setDueDate('');
    }
  };

  const handleCompleteQuest = (id) => {
    setQuests((prev) => prev.map((q) => q.id === id ? { ...q, completed: true } : q));
  };

  const handleDeleteQuest = (id) => {
    setQuests((prev) => prev.filter((q) => q.id !== id));
  };

  const handleEditQuest = (id) => {
    const quest = quests.find((q) => q.id === id);
    if (quest) {
      setNewQuest(quest.title);
      setSelectedDifficulty(quest.difficulty);
      setDueDate(quest.dueDate);
      setIsModalOpen(true);
      handleDeleteQuest(id);
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
            <>
              <div className="achievements-section">
                <h2>Achievements</h2>
              </div>
              <AchievementCollection />
            </>
          )}

          {activeSection === 'leaderboard' && (
            <div className="leaderboard-section">
              <h2>Leaderboard</h2>
              {/* Leaderboard content goes here */}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;