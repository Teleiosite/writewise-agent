
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";

interface GoalProgressChartProps {
  wordCount: number;
  goalProgress: number;
}

export function GoalProgressChart({ wordCount, goalProgress }: GoalProgressChartProps) {
  const goalData = [{name: "Words", actual: wordCount, target: 5000}];
  
  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium mb-2">Progress Toward Goal</h4>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={goalData} layout="vertical">
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
  );
}
