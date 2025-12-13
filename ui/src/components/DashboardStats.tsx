import { Card } from "./ui/card";
import { Users, UserCheck, Camera, TrendingUp } from "lucide-react";
import { OverviewStats } from "../lib/api";

interface DashboardStatsProps {
  onNavigateToUsers?: (filter?: string) => void;
  onNavigateToCameras?: () => void;
  onNavigateToReports?: (filter?: string) => void;
  stats?: OverviewStats | null;
}

export function DashboardStats({
  onNavigateToUsers,
  onNavigateToCameras,
  onNavigateToReports,
  stats,
}: DashboardStatsProps) {
  const cards = [
    {
      id: "students",
      title: "Total Students",
      value: stats?.total_students ?? "-",
      change: "From SQL Server",
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      trend: "up",
      onClick: () => onNavigateToUsers?.("students"),
    },
    {
      id: "teachers",
      title: "Total Teachers",
      value: stats?.total_teachers ?? "-",
      change: "Assigned lecturers",
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      trend: "neutral",
      onClick: () => onNavigateToUsers?.("teachers"),
    },
    {
      id: "lectures",
      title: "Active Lectures",
      value: stats?.total_lectures ?? "-",
      change: "Scheduled classes",
      icon: Camera,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      trend: "neutral",
      onClick: () => onNavigateToCameras?.(),
    },
    {
      id: "enrollments",
      title: "Total Enrollments",
      value: stats?.total_enrollments ?? "-",
      change: "Student-course links",
      icon: TrendingUp,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      trend: "up",
      onClick: () => onNavigateToReports?.("average"),
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((stat) => (
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