
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { Clock, CalendarDays, Bookmark, TrendingUp, Target, PenTool } from "lucide-react";

interface WritingStatsProps {
  projectName: string;
}

interface DailyProgress {
  date: string;
  wordCount: number;
}

export function WritingStats({ projectName }: WritingStatsProps) {
  const [wordCount, setWordCount] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [progress, setProgress] = useState<DailyProgress[]>([]);
  const [topicDistribution, setTopicDistribution] = useState<any[]>([]);
  const [goalProgress, setGoalProgress] = useState<number>(0);

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
  }, [projectName]);

  // Sample data for writing time distribution
  const timeDistribution = [
    { name: "Morning", value: 35, color: "#3b82f6" },
    { name: "Afternoon", value: 40, color: "#10b981" },
    { name: "Evening", value: 25, color: "#8b5cf6" },
  ];

  // Calculate total hours spent writing (mock data)
  const totalHours = sessions * 1.5; // Assuming average session is 1.5 hours

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Writing Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Words</p>
                  <p className="text-2xl font-bold">{wordCount}</p>
                </div>
                <Bookmark className="h-8 w-8 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Writing Sessions</p>
                  <p className="text-2xl font-bold">{sessions}</p>
                </div>
                <Clock className="h-8 w-8 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                  <p className="text-2xl font-bold">{streakDays}</p>
                </div>
                <CalendarDays className="h-8 w-8 text-orange-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Hours Writing</p>
                  <p className="text-2xl font-bold">{totalHours.toFixed(1)}</p>
                </div>
                <PenTool className="h-8 w-8 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">Word Count Progress</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={progress} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="wordCount" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={{ fill: '#2563eb', strokeWidth: 2 }}
                    activeDot={{ r: 6 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">Content Distribution</h4>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={topicDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {topicDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">Writing Time Distribution</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={timeDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {timeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <Card className="p-4">
            <h4 className="text-sm font-medium mb-2">Progress Toward Goal</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{name: "Words", actual: wordCount, target: 5000}]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} width={80} />
                  <Tooltip />
                  <Bar dataKey="actual" fill="#3b82f6" name="Current" radius={[0, 4, 4, 0]}>
                    <Cell fill="#3b82f6" />
                  </Bar>
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" radius={[0, 4, 4, 0]}>
                    <Cell fill="#e5e7eb" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="text-center mt-4">
                <p className="text-sm text-muted-foreground">
                  {goalProgress}% of 5,000 word goal completed
                </p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${goalProgress}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
}
