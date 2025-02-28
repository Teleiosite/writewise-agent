
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { Calendar, CheckCircle2, Target, Clock, Edit, ListTodo } from "lucide-react";

interface WritingGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: "words" | "pages" | "sections" | "citations";
  deadline?: Date;
  completed: boolean;
}

interface WritingTrackerProps {
  projectName: string;
}

export function WritingTracker({ projectName }: WritingTrackerProps) {
  const [goals, setGoals] = useState<WritingGoal[]>([]);
  const [dailyTarget, setDailyTarget] = useState(500);
  const [todaysWords, setTodaysWords] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    // In a real app, this would fetch from local storage or an API
    // For demo, we'll generate sample goals
    const sampleGoals: WritingGoal[] = [
      {
        id: "1",
        title: "Complete first draft",
        target: 5000,
        current: 2340,
        unit: "words",
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        completed: false,
      },
      {
        id: "2",
        title: "Research sources",
        target: 15,
        current: 9,
        unit: "citations",
        deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        completed: false,
      },
      {
        id: "3",
        title: "Complete methodology section",
        target: 1,
        current: 1,
        unit: "sections",
        completed: true,
      },
    ];
    
    setGoals(sampleGoals);
    
    // Simulate today's progress
    const savedContent = localStorage.getItem(`draft-${projectName}`);
    if (savedContent) {
      const parsed = JSON.parse(savedContent);
      // Calculate words written today (for demo purposes, random between 0-dailyTarget)
      const randomProgress = Math.floor(Math.random() * dailyTarget);
      setTodaysWords(randomProgress);
    }
  }, [projectName, dailyTarget]);

  const completeGoal = (goalId: string) => {
    setGoals(goals.map(goal => 
      goal.id === goalId 
        ? { ...goal, completed: true } 
        : goal
    ));
    
    toast({
      title: "Goal completed! 🎉",
      description: "Congratulations on reaching your writing goal!",
    });
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Writing Goals & Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Edit className="h-5 w-5 text-blue-600" />
                    <h3 className="font-medium">Today's Progress</h3>
                  </div>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{todaysWords} words</span>
                    <span className="text-muted-foreground">{dailyTarget} words goal</span>
                  </div>
                  <Progress value={getProgressPercentage(todaysWords, dailyTarget)} />
                </div>
                
                <div className="text-xs text-muted-foreground">
                  {todaysWords >= dailyTarget ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Daily goal achieved!</span>
                    </div>
                  ) : (
                    <span>{dailyTarget - todaysWords} words remaining to reach your daily goal</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-blue-600" />
              Writing Goals
            </h3>
          </div>
          
          <ScrollArea className="h-[320px] pr-4">
            <div className="space-y-3">
              {goals.map((goal) => (
                <Card key={goal.id} className={`p-4 ${goal.completed ? 'bg-green-50' : ''}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{goal.title}</h4>
                        <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                          {goal.deadline && (
                            <>
                              <Calendar className="h-3 w-3" />
                              <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {goal.completed ? (
                        <span className="flex items-center text-green-600 text-sm">
                          <CheckCircle2 className="h-4 w-4 mr-1" />
                          Complete
                        </span>
                      ) : (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => completeGoal(goal.id)}
                        >
                          Mark Done
                        </Button>
                      )}
                    </div>
                    
                    {!goal.completed && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{goal.current} {goal.unit}</span>
                          <span className="text-muted-foreground">{goal.target} {goal.unit}</span>
                        </div>
                        <Progress value={getProgressPercentage(goal.current, goal.target)} />
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
