import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Timer, CheckCircle2, Trophy, Coins } from 'lucide-react';

function Dashboard() {
    const [quests, setQuests] = useState([]);
    const [newQuest, setNewQuest] = useState('');
    const [selectedTime, setSelectedTime] = useState('30');

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

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-content">
                    <div className="logo-section">
                        <span className="game-icon">🎮</span>
                        <h1>NovaMyst</h1>
                    </div>
                    <Link to="/" className="logout-btn">Logout</Link>
                </div>
            </nav>
            
            <div className="dashboard-content">
                <div className="quests-section">
                    <h2>Your Active Quests</h2>
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
                
                <div className="character-section">
                    <div className="character-card">
                        <h2>Character Progress</h2>
                        <div className="level-info">
                            <h3>Level 1</h3>
                            <div className="xp-bar">
                                <div className="xp-progress" style={{width: "100%"}}>
                                    <span>0/100 XP</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="stats-grid">
                            <div className="stat-item">
                                <Trophy size={24} />
                                <div className="stat-text">
                                    <h4>Quests Completed</h4>
                                    <p>{quests.filter(q => q.completed).length}</p>
                                </div>
                            </div>
                            <div className="stat-item">
                                <Coins size={24} />
                                <div className="stat-text">
                                    <h4>Coins Earned</h4>
                                    <p>0</p>
                                </div>
                            </div>
                        </div>

                        <div className="achievements-section">
                            <h3>Achievements</h3>
                            <p className="achievement-text">Complete more quests to unlock achievements!</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;