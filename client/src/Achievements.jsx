import { useState } from 'react';
import { Award, CheckCircle2 } from 'lucide-react';
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
    const [achievementCurrent, setAchievementCurrent] = useState(0); 
    const achievementTotal = 9; 
    const achievementProgress = (achievementCurrent/achievementTotal) * 100; 
    
    const achievementList = [{ 
        id: 1,
        icon: "🤩",
        title: "First Taste", 
        type: "EXP", 
        amount: 100, 
        reward: "10 🪙",
        claimed: false
    }, { 
        id: 2,
        icon: "🤖",
        title: "Grinder", 
        type: "EXP", 
        amount: 1000, 
        reward: "100 🪙",
        claimed: false
    }, { 
        id: 3,
        icon: "♾️",
        title: "Infinity", 
        type: "EXP", 
        amount: 1000000, 
        reward: "1000 🪙",
        claimed: false
    }, { 
        id: 4,
        icon: "⌚",
        title: "Lunch Break", 
        type: "TIME", 
        amount: 1, 
        reward: "10 🪙",
        claimed: true
    },
    { 
        id: 5,
        icon: "🧠",
        title: "Addiction", 
        type: "TIME", 
        amount: 10 , 
        reward: "100 🪙",
        claimed: false
    }, { 
        id: 6,
        icon: "🦖☄️",
        title: "Time Master", 
        type: "TIME", 
        amount: 100, 
        reward: "10000 🪙",
        claimed: false
    }, { 
        id: 7,
        icon: "🐒",
        title: "Task Novice", 
        type: "TASK", 
        amount: 5, 
        reward: "10 🪙",
        claimed: true
    }, { 
        id: 8,
        icon: "🦄",
        title: "Task Guru", 
        type: "TASK", 
        amount: 50,
        reward: "100 🪙",
        claimed: false 
    }, { 
        id: 9,
        icon: "🗿",
        title: "Task Titan", 
        type: "TASK", 
        amount: 100, 
        reward: "1000 🪙",
        claimed: false 
    }];

    /*
        handles the achievementCurrent/achievementTotal stat on the side
        When you click claim on an achievement, it increases the count of how many achievements you completed

        Probably do not need the else statement but it's there to handle a problem I had 
        if the user is allowed to click more than the total but that shouldn't be possible now.

        To do:
        replace with database functionality
    */
    function handleClaimStats() {
        if (achievementCurrent < achievementTotal) {
            setAchievementCurrent(prevachievementCurrent => prevachievementCurrent + 1);
        } else {
            setAchievementCurrent(achievementTotal);
        }
    }

    return (
        <div className="achievement-layout">
            <AchievementStat // replace variables
                achievementCurrent={achievementCurrent}
                achievementProgress={achievementProgress}
                achievementTotal={achievementTotal}
            />
            <div className="achievement-list">
                {achievementList.map((achievementList) => (
                    <AchievementBox
                        /*
                            Maps each data from our list to an individual box

                            id is mainly there for the "missing key prop" issue that comes from mapping/arrays, 
                            search up the issue if you need
                            
                            To do:
                            We need to do this part to handle the different types of achievements and because
                            our progressBar is tracking three different types of data.

                            Add a prop (name whatever you like) example: currentNumber={user.EXP or user.taskCount}

                            if achievementList.type == EXP, TASK, or TIME, 
                                currentNumber={user.whatevertype}

                            currentNumber gets passed into the spots needed
                        */
                        key={achievementList.id} 
                        icon={achievementList.icon}
                        title={achievementList.title}
                        type={achievementList.type}
                        amount={achievementList.amount}
                        reward={achievementList.reward}
                        claimed={achievementList.claimed}
                        onClaim={handleClaimStats}
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
function AchievementBox ({ icon, title, type, amount, reward, claimed, onClaim }) {
    const [isClaimed, setClaimed] = useState(claimed); // claimed variable from our achievements
    const mockCount = 50;
    /*
        Can move the description into the database but not sure how that interacts with styling (colored numbers in the view)
        If you do decide to move it into the database and turn it into a full on string including the numbers, 
        you must also keep the {amount}/number variable a separate thing because our progressBar and functionality is based on it.

        You can probably just leave it here.
    */
    const achievement_description = { 
        EXP: <p>You have accumulated <span className="exp-font">{amount}</span> EXP.</p>,
        TASK: <p>You have completed <span className="task-font">{amount}</span> tasks.</p>,
        TIME: <p>You have spent <span className="time-font">{amount}</span> hours completing tasks.</p>,
    };
    /*
        Decides what happens when we click our claim button

        To do:
        Should add coins to the user
        Database functionality
    */
    const handleClaimButton = () => { 
        if (!isClaimed && mockCount >= amount) {
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
    if (mockCount >= amount && !isClaimed) {
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
                    {achievement_description[type]}
                </div>
                <ProgressBar 
                    className="achievement-progress-bar" 
                    current={mockCount} 
                    total={amount} 
                />
            </div>
            <div className="achievement-claim">
                <button 
                    className={`achievement-claim-button ${buttonClass}`}
                    onClick={handleClaimButton}
                > 
                    {isClaimed ? 'Claimed' : (mockCount >= amount ? 'Claim' : 'Locked')}
                </button> 
                <div className="achievement-reward">
                    <p>+{reward}</p>
                </div>
            </div>
        </div>
    );
}

/*
    Reference AchievementDashboard() for this:
    replace the props with the data from the database

    achievementTotal can be removed if you decide to just enter the number instead of allowing it to dynamically change.

    You can also just ask me to delete this and move it into AchievementDashboard if that makes it easier to code.
*/
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

/*
Do not have to change anything here I think
*/
function ProgressBar({ className, current, total }) {
    const progress = (current/total) * 100; // shows current progress
    const displayCurrent = (current > total) ? total : current; // prevents overflowing so 150/100

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