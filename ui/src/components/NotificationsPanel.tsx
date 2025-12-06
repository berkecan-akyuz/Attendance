import { useEffect, useMemo, useState } from "react";
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
import { fetchNotifications, NotificationItem } from "../lib/api";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload = await fetchNotifications();
        const mapped: Notification[] = payload.map((item: NotificationItem) => ({
          id: item.id,
          type:
            item.severity === "high"
              ? "error"
              : item.severity === "medium"
              ? "warning"
              : "info",
          title: item.title,
          message: item.message,
          timestamp: item.timestamp,
          read: false,
          category: item.type || "general",
        }));
        setNotifications(mapped);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load notifications";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const roleFiltered = useMemo(() => {
    return notifications.filter((item) => {
      if (userRole === "admin") return true;
      if (userRole === "teacher") {
        return item.category !== "system" && item.category !== "storage";
      }
      return item.category !== "system" && item.category !== "report";
    });
  }, [notifications, userRole]);

  const notificationList = roleFiltered;
  const unreadCount = notificationList.filter((n) => !n.read).length;

  const filteredNotifications =
    activeTab === "all"
      ? notificationList
      : activeTab === "unread"
      ? notificationList.filter((n) => !n.read)
      : notificationList.filter((n) => n.category === activeTab);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "error":
        return <XCircle className="w-6 h-6 text-red-500" />;
      case "warning":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
      case "success":
        return <CheckCircle2 className="w-6 h-6 text-green-500" />;
      default:
        return <Bell className="w-6 h-6 text-blue-500" />;
    }
  };

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "error":
        return "bg-red-50 border-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200";
      case "success":
        return "bg-green-50 border-green-200";
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

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
        {error && (
          <Card className="p-4 mb-4 border-red-200 bg-red-50 text-red-700">{error}</Card>
        )}
        {loading && (
          <Card className="p-4 mb-4 border-blue-200 bg-blue-50 text-blue-700">Loading notifications...</Card>
        )}
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
