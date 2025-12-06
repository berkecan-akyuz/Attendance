import { Card } from "./ui/card";
import { Users, UserCheck, Camera, TrendingUp } from "lucide-react";

interface DashboardStatsProps {
  onNavigateToUsers?: (filter?: string) => void;
  onNavigateToCameras?: () => void;
  onNavigateToReports?: (filter?: string) => void;
}

export function DashboardStats({ 
  onNavigateToUsers, 
  onNavigateToCameras, 
  onNavigateToReports 
}: DashboardStatsProps) {
  const stats = [
    {
      id: "students",
      title: "Total Students",
      value: "1,234",
      change: "+12%",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "up",
      onClick: () => onNavigateToUsers?.("students"),
    },
    {
      id: "present",
      title: "Present Today",
      value: "1,089",
      change: "88.2%",
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: "up",
      onClick: () => onNavigateToReports?.("today"),
    },
    {
      id: "cameras",
      title: "Active Cameras",
      value: "12/15",
      change: "80%",
      icon: Camera,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "neutral",
      onClick: () => onNavigateToCameras?.(),
    },
    {
      id: "attendance",
      title: "Avg Attendance",
      value: "92.5%",
      change: "+2.3%",
      icon: TrendingUp,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: "up",
      onClick: () => onNavigateToReports?.("average"),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <Card 
          key={stat.id} 
          className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105 active:scale-100"
          onClick={stat.onClick}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-gray-600 mb-1">{stat.title}</p>
              <p className="text-gray-900 mb-2">{stat.value}</p>
              <p
                className={`${
                  stat.trend === "up"
                    ? "text-green-600"
                    : stat.trend === "down"
                    ? "text-red-600"
                    : "text-gray-600"
                }`}
              >
                {stat.change}
              </p>
            </div>
            <div
              className={`w-12 h-12 ${stat.iconBg} rounded-lg flex items-center justify-center`}
            >
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}