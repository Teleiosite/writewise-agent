
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import {
  Calendar, CheckCircle2, Target, Clock,
  Edit, ListTodo, Plus, Loader2, Trash2,
} from "lucide-react";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";

interface WritingGoal {
  id: string;
  title: string;
  target: number;
  current: number;
  unit: "words" | "pages" | "sections" | "citations";
  deadline?: string | null;
  completed: boolean;
}

interface WritingTrackerProps {
  projectName: string;
}

export function WritingTracker({ projectName }: WritingTrackerProps) {
  const { user } = useAuth();
  const { projects } = useProjects();
  const { toast } = useToast();

  const [goals, setGoals] = useState<WritingGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [dailyTarget] = useState(500);
  const [todaysWords, setTodaysWords] = useState(0);
  const [newGoal, setNewGoal] = useState({
    title: "",
    target: 1000,
    unit: "words" as WritingGoal["unit"],
    deadline: "",
  });

  const project = projects.find(p => p.name === projectName);

  // Pull today's word count directly from project row
  useEffect(() => {
    if (project?.word_count) setTodaysWords(project.word_count);
  }, [project?.word_count]);

  // Fetch goals from Supabase
  const fetchGoals = async () => {
    if (!user || !project?.id) { setIsLoading(false); return; }

    const { data, error } = await supabase
      .from("writing_goals")
      .select("*")
      .eq("project_id", project.id)
      .order("created_at", { ascending: false });

    if (error) console.error("Error fetching goals:", error);
    else setGoals(data ?? []);
    setIsLoading(false);
  };

  useEffect(() => { fetchGoals(); }, [user?.id, project?.id]);

  const completeGoal = async (goalId: string) => {
    const { error } = await supabase
      .from("writing_goals")
      .update({ completed: true })
      .eq("id", goalId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setGoals(prev => prev.map(g => g.id === goalId ? { ...g, completed: true } : g));
      toast({ title: "Goal completed! 🎉", description: "Congratulations on reaching your writing goal!" });
    }
  };

  const deleteGoal = async (goalId: string) => {
    const { error } = await supabase
      .from("writing_goals")
      .delete()
      .eq("id", goalId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setGoals(prev => prev.filter(g => g.id !== goalId));
      toast({ title: "Goal deleted" });
    }
  };

  const addGoal = async () => {
    if (!user || !project?.id || !newGoal.title.trim()) return;

    const { data, error } = await supabase
      .from("writing_goals")
      .insert([{
        user_id: user.id,
        project_id: project.id,
        title: newGoal.title.trim(),
        target: newGoal.target,
        current: 0,
        unit: newGoal.unit,
        deadline: newGoal.deadline ? new Date(newGoal.deadline).toISOString() : null,
        completed: false,
      }])
      .select()
      .single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setGoals(prev => [data, ...prev]);
      setNewGoal({ title: "", target: 1000, unit: "words", deadline: "" });
      setShowAddForm(false);
      toast({ title: "Goal added", description: `"${data.title}" has been added.` });
    }
  };

  const pct = (current: number, target: number) =>
    Math.min(Math.round((current / target) * 100), 100);

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600" />
          Writing Goals &amp; Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Today's word count progress */}
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
                  <Progress value={pct(todaysWords, dailyTarget)} />
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

        {/* Goals list */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium flex items-center gap-2">
              <ListTodo className="h-5 w-5 text-blue-600" />
              Writing Goals
            </h3>
            <Button size="sm" variant="outline" onClick={() => setShowAddForm(v => !v)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Goal
            </Button>
          </div>

          {/* Add goal form */}
          {showAddForm && (
            <Card className="p-4 border-dashed">
              <div className="space-y-3">
                <Input
                  placeholder="Goal title (e.g., Complete first draft)"
                  value={newGoal.title}
                  onChange={e => setNewGoal(p => ({ ...p, title: e.target.value }))}
                />
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    placeholder="Target"
                    min={1}
                    value={newGoal.target}
                    onChange={e => setNewGoal(p => ({ ...p, target: Number(e.target.value) }))}
                  />
                  <Select
                    value={newGoal.unit}
                    onValueChange={v => setNewGoal(p => ({ ...p, unit: v as WritingGoal["unit"] }))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="words">Words</SelectItem>
                      <SelectItem value="pages">Pages</SelectItem>
                      <SelectItem value="sections">Sections</SelectItem>
                      <SelectItem value="citations">Citations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Input
                  type="date"
                  value={newGoal.deadline}
                  onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-grow"
                    disabled={!newGoal.title.trim()}
                    onClick={addGoal}
                  >
                    Save Goal
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          <ScrollArea className="h-[320px] pr-4">
            {goals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-3 opacity-25" />
                <p className="text-sm">No goals yet. Add your first writing goal!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {goals.map(goal => (
                  <Card
                    key={goal.id}
                    className={`p-4 ${goal.completed ? "bg-green-50 dark:bg-green-950/20" : ""}`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-grow min-w-0">
                          <h4 className="font-medium truncate">{goal.title}</h4>
                          {goal.deadline && (
                            <div className="flex items-center gap-1 text-muted-foreground text-xs mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>Due: {new Date(goal.deadline).toLocaleDateString()}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          {goal.completed ? (
                            <span className="flex items-center text-green-600 text-sm">
                              <CheckCircle2 className="h-4 w-4 mr-1" />
                              Done
                            </span>
                          ) : (
                            <Button size="sm" variant="outline" onClick={() => completeGoal(goal.id)}>
                              Mark Done
                            </Button>
                          )}
                          <Button size="sm" variant="ghost" onClick={() => deleteGoal(goal.id)}>
                            <Trash2 className="h-3 w-3 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>

                      {!goal.completed && (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{goal.current} {goal.unit}</span>
                            <span className="text-muted-foreground">{goal.target} {goal.unit}</span>
                          </div>
                          <Progress value={pct(goal.current, goal.target)} />
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
