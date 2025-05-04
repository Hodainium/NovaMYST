type TaskDifficulty = "easy" | "medium" | "medium-hard" | "hard" | "very-hard"; // depending on difficulty XP and time taken will change

interface Task {
    taskID: string;
    assignedTo: string; // ID of the user
    difficulty: TaskDifficulty;
    title: string;
    createdAt: FirebaseFirestore.Timestamp; // change this to date if needed
    isComplete: boolean; 
    dueDate: Date;
    xp: number;
}

const difficultyConfig: {
    [key in TaskDifficulty]: { xp: number; time: number };
  } = {
    easy: { xp: 50, time: 30 },
    medium: { xp: 150, time: 60 },
    "medium-hard": { xp: 250, time: 90 },
    hard: { xp: 400, time: 120 },
    "very-hard": { xp: 600, time: 180 }
  };

module.exports = {
    Task: {
        taskID: "",
        assignedTo: "", // ID of the user
        difficulty: "easy",
        title: "",
        createdAt: null, // change this to date if needed
        isComplete: false,
        dueDate: null,
        xp: 1
    },
    difficultyConfig
  };


