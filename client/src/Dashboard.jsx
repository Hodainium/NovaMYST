import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Timer, CheckCircle2, Trophy, Coins, LayoutDashboard, ListChecks, User, Award, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import AchievementCollection from "./Achievements";

function Dashboard() {
    const [quests, setQuests] = useState([]);
    const [newQuest, setNewQuest] = useState('');
    const [selectedTime, setSelectedTime] = useState('30');
    const [isTaskbarOpen, setIsTaskbarOpen] = useState(true);
    const [activeSection, setActiveSection] = useState('dashboard');

    const timeOptions = [
        { value: '15', label: '15 minutes' },
        { value: '30', label: '30 minutes' },
        { value: '45', label: '45 minutes' },
        { value: '60', label: '1 hour' },
        { value: '90', label: '1.5 hours' },
        { value: '120', label: '2 hours' },
    ];

    const handleAddQuest = (e) => {
        e.preventDefault();
        if (newQuest.trim()) {
            setQuests([...quests, { 
                title: newQuest, 
                completed: false, 
                timeAllotted: selectedTime,
                timestamp: new Date().getTime()
            }]);
            setNewQuest('');
        }
    };

    const toggleTaskbar = () => {
        setIsTaskbarOpen(!isTaskbarOpen);
    };

    const completedQuests = quests.filter(q => q.completed).length;
    const completionRate = quests.length > 0 ? ((completedQuests / quests.length) * 100).toFixed(2) : 0;
    const recentQuests = quests.slice(0, 3); 

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
                        <div className="taskbar-section" onClick={() => setActiveSection('dashboard')}>
                            <LayoutDashboard size={24} />
                            {isTaskbarOpen && <span>Dashboard</span>}
                        </div>
                        <div className="taskbar-section" onClick={() => setActiveSection('tasks')}>
                            <ListChecks size={24} />
                            {isTaskbarOpen && <span>Tasks</span>}
                        </div>
                        <div className="taskbar-section" onClick={() => setActiveSection('character')}>
                            <User size={24} />
                            {isTaskbarOpen && <span>Character</span>}
                        </div>
                        <div className="taskbar-section" onClick={() => setActiveSection('achievements')}>
                            <Award size={24} />
                            {isTaskbarOpen && <span>Achievements</span>}
                        </div>
                        <div className="taskbar-section" onClick={() => setActiveSection('leaderboard')}>
                            <BarChart2 size={24} />
                            {isTaskbarOpen && <span>Leaderboard</span>}
                        </div>
                    </div>
                    <div className="taskbar-footer">
                        <Link to="/" className="logout-btn">Logout</Link>
                    </div>
                </div>

                <div className="dashboard-content">
                    {activeSection === 'dashboard' && (
                        <div className="dashboard-section">
                            <h2>Dashboard</h2>
                            <div className="stats-grid">
                                <div className="stat-item">
                                    <Trophy size={24} />
                                    <div className="stat-text">
                                        <h4>Total Tasks</h4>
                                        <p>{quests.length}</p>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <CheckCircle2 size={24} />
                                    <div className="stat-text">
                                        <h4>Completion Rate</h4>
                                        <p>{completionRate}%</p>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <Coins size={24} />
                                    <div className="stat-text">
                                        <h4>Current Streak</h4>
                                        <p>0 days</p>
                                    </div>
                                </div>
                                <div className="stat-item">
                                    <Trophy size={24} />
                                    <div className="stat-text">
                                        <h4>Total XP</h4>
                                        <p>0</p>
                                    </div>
                                </div>
                            </div>
                            <div className="recent-tasks">
                                <h3>Recent Tasks</h3>
                                {recentQuests.map((quest, index) => (
                                    <div key={index} className="quest-item">
                                        <h4>{quest.title}</h4>
                                        <p>{quest.timeAllotted} minutes</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSection === 'tasks' && (
                        <div className="tasks-section">
                            <h2>Tasks</h2>
                            <form onSubmit={handleAddQuest} className="quest-form">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        className="quest-input"
                                        placeholder="Enter your quest title..."
                                        value={newQuest}
                                        onChange={(e) => setNewQuest(e.target.value)}
                                    />
                                    <select 
                                        className="time-select"
                                        value={selectedTime}
                                        onChange={(e) => setSelectedTime(e.target.value)}
                                    >
                                        {timeOptions.map(option => (
                                            <option key={option.value} value={option.value}>
                                                {option.label}
                                            </option>
                                        ))}
                                    </select>
                                    <button className="add-quest-btn" type="submit">
                                        Add Quest
                                    </button>
                                </div>
                            </form>

                            <div className="quests-list">
                                {quests.map((quest, index) => (
                                    <div key={index} className={`quest-item ${quest.completed ? 'completed' : ''}`}>
                                        <div className="quest-info">
                                            <h3>{quest.title}</h3>
                                            <div className="quest-meta">
                                                <span className="time-indicator">
                                                    <Timer size={16} />
                                                    {quest.timeAllotted} minutes
                                                </span>
                                            </div>
                                        </div>
                                        <button 
                                            className={`complete-btn ${quest.completed ? 'completed' : ''}`}
                                            onClick={() => {
                                                const newQuests = [...quests];
                                                newQuests[index].completed = !newQuests[index].completed;
                                                setQuests(newQuests);
                                            }}
                                        >
                                            <CheckCircle2 size={20} />
                                            {quest.completed ? 'Completed' : 'Complete'}
                                        </button>
                                    </div>
                                ))}
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
                            <AchievementCollection/>
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