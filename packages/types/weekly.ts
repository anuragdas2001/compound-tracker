export interface WeeklyProgress {
    id: string;
    name: string;
    color: string;
  
    longestStreak: number;
    currentStreak: number;
  
    days: {
      date: string;
      completed: boolean;
    }[];
  }