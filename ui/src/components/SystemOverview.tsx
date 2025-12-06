import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, BookOpen, Camera, CheckCircle } from "lucide-react";

export function SystemOverview() {
  const metrics = [
    {
      title: "Total Students",
      value: "1,248",
      change: "+12% from last month",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Classes",
      value: "42",
      change: "3 new this semester",
      icon: BookOpen,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Cameras Online",
      value: "24/24",
      change: "All operational",
      icon: Camera,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg. Attendance",
      value: "94.2%",
      change: "+2.1% this week",
      icon: CheckCircle,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div>
      <h2 className="text-gray-900 mb-6">System Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${metric.bgColor}`}>
                  <metric.icon className={`w-6 h-6 ${metric.color}`} />
                </div>
              </div>
              <div>
                <p className="text-gray-600 mb-1">{metric.title}</p>
                <p className="text-gray-900 mb-2">{metric.value}</p>
                <p className="text-gray-500">{metric.change}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
