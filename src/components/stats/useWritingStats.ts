
import { useState, useEffect } from "react";

interface DailyProgress {
  date: string;
  wordCount: number;
}

interface ContentItem {
  name: string;
  value: number;
  color: string;
}

interface TimeDistribution {
  name: string;
  value: number;
  color: string;
}

export function useWritingStats(projectName: string) {
  const [wordCount, setWordCount] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [topicDistribution, setTopicDistribution] = useState<ContentItem[]>([]);
  const [goalProgress, setGoalProgress] = useState<number>(0);
  const [totalHours, setTotalHours] = useState(0);

  const timeDistribution: TimeDistribution[] = [
    { name: "Morning", value: 35, color: "#3b82f6" },
    { name: "Afternoon", value: 40, color: "#10b981" },
    { name: "Evening", value: 25, color: "#8b5cf6" },
  ];

  useEffect(() => {
    // In a real app, this would fetch data from local storage or an API
    // For demo purposes, we'll generate some sample data
    const savedContent = localStorage.getItem(`draft-${projectName}`);
    if (savedContent) {
      const parsed = JSON.parse(savedContent);
      const totalWords = parsed.sections.reduce(
        (sum: number, section: any) => 
          sum + (section.content.trim().split(/\s+/).filter(Boolean).length || 0), 
        0
      );
      setWordCount(totalWords);
      setSessions(Math.floor(Math.random() * 10) + 1);
      setStreakDays(Math.floor(Math.random() * 7) + 1);
      
      // Calculate goal progress - assume 5000 words goal
      const goalTarget = 5000;
      setGoalProgress(Math.min(Math.round((totalWords / goalTarget) * 100), 100));
    }

    // Sample progress data - last 14 days
    const sampleProgress: DailyProgress[] = Array.from({ length: 14 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        wordCount: Math.floor(Math.random() * 500) + 100,
      };
    });
    setProgress(sampleProgress);

    // Sample topic distribution based on template sections
    setTopicDistribution([
      { name: "Introduction", value: 20, color: "#3b82f6" },
      { name: "Methods", value: 30, color: "#10b981" },
      { name: "Results", value: 25, color: "#f59e0b" },
      { name: "Discussion", value: 15, color: "#8b5cf6" },
      { name: "Conclusion", value: 10, color: "#ef4444" },
    ]);

    // Calculate total hours spent writing (mock data)
    setTotalHours(sessions * 1.5); // Assuming average session is 1.5 hours
  }, [projectName, sessions]);

  return {
    wordCount,
    sessions,
    streakDays,
    progress,
    topicDistribution,
    goalProgress,
    timeDistribution,
    totalHours
  };
}
