import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Camera } from "lucide-react";

export function CameraStatus() {
  const cameras = [
    { id: 1, name: "Room 101", location: "Building A", status: "online" },
    { id: 2, name: "Room 102", location: "Building A", status: "online" },
    { id: 3, name: "Room 201", location: "Building B", status: "online" },
    { id: 4, name: "Room 202", location: "Building B", status: "offline" },
    { id: 5, name: "Main Hall", location: "Building C", status: "online" },
    { id: 6, name: "Library", location: "Building C", status: "online" },
  ];

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Camera Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {cameras.map((camera) => (
            <div
              key={camera.id}
              className="relative border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Camera className="w-6 h-6 text-gray-600" />
                </div>
                <Badge
                  variant={camera.status === "online" ? "default" : "destructive"}
                  className={
                    camera.status === "online"
                      ? "bg-green-100 text-green-700 hover:bg-green-100"
                      : "bg-red-100 text-red-700 hover:bg-red-100"
                  }
                >
                  <div className={`w-2 h-2 rounded-full mr-1.5 ${
                    camera.status === "online" ? "bg-green-500" : "bg-red-500"
                  }`}></div>
                  {camera.status}
                </Badge>
              </div>
              <div>
                <p className="text-gray-900 mb-1">{camera.name}</p>
                <p className="text-gray-500">{camera.location}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
