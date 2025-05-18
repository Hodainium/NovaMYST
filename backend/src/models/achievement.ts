export interface Achievement {
    achievementID: string;
    name: string;
    description: string;
    icon: string;
    goalNum: number;
    goalType: 'taskCompletion' | 'loginStreak' | 'hardTasks' | 'xpGained'; 
    rewardType: 'xp' | 'coins' | 'item'; 
    rewardValue: number;        
}

export interface AchievementProgress {
    achievementID: string;
    current: number;
    completed: boolean;
    claimed: boolean;
}