
import { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  colorClass?: string;
}

export function StatsCard({ title, value, icon, colorClass = "text-blue-600" }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          <div className={`h-8 w-8 ${colorClass} opacity-80`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
