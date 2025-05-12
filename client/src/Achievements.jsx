import { useState, useEffect } from 'react';
import { Award, CheckCircle2, AlignJustify } from 'lucide-react';
import { auth } from './firebase';
import "./Achievements.css";

function Achievements() {
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true)
    const [showDropdown, setDropdown] = useState(false);
    const [sortOrder, setSortOrder] = useState('default');
    const toggleDropdown = () => setDropdown((open) => !open);

    useEffect(() => {
        const fetchAchievements = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;
    
            const token = await user.getIdToken();
    
            const res = await fetch(`${import.meta.env.VITE_API_URL}/achievements/progress`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
            });
    
            const data = await res.json();
            setLoading(false);
            setAchievements(data);
            console.log("Fetched achievements:", data);
        } catch (err) {
            console.error('Failed to fetch achievements:', err);
            setLoading(false);
        }
        };
    
        fetchAchievements();
    }, []);

    const handleClaim = async (achievementID) => {
        try {
          const user = auth.currentUser;
          const token = await user.getIdToken();
      
          const res = await fetch(`${import.meta.env.VITE_API_URL}/achievements/claim/${achievementID}`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          const data = await res.json();
          if (!res.ok) throw new Error(data.error || "Claim failed");
      
          // Refetch updated achievements after claiming
          const refreshed = await fetch(`${import.meta.env.VITE_API_URL}/achievements/progress`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
      
          const updated = await refreshed.json();
          setAchievements(updated);
        } catch (err) {
          console.error("Claim error:", err);
        }
    };
    
    if (loading) {
        return (
            <div className="loading-achievements">
                <p>Loading achievements...</p>
            </div>
        );
    }

    const achievementTotal = achievements.length;
    const achievementCurrent = achievements.filter(a => a.completed).length;
    const achievementProgress = (achievementCurrent / achievementTotal) * 100;

    return (
        <>
            <h2>Achievements</h2>
            <div className="achievement-layout">
                <div className="achievement-right">
                    <div className="achievement-buttons">
                        <button className="achievement-filter" onClick={toggleDropdown}>
                            <AlignJustify size={20} />
                            Sort By
                        </button>
                        {showDropdown && (
                            <div className="achievement-dropdown">
                                <button
                                    className="achievement-dropdown-item"
                                    onClick={() => {
                                        setSortOrder('default');
                                        setDropdown(false);
                                    }}
                                >
                                    Default
                                </button>
                                <button
                                    className="achievement-dropdown-item"
                                    onClick={() => {
                                        setSortOrder('taskCompletion');
                                        setDropdown(false);
                                    }}
                                >
                                    Task Completion
                                </button>
                                <button
                                    className="achievement-dropdown-item"
                                    onClick={() => {
                                        setSortOrder('xpGained');
                                        setDropdown(false);
                                    }}
                                >
                                    XP
                                </button>
                            </div>
                        )}
                    </div>
                    <AchievementStat 
                        achievementCurrent={achievementCurrent}
                        achievementProgress={achievementProgress}
                        achievementTotal={achievementTotal}
                    />
                </div>
                <div className="achievement-list">
                    {achievements
                        .slice()
                        .filter((a) => {
                            if (sortOrder === 'taskCompletion') {
                                return a.goalType === 'taskCompletion';
                            } else if (sortOrder === 'xpGained') {
                                return a.goalType === 'xpGained';
                            } else {
                                return true;
                            }
                        })
                        .sort((a, b) => a.goalNum - b.goalNum)
                        .map((a) => (
                            <AchievementBox
                                key={a.achievementID}
                                icon={a.icon}
                                title={a.name}
                                description={a.description}
                                type={a.goalType}
                                amount={a.goalNum}
                                reward={`${a.rewardValue} ${a.rewardType === 'xp' ? 'XP' : a.rewardType === 'coins' ? '💰' : '🎁'}`}
                                current={a.current}
                                claimed={a.claimed}
                                onClaim={() => handleClaim(a.achievementID)}
                            />
                    ))}
                </div>
            </div>
        </>
    );
}

function AchievementBox ({ icon, title, description, amount, reward, claimed, current, onClaim }) {
    const [isClaimed, setClaimed] = useState(claimed); 
    const progressCount = current ?? 0;

    const handleClaimButton = () => { 
        if (!isClaimed && progressCount >= amount) {
            setClaimed(true); 
            onClaim(); 
        }
    };


    let buttonClass = 'locked'; 
    if (progressCount >= amount && !isClaimed) {
        buttonClass = 'enabled'; 
    } else if (isClaimed) {
        buttonClass = 'claimed'; 
    }

    return (
        <div className="achievement-box">
            <div className="achievement-title-icon">
                <h3> {title} </h3>
                <span className="achievement-icon">{icon}</span>
            </div>
            <div className="achievement-desc-progress">
                <div className="achievement-description">
                    {description}
                </div>
                <ProgressBar 
                    className="achievement-progress-bar" 
                    current={progressCount} 
                    total={amount ?? 1} 
                />
            </div>
            <div className="achievement-claim">
                <button 
                    className={`achievement-claim-button ${buttonClass}`}
                    onClick={handleClaimButton}
                > 
                    {isClaimed ? 'Claimed' : (progressCount >= amount ? 'Claim' : 'Locked')}
                </button> 
                <div className="achievement-reward">
                    <p>+{reward}</p>
                </div>
            </div>
        </div>
    );
}

function AchievementStat({ achievementCurrent, achievementProgress, achievementTotal }) {
    return (
        <div className="achievement-stat">
            <div className="achievement-stat-box">
                <Award size={24}/>
                <div className="achievement-stat-text">
                    <h4>Total Achievements</h4>
                    <p>{achievementCurrent}/{achievementTotal}</p>
                </div>
            </div>
            <div className="achievement-stat-box">
                <CheckCircle2 size={24}/>
                <div className="achievement-stat-text">
                    <h4>Achievement Progress</h4>
                    <p>{achievementProgress.toFixed(2)}%</p>
                </div>
            </div>
        </div>
    );
}

function ProgressBar({ className, current, total }) {
    const progress = (current/total) * 100;
    const displayCurrent = (current > total) ? total : current;

    return (
        <div className={className}>
            <div className="progress-bar">
                <div 
                    className="progress-bar-fill"
                    style={{ width: `${progress}%` }}
                >
                </div>
                <span className="progress-text">{`${displayCurrent}/${total}`}</span>
            </div>
        </div>
    );
}

export default Achievements;