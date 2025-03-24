type TaskDifficulty = "easy" | "medium" | "hard" // depending on difficulty XP and time taken will change

interface Task {
    taskID: string;
    assignedTo: string; // ID of the user
    difficulty: TaskDifficulty;
    title: string;
    createdAt: FirebaseFirestore.Timestamp; // change this to date if needed
    isComplete: boolean; 
    dueDate: Date;
}

const difficultyConfig: { // make a map that takes in a key (difficulty) to give you the XP and time needed for the difficulty
    [key in TaskDifficulty]: { xp: number; time: number };
} = {  
    easy: { xp: 50, time: 30},  // time in minutes
    medium: { xp: 150, time: 60},
    hard: { xp: 300, time : 120},
}

module.exports = {
    Task: {
        taskID: "",
        assignedTo: "", // ID of the user
        difficulty: "easy",
        title: "",
        createdAt: null, // change this to date if needed
        isComplete: false,
        dueDate: null
    },
    difficultyConfig
  };


