import { useState } from "react";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Badge } from "./ui/badge";
import {
  UserPlus,
  UserCheck,
  Camera,
  AlertTriangle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface RecentActivityProps {
  onViewAllActivity?: () => void;
  onActivityClick?: (activityId: number) => void;
}

export function RecentActivity({ onViewAllActivity, onActivityClick }: RecentActivityProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const activities = [
    {
      id: 1,
      type: "attendance",
      user: "John Smith",
      action: "marked present",
      time: "5 mins ago",
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      details: {
        className: "Computer Science - 10A",
        location: "Room 101, Building A",
        method: "Face Recognition",
        confidence: "98.5%",
      },
    },
    {
      id: 2,
      type: "student",
      user: "Sarah Williams",
      action: "registered as new student",
      time: "15 mins ago",
      icon: UserPlus,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      details: {
        className: "Mathematics - 11B",
        rollNumber: "STU-2024-1235",
        registeredBy: "Admin User",
        facesCaptured: "5 samples",
      },
    },
    {
      id: 3,
      type: "camera",
      user: "Camera 03",
      action: "went offline",
      time: "1 hour ago",
      icon: AlertTriangle,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      details: {
        location: "Lab 2, Building B",
        lastHeartbeat: "60 mins ago",
        status: "Connection Lost",
        assignedClass: "Physics Lab - 12A",
      },
    },
    {
      id: 4,
      type: "attendance",
      user: "Mike Johnson",
      action: "marked present",
      time: "2 hours ago",
      icon: UserCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
      details: {
        className: "English Literature - 9C",
        location: "Room 205, Building C",
        method: "Face Recognition",
        confidence: "96.2%",
      },
    },
    {
      id: 5,
      type: "camera",
      user: "Camera 02",
      action: "reconnected",
      time: "3 hours ago",
      icon: Camera,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
      details: {
        location: "Main Hall, Building A",
        status: "Online",
        assignedClass: "General Assembly",
        uptime: "99.2%",
      },
    },
  ];

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    onActivityClick?.(id);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-gray-900">Recent Activity</h3>
        <Badge variant="outline" className="text-gray-600">
          <Clock className="w-3 h-3 mr-1" />
          Live
        </Badge>
      </div>

      <div className="space-y-4">
        {activities.map((activity) => {
          const isExpanded = expandedId === activity.id;
          
          return (
            <div key={activity.id}>
              <div 
                className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                onClick={() => toggleExpand(activity.id)}
              >
                <div
                  className={`w-10 h-10 ${activity.iconBg} rounded-full flex items-center justify-center flex-shrink-0`}
                >
                  <activity.icon className={`w-5 h-5 ${activity.iconColor}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">
                    <span className="hover:underline">{activity.user}</span>
                  </p>
                  <p className="text-gray-600">{activity.action}</p>
                  <p className="text-gray-500 mt-1">{activity.time}</p>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>
              
              {/* Expanded Details */}
              {isExpanded && (
                <div className="ml-13 mt-2 p-3 bg-gray-50 rounded-lg space-y-2">
                  {Object.entries(activity.details).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-sm">
                      <span className="text-gray-600 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}:
                      </span>
                      <span className="text-gray-900">{value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <button 
        className="w-full mt-6 text-blue-600 hover:text-blue-700 hover:underline transition-colors"
        onClick={onViewAllActivity}
      >
        View All Activity
      </button>
    </Card>
  );
}