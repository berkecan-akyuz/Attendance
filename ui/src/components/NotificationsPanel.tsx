import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  ArrowLeft,
  Bell,
  AlertTriangle,
  Camera,
  HardDrive,
  CheckCircle2,
  Clock,
  Users,
  FileText,
  XCircle,
  Trash2,
  MailOpen,
  Mail,
} from "lucide-react";

interface Notification {
  id: string;
  type: "error" | "warning" | "info" | "success";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  category: string;
}

interface NotificationsPanelProps {
  onBack: () => void;
  userRole: "admin" | "teacher" | "student";
}

export function NotificationsPanel({ onBack, userRole }: NotificationsPanelProps) {
  const [activeTab, setActiveTab] = useState("all");

  // Admin notifications
  const adminNotifications: Notification[] = [
    {
      id: "1",
      type: "error",
      title: "System Error Detected",
      message: "Face recognition service failed to start on Camera 03. Immediate attention required.",
      timestamp: "5 minutes ago",
      read: false,
      category: "system",
    },
    {
      id: "2",
      type: "warning",
      title: "Camera Connection Issue",
      message: "Camera 04 (Hallway) is experiencing intermittent connectivity. Check network connection.",
      timestamp: "15 minutes ago",
      read: false,
      category: "camera",
    },
    {
      id: "3",
      type: "warning",
      title: "Storage Warning",
      message: "Database storage is at 85% capacity. Consider archiving old records or expanding storage.",
      timestamp: "1 hour ago",
      read: true,
      category: "storage",
    },
    {
      id: "4",
      type: "error",
      title: "Camera Offline",
      message: "Camera 02 (Classroom A) went offline at 9:45 AM. No attendance data being captured.",
      timestamp: "2 hours ago",
      read: true,
      category: "camera",
    },
    {
      id: "5",
      type: "warning",
      title: "High System Load",
      message: "Recognition processing experiencing delays due to high CPU usage (92%).",
      timestamp: "3 hours ago",
      read: true,
      category: "system",
    },
    {
      id: "6",
      type: "info",
      title: "Backup Completed",
      message: "Daily system backup completed successfully. All data secured.",
      timestamp: "Yesterday",
      read: true,
      category: "storage",
    },
  ];

  // Teacher notifications
  const teacherNotifications: Notification[] = [
    {
      id: "1",
      type: "warning",
      title: "Low Attendance Alert",
      message: "Computer Science 10A has only 65% attendance today. 8 students are absent.",
      timestamp: "30 minutes ago",
      read: false,
      category: "attendance",
    },
    {
      id: "2",
      type: "info",
      title: "Daily Attendance Summary",
      message: "Your classes today: CS 10A (28/32 present), CS 10B (30/30 present).",
      timestamp: "2 hours ago",
      read: false,
      category: "summary",
    },
    {
      id: "3",
      type: "info",
      title: "Student Correction Request",
      message: "John Smith requested attendance correction for Jan 15, 2024. Review pending.",
      timestamp: "3 hours ago",
      read: true,
      category: "attendance",
    },
    {
      id: "4",
      type: "success",
      title: "Weekly Report Ready",
      message: "Your weekly attendance report for Jan 8-12 is ready for download.",
      timestamp: "Yesterday",
      read: true,
      category: "summary",
    },
    {
      id: "5",
      type: "warning",
      title: "Repeated Absences",
      message: "Sarah Johnson has been absent for 3 consecutive days. Consider follow-up.",
      timestamp: "Yesterday",
      read: true,
      category: "attendance",
    },
  ];

  // Student notifications
  const studentNotifications: Notification[] = [
    {
      id: "1",
      type: "success",
      title: "Correction Request Approved",
      message: "Your attendance correction request for Jan 15, 2024 has been approved by your teacher.",
      timestamp: "1 hour ago",
      read: false,
      category: "correction",
    },
    {
      id: "2",
      type: "info",
      title: "Attendance Update",
      message: "You were marked present for Computer Science at 9:15 AM today.",
      timestamp: "2 hours ago",
      read: false,
      category: "attendance",
    },
    {
      id: "3",
      type: "warning",
      title: "Low Attendance Warning",
      message: "Your attendance has dropped to 88%. Maintain 90% to meet requirements.",
      timestamp: "Yesterday",
      read: true,
      category: "attendance",
    },
    {
      id: "4",
      type: "error",
      title: "Correction Request Denied",
      message: "Your correction request for Jan 10, 2024 was denied. Reason: Insufficient documentation.",
      timestamp: "2 days ago",
      read: true,
      category: "correction",
    },
    {
      id: "5",
      type: "info",
      title: "Monthly Report Available",
      message: "Your attendance report for December is now available for download.",
      timestamp: "3 days ago",
      read: true,
      category: "attendance",
    },
  ];

  const notifications =
    userRole === "admin"
      ? adminNotifications
      : userRole === "teacher"
      ? teacherNotifications
      : studentNotifications;

  const [notificationList, setNotificationList] = useState(notifications);

  const unreadCount = notificationList.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200 hover:bg-red-100";
      case "warning":
        return "bg-yellow-50 border-yellow-200 hover:bg-yellow-100";
      case "success":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      default:
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
    }
  };

  const handleMarkAsRead = (id: string) => {
    setNotificationList(
      notificationList.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotificationList(notificationList.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotificationList(notificationList.filter((n) => n.id !== id));
  };

  const filteredNotifications =
    activeTab === "all"
      ? notificationList
      : activeTab === "unread"
      ? notificationList.filter((n) => !n.read)
      : notificationList.filter((n) => n.category === activeTab);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-gray-900">Notifications</h1>
              <p className="text-gray-500">
                {unreadCount > 0
                  ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}`
                  : "All caught up!"}
              </p>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button onClick={handleMarkAllAsRead} variant="outline">
              <MailOpen className="w-4 h-4 mr-2" />
              Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All
              {notificationList.length > 0 && (
                <Badge className="ml-2 bg-gray-200 text-gray-900">
                  {notificationList.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread
              {unreadCount > 0 && (
                <Badge className="ml-2 bg-blue-600 text-white">{unreadCount}</Badge>
              )}
            </TabsTrigger>

            {/* Role-specific tabs */}
            {userRole === "admin" && (
              <>
                <TabsTrigger value="system">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  System
                </TabsTrigger>
                <TabsTrigger value="camera">
                  <Camera className="w-4 h-4 mr-2" />
                  Cameras
                </TabsTrigger>
                <TabsTrigger value="storage">
                  <HardDrive className="w-4 h-4 mr-2" />
                  Storage
                </TabsTrigger>
              </>
            )}

            {userRole === "teacher" && (
              <>
                <TabsTrigger value="attendance">
                  <Users className="w-4 h-4 mr-2" />
                  Attendance
                </TabsTrigger>
                <TabsTrigger value="summary">
                  <FileText className="w-4 h-4 mr-2" />
                  Summaries
                </TabsTrigger>
              </>
            )}

            {userRole === "student" && (
              <>
                <TabsTrigger value="attendance">
                  <Clock className="w-4 h-4 mr-2" />
                  Attendance
                </TabsTrigger>
                <TabsTrigger value="correction">
                  <FileText className="w-4 h-4 mr-2" />
                  Corrections
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredNotifications.length === 0 ? (
              <Card className="p-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No notifications</h3>
                <p className="text-gray-500">You're all caught up!</p>
              </Card>
            ) : (
              filteredNotifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-6 border transition-colors ${
                    !notification.read
                      ? getNotificationColor(notification.type)
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-gray-900">{notification.title}</h3>
                          {!notification.read && (
                            <Badge className="bg-blue-600 text-white">New</Badge>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-gray-500">{notification.timestamp}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(notification.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
