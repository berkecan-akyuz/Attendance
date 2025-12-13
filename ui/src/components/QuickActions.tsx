import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UserPlus, Camera, FileText, Settings, Radio } from "lucide-react";

interface QuickActionsProps {
  onNavigateToRegister?: () => void;
  onNavigateToCameras?: () => void;
  onNavigateToReports?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToLive?: () => void;
}

const missingHandler = (destination: string) => () =>
  console.warn(`QuickActions navigation is not wired: ${destination}`);

export function QuickActions({
  onNavigateToRegister = missingHandler("register"),
  onNavigateToCameras = missingHandler("cameras"),
  onNavigateToReports = missingHandler("reports"),
  onNavigateToSettings = missingHandler("settings"),
  onNavigateToLive = missingHandler("live"),
}: QuickActionsProps) {
  const actions = [
    {
      title: "Live Monitoring",
      description: "Monitor real-time attendance",
      icon: Radio,
      color: "text-red-600",
      bgColor: "bg-red-50",
      hoverColor: "hover:bg-red-100",
      action: onNavigateToLive,
    },
    {
      title: "Add Student",
      description: "Register a new student in the system",
      icon: UserPlus,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      hoverColor: "hover:bg-blue-100",
      action: onNavigateToRegister,
    },
    {
      title: "Configure Camera",
      description: "Set up or modify camera settings",
      icon: Camera,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      hoverColor: "hover:bg-purple-100",
      action: onNavigateToCameras,
    },
    {
      title: "Generate Report",
      description: "Create attendance reports and analytics",
      icon: FileText,
      color: "text-green-600",
      bgColor: "bg-green-50",
      hoverColor: "hover:bg-green-100",
      action: onNavigateToReports,
    },
    {
      title: "System Settings",
      description: "Configure system preferences",
      icon: Settings,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      hoverColor: "hover:bg-orange-100",
      action: onNavigateToSettings,
    },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.action}
              className="text-left p-4 border border-gray-200 rounded-lg hover:shadow-md transition-all"
            >
              <div className="flex flex-col items-center text-center space-y-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.bgColor} ${action.hoverColor} transition-colors`}>
                  <action.icon className={`w-6 h-6 ${action.color}`} />
                </div>
                <div className="flex-1">
                  <p className="text-gray-900 mb-1">{action.title}</p>
                  <p className="text-gray-500">{action.description}</p>
                </div>
              </div>
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}