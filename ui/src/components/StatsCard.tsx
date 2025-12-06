import { Card, CardContent } from "./ui/card";
import { Users, UserCheck, Camera, TrendingUp } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string;
  icon: "users" | "user-check" | "camera" | "chart";
  color: "blue" | "green" | "purple" | "orange";
  trend?: string;
  status?: string;
}

export function StatsCard({ title, value, icon, color, trend, status }: StatsCardProps) {
  const iconMap = {
    users: Users,
    "user-check": UserCheck,
    camera: Camera,
    chart: TrendingUp,
  };

  const colorMap = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
  };

  const Icon = iconMap[icon];

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-gray-600 mb-2">{title}</p>
            <p className="text-gray-900 mb-1">{value}</p>
            {trend && (
              <p className="text-green-600">{trend} from last week</p>
            )}
            {status && (
              <p className="text-green-600 capitalize">{status}</p>
            )}
          </div>
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
