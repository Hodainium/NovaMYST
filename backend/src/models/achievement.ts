export interface Achievement {
    achievementID: string;
    name: string;
    description: string;
    icon: string;
    goalNum: number; // e.g., 10 tasks
    goalType: 'taskCompletion' | 'loginStreak' | 'hardTasks' | 'xpGained'; // define how progress is tracked
    rewardType: 'xp' | 'coins' | 'item'; // explicitly define the reward type
    rewardValue: number;        // the value of the reward (e.g., 100 XP or 50 coins)
}

export interface AchievementProgress {
    achievementID: string;
    current: number;
    completed: boolean;
    claimed: boolean;
}