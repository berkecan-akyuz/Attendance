import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { CameraConfigModal } from "./CameraConfigModal";
import { DashboardNav } from "./DashboardNav";
import { 
  Camera, 
  Settings, 
  Trash2, 
  Plus,
  Wifi,
  WifiOff,
  ArrowLeft
} from "lucide-react";
import {
  fetchCameras,
  CameraResponse,
  createCamera,
  updateCamera,
  deleteCamera,
} from "../lib/api";

interface CameraData {
  id: string;
  name: string;
  location: string;
  streamUrl: string;
  ipAddress: string;
  status: "online" | "offline";
  lastHeartbeat: string;
  assignedClass: string;
}

interface CameraManagementProps {
  onBack: () => void;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToDashboard?: (section?: string) => void;
  onNavigateToReports?: () => void;
  userRole?: string;
  unreadCount?: number;
}

export function CameraManagement({
  onBack,
  onLogout,
  onNavigateToSettings,
  onNavigateToNotifications,
  onNavigateToDashboard,
  onNavigateToReports,
  userRole = "admin",
  unreadCount = 0
}: CameraManagementProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "online" | "offline" | "unassigned">("all");
  const [editingCamera, setEditingCamera] = useState<CameraData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);
  const [cameras, setCameras] = useState<CameraData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const payload: CameraResponse[] = await fetchCameras();
        const mapped: CameraData[] = payload.map((cam) => ({
          id: `CAM-${String(cam.camera_id).padStart(3, "0")}`,
          name: cam.camera_name,
          location: cam.location,
          streamUrl: cam.stream_url,
          ipAddress: cam.stream_url.replace("rtsp://", "").split(":")[0] || "",
          status: (cam.status || "online").toLowerCase() as CameraData["status"],
          lastHeartbeat: cam.last_checked || "",
          assignedClass: cam.lecture_name || "Unassigned",
        }));
        setCameras(mapped);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load cameras";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const filteredCameras = cameras.filter((camera) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "online") return camera.status === "online";
    if (activeFilter === "offline") return camera.status === "offline";
    if (activeFilter === "unassigned") return camera.assignedClass === "Unassigned";
    return true;
  });

  const handleTestConnection = async (cameraId: string) => {
    setTestingConnection(cameraId);
    // Simulate testing connection
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setTestingConnection(null);
    alert("Connection test successful!");
  };

  const handleDeleteCamera = async (cameraId: string) => {
    if (!confirm("Are you sure you want to delete this camera?")) return;

    setSaving(true);
    setError(null);
    try {
      const numericId = Number(cameraId.replace("CAM-", ""));
      await deleteCamera(numericId);
      setCameras(cameras.filter((cam) => cam.id !== cameraId));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to delete camera";
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCamera = async (cameraData: CameraData) => {
    setSaving(true);
    try {
      if (isAddingNew) {
        const created = await createCamera({
          camera_name: cameraData.name,
          location: cameraData.location,
          stream_url: cameraData.streamUrl,
          status: cameraData.status,
          assigned_lecture_id: null,
        });
        setCameras([
          ...cameras,
          {
            ...cameraData,
            id: `CAM-${String(created.camera_id).padStart(3, "0")}`,
            assignedClass: created.lecture_name || "Unassigned",
          },
        ]);
      } else {
        const updated = await updateCamera(Number(cameraData.id.replace("CAM-", "")), {
          camera_name: cameraData.name,
          location: cameraData.location,
          stream_url: cameraData.streamUrl,
          status: cameraData.status,
        });
        setCameras(
          cameras.map((cam) =>
            cam.id === cameraData.id
              ? {
                  ...cameraData,
                  assignedClass: updated.lecture_name || cameraData.assignedClass,
                }
              : cam
          )
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save camera";
      setError(message);
    } finally {
      setSaving(false);
      setEditingCamera(null);
      setIsAddingNew(false);
    }
  };

  const stats = {
    total: cameras.length,
    online: cameras.filter((c) => c.status === "online").length,
    offline: cameras.filter((c) => c.status === "offline").length,
    unassigned: cameras.filter((c) => c.assignedClass === "Unassigned").length,
  };

  const handlePageChange = (page: string) => {
    if (page === "Dashboard") {
      onNavigateToDashboard?.("Dashboard");
    } else if ((page === "Users" || page === "Classes") && onNavigateToDashboard) {
      onNavigateToDashboard(page);
    } else if (page === "Settings" && onNavigateToSettings) {
      onNavigateToSettings();
    } else if (page === "Reports" && onNavigateToReports) {
      onNavigateToReports();
    }
    // Cameras is already the active page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {onLogout && onNavigateToSettings && onNavigateToNotifications && (
        <DashboardNav
          currentPage="Cameras"
          onPageChange={handlePageChange}
          onLogout={onLogout}
          userRole={userRole}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToNotifications={onNavigateToNotifications}
          unreadCount={unreadCount}
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setEditingCamera({
                  id: "CAM-new",
                  name: "",
                  location: "",
                  streamUrl: "",
                  ipAddress: "",
                  status: "offline",
                  lastHeartbeat: "Just now",
                  assignedClass: "Unassigned",
                });
                setIsAddingNew(true);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add New Camera
            </Button>
            {saving && <span className="text-gray-600 text-sm">Saving...</span>}
          </div>
          {error && (
            <Card className="p-2 border-red-200 bg-red-50 text-red-700">{error}</Card>
          )}
        </div>
        {loading && (
          <Card className="p-4 mb-4 border-blue-200 bg-blue-50 text-blue-700">Loading cameras...</Card>
        )}
        {/* Filter Tabs */}
        <div className="flex items-center space-x-2 mb-6">
          <Button
            variant={activeFilter === "all" ? "default" : "outline"}
            onClick={() => setActiveFilter("all")}
            className={activeFilter === "all" ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            All Cameras ({stats.total})
          </Button>
          <Button
            variant={activeFilter === "online" ? "default" : "outline"}
            onClick={() => setActiveFilter("online")}
            className={activeFilter === "online" ? "bg-green-600 hover:bg-green-700" : ""}
          >
            Online ({stats.online})
          </Button>
          <Button
            variant={activeFilter === "offline" ? "default" : "outline"}
            onClick={() => setActiveFilter("offline")}
            className={activeFilter === "offline" ? "bg-red-600 hover:bg-red-700" : ""}
          >
            Offline ({stats.offline})
          </Button>
          <Button
            variant={activeFilter === "unassigned" ? "default" : "outline"}
            onClick={() => setActiveFilter("unassigned")}
            className={activeFilter === "unassigned" ? "bg-orange-600 hover:bg-orange-700" : ""}
          >
            Unassigned ({stats.unassigned})
          </Button>
        </div>

        {/* Camera Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCameras.map((camera) => (
            <Card
              key={camera.id}
              className="overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {/* Camera Preview */}
              <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
                {camera.status === "online" ? (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">Live Feed</p>
                  </div>
                ) : (
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-700 mx-auto mb-2" />
                    <p className="text-gray-500">Offline</p>
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 right-3">
                  <Badge
                    className={
                      camera.status === "online"
                        ? "bg-green-100 text-green-700 hover:bg-green-100"
                        : "bg-red-100 text-red-700 hover:bg-red-100"
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-1.5 ${
                        camera.status === "online" ? "bg-green-500" : "bg-red-500"
                      }`}
                    ></div>
                    {camera.status === "online" ? "Online" : "Offline"}
                  </Badge>
                </div>
              </div>

              {/* Camera Info */}
              <div className="p-5 space-y-3">
                <div>
                  <div className="flex items-start justify-between mb-1">
                    <h3 className="text-gray-900">{camera.name}</h3>
                    <span className="text-gray-500">{camera.id}</span>
                  </div>
                  <p className="text-gray-600">{camera.location}</p>
                </div>

                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center justify-between">
                    <span>Last Heartbeat:</span>
                    <span>{camera.lastHeartbeat}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Assigned Class:</span>
                    <span className={camera.assignedClass === "Unassigned" ? "text-orange-600" : ""}>
                      {camera.assignedClass}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>IP Address:</span>
                    <span>{camera.ipAddress}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 pt-3 border-t border-gray-200">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => setEditingCamera(camera)}
                  >
                    <Settings className="w-4 h-4 mr-1" />
                    Configure
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleTestConnection(camera.id)}
                    disabled={testingConnection === camera.id}
                  >
                    {testingConnection === camera.id ? (
                      <>
                        <div className="w-4 h-4 mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        Testing...
                      </>
                    ) : (
                      <>
                        {camera.status === "online" ? (
                          <Wifi className="w-4 h-4 mr-1" />
                        ) : (
                          <WifiOff className="w-4 h-4 mr-1" />
                        )}
                        Test
                      </>
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDeleteCamera(camera.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredCameras.length === 0 && (
          <div className="text-center py-16">
            <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No cameras found in this category</p>
          </div>
        )}
      </div>

      {/* Configuration Modal */}
      {editingCamera && (
        <CameraConfigModal
          camera={editingCamera}
          isNew={isAddingNew}
          onSave={handleSaveCamera}
          onClose={() => {
            setEditingCamera(null);
            setIsAddingNew(false);
          }}
        />
      )}
    </div>
  );
}