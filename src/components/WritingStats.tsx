
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Clock, CalendarDays, Bookmark, TrendingUp } from "lucide-react";

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
    }

    // Sample progress data
    const sampleProgress: DailyProgress[] = Array.from({ length: 7 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: `${date.getMonth() + 1}/${date.getDate()}`,
        wordCount: Math.floor(Math.random() * 500) + 100,
      };
    });
    setProgress(sampleProgress);

    // Sample topic distribution
    setTopicDistribution([
      { name: "Introduction", value: 20 },
      { name: "Methods", value: 30 },
      { name: "Results", value: 25 },
      { name: "Discussion", value: 15 },
      { name: "Conclusion", value: 10 },
    ]);
  }, [projectName]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          Writing Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
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
        </div>
        
        <div className="space-y-6">
          <div>
            <h4 className="text-sm font-medium mb-2">Word Count Progress</h4>
            <div className="h-[200px] w-full">
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
          </div>
          
          <div>
            <h4 className="text-sm font-medium mb-2">Content Distribution</h4>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicDistribution} margin={{ top: 5, right: 5, bottom: 20, left: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
