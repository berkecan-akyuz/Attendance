import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { X, Wifi } from "lucide-react";

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

interface CameraConfigModalProps {
  camera: CameraData;
  isNew: boolean;
  onSave: (camera: CameraData) => void;
  onClose: () => void;
}

export function CameraConfigModal({
  camera,
  isNew,
  onSave,
  onClose,
}: CameraConfigModalProps) {
  const [formData, setFormData] = useState<CameraData>(camera);
  const [isTesting, setIsTesting] = useState(false);

  const handleChange = (field: keyof CameraData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    // Simulate connection test
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsTesting(false);
    alert("Connection test successful! Camera is reachable.");
  };

  const handleSave = () => {
    if (!formData.name || !formData.location || !formData.ipAddress) {
      alert("Please fill in all required fields");
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-gray-900">
            {isNew ? "Add New Camera" : "Configure Camera"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cameraName">
                  Camera Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="cameraName"
                  type="text"
                  placeholder="e.g., Main Hall Camera"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">
                  Location/Room <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="location"
                  type="text"
                  placeholder="e.g., Building A - Room 101"
                  value={formData.location}
                  onChange={(e) => handleChange("location", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipAddress">
                  IP Address <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ipAddress"
                  type="text"
                  placeholder="e.g., 192.168.1.100"
                  value={formData.ipAddress}
                  onChange={(e) => handleChange("ipAddress", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="streamUrl">Stream URL</Label>
                <Input
                  id="streamUrl"
                  type="text"
                  placeholder="e.g., rtsp://192.168.1.100:554/stream1"
                  value={formData.streamUrl}
                  onChange={(e) => handleChange("streamUrl", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedClass">Assigned Class</Label>
                <Select
                  value={formData.assignedClass}
                  onValueChange={(value) => handleChange("assignedClass", value)}
                >
                  <SelectTrigger id="assignedClass">
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                    <SelectItem value="Computer Science - 10A">
                      Computer Science - 10A
                    </SelectItem>
                    <SelectItem value="Computer Science - 10B">
                      Computer Science - 10B
                    </SelectItem>
                    <SelectItem value="Mathematics - 11A">
                      Mathematics - 11A
                    </SelectItem>
                    <SelectItem value="English - 12A">English - 12A</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Column - Field of View */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Field of View</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 aspect-square flex items-center justify-center">
                  <div className="text-center">
                    <div className="relative w-48 h-32 mx-auto mb-4">
                      {/* Camera FOV Diagram */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                          <div className="w-4 h-4 bg-blue-400 rounded-full"></div>
                        </div>
                      </div>
                      {/* Field of View Triangle */}
                      <svg
                        className="absolute bottom-0 left-1/2 -translate-x-1/2"
                        width="192"
                        height="128"
                        viewBox="0 0 192 128"
                      >
                        <path
                          d="M 96 128 L 16 0 L 176 0 Z"
                          fill="rgba(59, 130, 246, 0.2)"
                          stroke="rgb(59, 130, 246)"
                          strokeWidth="2"
                        />
                      </svg>
                      {/* Coverage Area */}
                      <div className="absolute top-0 left-0 right-0 text-center">
                        <span className="text-blue-600">Coverage Area</span>
                      </div>
                    </div>
                    <p className="text-gray-500">
                      Standard 90° viewing angle
                    </p>
                    <p className="text-gray-400">
                      Optimal range: 3-8 meters
                    </p>
                  </div>
                </div>
              </div>

              {/* Connection Test */}
              <div className="space-y-2">
                <Label>Connection Status</Label>
                <Button
                  onClick={handleTestConnection}
                  disabled={isTesting || !formData.ipAddress}
                  variant="outline"
                  className="w-full"
                >
                  {isTesting ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>
                {formData.status === "online" && (
                  <p className="text-green-600">
                    ✓ Camera is currently online
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-blue-900">
              <strong>Note:</strong> Make sure the camera is connected to the network
              and the IP address is correct before testing the connection. RTSP stream
              URL format: rtsp://[IP]:[PORT]/[PATH]
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isNew ? "Add Camera" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
