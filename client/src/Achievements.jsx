import "./Achievements.css"

export default function AchievementCollection() {
    const achievement_props = [{ 
            icon: "🤩",
            title: "First Taste", 
            type: "EXP", 
            amount: 100, 
            reward: "10 🪙" 
        }, { 
            icon: "🤖",
            title: "Grinder", 
            type: "EXP", 
            amount: 1000, 
            reward: "100 🪙" 
        }, { 
            icon: "♾️",
            title: "Infinity", 
            type: "EXP", 
            amount: 1000000, 
            reward: "1000 🪙" 
        }, { 
            icon: "⌚",
            title: "Lunch Break", 
            type: "TIME", 
            amount: 1, 
            reward: "10 🪙"
        },
        { 
            icon: "🧠",
            title: "Addiction", 
            type: "TIME", 
            amount: 10 , 
            reward: "100 🪙"
        }, { 
            icon: "🦖☄️",
            title: "Time Master", 
            type: "TIME", 
            amount: 100, 
            reward: "10000 🪙" 
        }, { 
            icon: "🐒",
            title: "Task Novice", 
            type: "TASK", 
            amount: 5, 
            reward: "10 🪙" 
        }, { 
            icon: "🦄",
            title: "Task Guru", 
            type: "TASK", 
            amount: 50,
            reward: "100 🪙"
        }, { 
            icon: "🗿",
            title: "Task Titan", 
            type: "TASK", 
            amount: 100, 
            reward: "1000 🪙"
    }];

    return (
        <>
            <div className="achievements-layout">
                {achievement_props.map((achievement_prop, id) => (
                    <AchievementBox
                        key={id} 
                        icon={achievement_prop.icon}
                        title={achievement_prop.title}
                        type={achievement_prop.type}
                        amount={achievement_prop.amount}
                        reward={achievement_prop.reward}
                    />
                ))}
            </div>
        </>
    );
}

function AchievementBox ({ icon, title, type, amount, reward }) {
    const achievement_description = {
        EXP: <p>You have accumulated <span className="exp-font">{amount}</span> EXP.</p>,
        TASK: <p>You have completed <span className="task-font">{amount}</span> tasks.</p>,
        TIME: <p>You have spent <span className="time-font">{amount}</span> hours completing tasks.</p>,
    };

    const mock_progress = 0.5;

    return (
        <>
            <div className="achievements-outer">
                <h3> {title} </h3>
                <span className="achievements-icon">{icon}</span>
                <progress className="achievements-progress" value={mock_progress} />
                <div className="achievements-inner">
                    {achievement_description[type]}
                </div>
                <div className="achievements-reward">
                    <p>+{reward}</p>
                </div>
            </div>
        </>
    );
}