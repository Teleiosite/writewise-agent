
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card } from "@/components/ui/card";

interface TimeDistribution {
  name: string;
  value: number;
  color: string;
}

interface WritingTimeChartProps {
  data: TimeDistribution[];
}

export function WritingTimeChart({ data }: WritingTimeChartProps) {
  return (
    <Card className="p-4">
      <h4 className="text-sm font-medium mb-2">Writing Time Distribution</h4>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={80}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
