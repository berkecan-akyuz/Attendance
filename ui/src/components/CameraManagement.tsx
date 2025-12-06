import { useState } from "react";
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
  onNavigateToDashboard?: () => void;
  onNavigateToReports?: () => void;
  userRole?: string;
}

export function CameraManagement({ 
  onBack, 
  onLogout, 
  onNavigateToSettings, 
  onNavigateToNotifications,
  onNavigateToDashboard,
  onNavigateToReports,
  userRole = "admin"
}: CameraManagementProps) {
  const [activeFilter, setActiveFilter] = useState<"all" | "online" | "offline" | "unassigned">("all");
  const [editingCamera, setEditingCamera] = useState<CameraData | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [testingConnection, setTestingConnection] = useState<string | null>(null);

  const [cameras, setCameras] = useState<CameraData[]>([
    {
      id: "CAM-001",
      name: "Main Hall Camera",
      location: "Building A - Room 101",
      streamUrl: "rtsp://192.168.1.101:554/stream1",
      ipAddress: "192.168.1.101",
      status: "online",
      lastHeartbeat: "2 mins ago",
      assignedClass: "Computer Science - 10A",
    },
    {
      id: "CAM-002",
      name: "Lab Camera 1",
      location: "Building A - Room 102",
      streamUrl: "rtsp://192.168.1.102:554/stream1",
      ipAddress: "192.168.1.102",
      status: "online",
      lastHeartbeat: "1 min ago",
      assignedClass: "Computer Science - 10B",
    },
    {
      id: "CAM-003",
      name: "Classroom A",
      location: "Building B - Room 201",
      streamUrl: "rtsp://192.168.1.103:554/stream1",
      ipAddress: "192.168.1.103",
      status: "offline",
      lastHeartbeat: "15 mins ago",
      assignedClass: "Mathematics - 11A",
    },
    {
      id: "CAM-004",
      name: "Library Camera",
      location: "Building C - Library",
      streamUrl: "rtsp://192.168.1.104:554/stream1",
      ipAddress: "192.168.1.104",
      status: "online",
      lastHeartbeat: "30 secs ago",
      assignedClass: "Unassigned",
    },
    {
      id: "CAM-005",
      name: "Auditorium",
      location: "Building C - Auditorium",
      streamUrl: "rtsp://192.168.1.105:554/stream1",
      ipAddress: "192.168.1.105",
      status: "offline",
      lastHeartbeat: "1 hour ago",
      assignedClass: "Unassigned",
    },
    {
      id: "CAM-006",
      name: "Entrance Gate",
      location: "Main Entrance",
      streamUrl: "rtsp://192.168.1.106:554/stream1",
      ipAddress: "192.168.1.106",
      status: "online",
      lastHeartbeat: "5 mins ago",
      assignedClass: "English - 12A",
    },
  ]);

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

  const handleDeleteCamera = (cameraId: string) => {
    if (confirm("Are you sure you want to delete this camera?")) {
      setCameras(cameras.filter((cam) => cam.id !== cameraId));
    }
  };

  const handleSaveCamera = (cameraData: CameraData) => {
    if (isAddingNew) {
      setCameras([...cameras, { ...cameraData, id: `CAM-${String(cameras.length + 1).padStart(3, '0')}` }]);
    } else {
      setCameras(cameras.map((cam) => (cam.id === cameraData.id ? cameraData : cam)));
    }
    setEditingCamera(null);
    setIsAddingNew(false);
  };

  const stats = {
    total: cameras.length,
    online: cameras.filter((c) => c.status === "online").length,
    offline: cameras.filter((c) => c.status === "offline").length,
    unassigned: cameras.filter((c) => c.assignedClass === "Unassigned").length,
  };

  const handlePageChange = (page: string) => {
    if (page === "Dashboard") {
      onBack();
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
        />
      )}

      <div className="max-w-7xl mx-auto px-6 py-8">
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