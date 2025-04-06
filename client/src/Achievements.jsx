import { useState, useEffect } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
import { auth } from './firebase';
import "./Achievements.css";

function AchievementDashboard() {
    /*
        This function just combines the other two components and also creates the page layout, also contains
        the variables and functions if we ever need to pass those.
        prop = parameters in React if you did not already know

        achievementCurrent: get from database
        achievementTotal: can be left here if you dont want total to be dynamic
        achievementList: get from the database and set all the claimed to false, the claimed that are true are just to test
        achievementProgress: leave here but replace variables, this makes achievementCurrent/achievementTotal into a percent
        Can also replace it with some other stat if you want.
    */

    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true)

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
        <div className="achievement-layout">
            <AchievementStat // replace variables
                achievementCurrent={achievementCurrent}
                achievementProgress={achievementProgress}
                achievementTotal={achievementTotal}
            />
            <div className="achievement-list">
                {achievements.map((a) => (
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
                        onClaim={() => handleClaim(a.achievementID)} // We'll wire this in soon
                    />
                    ))}
            </div>
        </div>
    );
}

/*
    represents each box in the achievementList

    parameters: all parameters self explanatory except onClaim
                onClaim holds a function that links us to the achievementStats

    Reference achievementBox for the stuff below:
    Add database functionality
    Add a prop to this like AchievementBox ({ icon, title, type, amount, reward, claimed, currentNumber, onClaim })
    Replace the mockCounts with that prop.
    mockCount tells us the current number of whatever activity we are doing. We need it for our progressBar and state of button.
*/
function AchievementBox ({ icon, title, description, type, amount, reward, claimed, current, onClaim }) {
    const [isClaimed, setClaimed] = useState(claimed); // claimed variable from our achievements
    const progressCount = current ?? 0;
    /*
        Can move the description into the database but not sure how that interacts with styling (colored numbers in the view)
        If you do decide to move it into the database and turn it into a full on string including the numbers, 
        you must also keep the {amount}/number variable a separate thing because our progressBar and functionality is based on it.

        You can probably just leave it here.
    */
    /*
        Decides what happens when we click our claim button

        To do:
        Should add coins to the user
        Database functionality
    */
    const handleClaimButton = () => { 
        if (!isClaimed && progressCount >= amount) {
            setClaimed(true); // sets the achievement to completed so our claimed variable will now be true
            onClaim(); // calls the function that updates our stats since onClaim={handleClaimStats}
        }
    };

    /*
        handles the button functionality and the state it currently is in, it just reads from the conditions
        and decides what happens

        (locked, enabled, claimed) are what we put into the css variable and it reads from the css file 
        and changes functionality based on that (like not being able to click, greyed out). You can leave
        buttonClass alone most likely.

        To do:
        Change to database variables (mockCount, isClaimed)
    */
    let buttonClass = 'locked'; 
    if (progressCount >= amount && !isClaimed) {
        buttonClass = 'enabled'; 
    } else if (isClaimed) {
        buttonClass = 'claimed'; 
    }

    /*
        {isClaimed ? 'Claimed' : (mockCount >= amount ? 'Claim' : 'Locked')}
        means isClaimed=True set the text to Claimed 
        otherwise if requirements are meant set text to Claim
        otherwise make text say Locked

        To do:
        ignore buttonClass and replace variables and add database functionality
    */
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

export default AchievementDashboard;