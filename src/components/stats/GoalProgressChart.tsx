import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { Card } from "@/components/ui/card";

interface GoalProgressChartProps {
  wordCount: number;
  goalProgress: number;
}

export function GoalProgressChart({ wordCount, goalProgress }: GoalProgressChartProps) {
  const goalData = [{name: "Words", actual: wordCount, target: 5000}];
  
  return (
    <Card className="p-4 rounded-none border border-black dark:border-zinc-800 bg-white dark:bg-black font-sans shadow-none">
      <h4 className="text-xs font-mono font-bold uppercase tracking-wider mb-3 text-black dark:text-white">Progress Toward Goal</h4>
      <div className="h-[200px] w-full font-mono text-xs">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={goalData} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
            <XAxis type="number" />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={70} />
            <Tooltip />
            <Bar dataKey="actual" fill="#000000" name="Current" radius={[0, 0, 0, 0]}>
              <Cell fill="#000000" />
            </Bar>
            <Bar dataKey="target" fill="#e4e4e7" name="Target" radius={[0, 0, 0, 0]}>
              <Cell fill="#e4e4e7" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="text-center mt-4 font-mono text-xs">
          <p className="text-zinc-600 dark:text-zinc-400">
            {goalProgress}% of 5,000 word target completed
          </p>
          <div className="w-full bg-zinc-100 dark:bg-zinc-900 border border-black dark:border-zinc-800 h-2 mt-2">
            <div 
              className="bg-black dark:bg-white h-2" 
              style={{ width: `${goalProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
    </Card>
  );
}
