import { useEffect, useState } from "react";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, ChevronDown, ChevronUp, Bell } from "lucide-react";
import { fetchNotifications, NotificationItem } from "../lib/api";

interface RecentActivityProps {
  onViewAllActivity?: () => void;
  onActivityClick?: (activityId: string) => void;
}

export function RecentActivity({ onViewAllActivity, onActivityClick }: RecentActivityProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activities, setActivities] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setError(null);
      setLoading(true);
      try {
        const payload = await fetchNotifications();
        setActivities(payload);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load activity";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const toggleExpand = (id: string) => {
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
        {loading && <p className="text-gray-500">Loading activity...</p>}
        {error && (
          <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">{error}</div>
        )}
        {!loading && !error && activities.length === 0 && (
          <p className="text-gray-500">No recent notifications.</p>
        )}

        {activities.map((activity) => {
          const isExpanded = expandedId === activity.id;
          const severityColors: Record<string, string> = {
            info: "bg-blue-100 text-blue-700",
            medium: "bg-amber-100 text-amber-700",
            high: "bg-red-100 text-red-700",
          };
          const color = severityColors[activity.severity] || "bg-gray-100 text-gray-700";

          return (
            <div key={activity.id}>
              <div
                className="flex items-start space-x-3 cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded-lg transition-colors"
                onClick={() => toggleExpand(activity.id)}
              >
                <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center flex-shrink-0`}>
                  <Bell className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900">{activity.title}</p>
                  <p className="text-gray-600">{activity.message}</p>
                  <p className="text-gray-500 mt-1">{new Date(activity.timestamp).toLocaleString()}</p>
                </div>
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {isExpanded && activity.message && (
                <div className="ml-13 mt-2 p-3 bg-gray-50 rounded-lg text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>{activity.severity}</span>
                    <span className="text-gray-500">{activity.type}</span>
                  </div>
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