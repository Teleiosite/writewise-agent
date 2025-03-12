
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, CalendarDays, Bookmark, TrendingUp, Target, PenTool } from "lucide-react";
import { StatsCard } from "./stats/StatsCard";
import { WordCountChart } from "./stats/WordCountChart";
import { ContentDistributionChart } from "./stats/ContentDistributionChart";
import { WritingTimeChart } from "./stats/WritingTimeChart";
import { GoalProgressChart } from "./stats/GoalProgressChart";
import { useWritingStats } from "./stats/useWritingStats";

interface WritingStatsProps {
  projectName: string;
}

export function WritingStats({ projectName }: WritingStatsProps) {
  const {
    wordCount,
    sessions,
    streakDays,
    progress,
    topicDistribution,
    goalProgress,
    timeDistribution,
    totalHours
  } = useWritingStats(projectName);

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
          <StatsCard 
            title="Total Words" 
            value={wordCount} 
            icon={<Bookmark className="h-8 w-8" />} 
            colorClass="text-blue-600" 
          />
          
          <StatsCard 
            title="Writing Sessions" 
            value={sessions} 
            icon={<Clock className="h-8 w-8" />} 
            colorClass="text-green-600" 
          />
          
          <StatsCard 
            title="Day Streak" 
            value={streakDays} 
            icon={<CalendarDays className="h-8 w-8" />} 
            colorClass="text-orange-600" 
          />
          
          <StatsCard 
            title="Hours Writing" 
            value={totalHours.toFixed(1)} 
            icon={<PenTool className="h-8 w-8" />} 
            colorClass="text-purple-600" 
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <WordCountChart progress={progress} />
          <ContentDistributionChart data={topicDistribution} title="Content Distribution" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WritingTimeChart data={timeDistribution} />
          <GoalProgressChart wordCount={wordCount} goalProgress={goalProgress} />
        </div>
      </CardContent>
    </Card>
  );
}
