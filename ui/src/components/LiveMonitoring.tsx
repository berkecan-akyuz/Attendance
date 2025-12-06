import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Card } from "./ui/card";
import {
  ArrowLeft,
  Camera,
  Circle,
  Users,
  AlertTriangle,
  Activity,
  Zap,
  Moon,
  Sun,
  Play,
  Pause,
} from "lucide-react";

interface RecognizedPerson {
  id: string;
  name: string;
  time: string;
  confidence: number;
  thumbnail: string;
}

interface LogEntry {
  id: string;
  time: string;
  message: string;
  type: "success" | "processing" | "warning";
}

interface LiveMonitoringProps {
  onBack: () => void;
  userRole: "admin" | "teacher";
}

export function LiveMonitoring({ onBack, userRole }: LiveMonitoringProps) {
  const [selectedCamera, setSelectedCamera] = useState("cam-001");
  const [recognitionActive, setRecognitionActive] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [detectedFaces, setDetectedFaces] = useState(3);
  const [unknownFaces, setUnknownFaces] = useState(1);
  const [recognizedToday, setRecognizedToday] = useState<RecognizedPerson[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState({
    accuracy: 94.5,
    fps: 28,
  });

  const logsContainerRef = useRef<HTMLDivElement>(null);

  // Mock cameras
  const cameras = [
    { id: "cam-001", name: "Main Entrance - Camera 01" },
    { id: "cam-002", name: "Classroom A - Camera 02" },
    { id: "cam-003", name: "Classroom B - Camera 03" },
    { id: "cam-004", name: "Hallway - Camera 04" },
  ];

  // Mock student names
  const studentNames = [
    "John Smith",
    "Emma Johnson",
    "Michael Brown",
    "Sophia Davis",
    "William Miller",
    "Olivia Wilson",
    "James Moore",
    "Ava Taylor",
  ];

  // Simulate real-time recognition
  useEffect(() => {
    if (!recognitionActive) return;

    const interval = setInterval(() => {
      // Random chance of new detection
      if (Math.random() > 0.7) {
        const student = studentNames[Math.floor(Math.random() * studentNames.length)];
        const confidence = 85 + Math.random() * 14; // 85-99%
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        // Add to recognized list
        const newPerson: RecognizedPerson = {
          id: `${Date.now()}`,
          name: student,
          time: timeStr,
          confidence,
          thumbnail: "",
        };

        setRecognizedToday((prev) => [newPerson, ...prev].slice(0, 10));

        // Add success log
        const successLog: LogEntry = {
          id: `${Date.now()}`,
          time: timeStr,
          message: `${student} marked present`,
          type: "success",
        };

        setLogs((prev) => [successLog, ...prev].slice(0, 20));

        // Update stats
        setDetectedFaces((prev) => prev + 1);
      } else if (Math.random() > 0.85) {
        // Occasionally detect unknown face
        const now = new Date();
        const timeStr = now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        });

        const processingLog: LogEntry = {
          id: `${Date.now()}`,
          time: timeStr,
          message: "Face detected - Recognition in progress",
          type: "processing",
        };

        setLogs((prev) => [processingLog, ...prev].slice(0, 20));
        setUnknownFaces((prev) => prev + 1);
      }

      // Update FPS randomly
      setStats((prev) => ({
        ...prev,
        fps: 26 + Math.random() * 4,
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, [recognitionActive]);

  // Auto-scroll logs
  useEffect(() => {
    if (logsContainerRef.current) {
      logsContainerRef.current.scrollTop = 0;
    }
  }, [logs]);

  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardClass = darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200";
  const textClass = darkMode ? "text-gray-100" : "text-gray-900";
  const textMutedClass = darkMode ? "text-gray-400" : "text-gray-600";

  return (
    <div className={`min-h-screen ${bgClass} transition-colors duration-300`}>
      {/* Header */}
      <div className={`border-b ${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"} px-6 py-4`}>
        <div className="max-w-[1800px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className={textClass}>Live Attendance Monitoring</h1>
              <p className={textMutedClass}>Real-time face recognition and tracking</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Sun className={`w-4 h-4 ${darkMode ? "text-gray-400" : "text-yellow-500"}`} />
              <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              <Moon className={`w-4 h-4 ${darkMode ? "text-blue-400" : "text-gray-400"}`} />
            </div>

            {/* Camera Selector */}
            <Select value={selectedCamera} onValueChange={setSelectedCamera}>
              <SelectTrigger className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((cam) => (
                  <SelectItem key={cam.id} value={cam.id}>
                    <div className="flex items-center space-x-2">
                      <Camera className="w-4 h-4" />
                      <span>{cam.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Recognition Toggle */}
            <div className="flex items-center space-x-3">
              <Label htmlFor="recognition-toggle" className={textMutedClass}>
                Recognition
              </Label>
              <Switch
                id="recognition-toggle"
                checked={recognitionActive}
                onCheckedChange={setRecognitionActive}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1800px] mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left/Center - Video Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Video Player */}
            <Card className={`${cardClass} border p-0 overflow-hidden shadow-lg`}>
              {/* Status Bar */}
              <div className={`${darkMode ? "bg-gray-900" : "bg-gray-900"} px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center space-x-4">
                  {/* Recording Status */}
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Circle className="w-3 h-3 fill-red-500 text-red-500 animate-pulse" />
                    </div>
                    <span className="text-red-400">Recording</span>
                  </div>

                  {/* Recognition Status */}
                  {recognitionActive && (
                    <div className="flex items-center space-x-2">
                      <Circle className="w-3 h-3 fill-green-500 text-green-500" />
                      <span className="text-green-400">Recognition Active</span>
                    </div>
                  )}
                </div>

                {/* System Stats */}
                <div className="flex items-center space-x-6 text-gray-400">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4" />
                    <span>Accuracy: {stats.accuracy.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4" />
                    <span>{stats.fps.toFixed(0)} FPS</span>
                  </div>
                </div>
              </div>

              {/* Video Feed */}
              <div className="relative bg-black aspect-video">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500">Live Camera Feed</p>
                    <p className="text-gray-600 mt-2">
                      {cameras.find((c) => c.id === selectedCamera)?.name}
                    </p>
                  </div>
                </div>

                {/* Detection Overlay */}
                {recognitionActive && (
                  <div className="absolute top-4 left-4">
                    <div className="bg-black bg-opacity-60 text-white px-3 py-2 rounded-lg backdrop-blur-sm">
                      <p className="text-green-400">Face Detection Active</p>
                    </div>
                  </div>
                )}

                {/* Corner timestamps */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded backdrop-blur-sm">
                  {new Date().toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              </div>
            </Card>

            {/* Real-Time Logs Feed */}
            <Card className={`${cardClass} border`}>
              <div className="p-4 border-b border-gray-200">
                <h3 className={textClass}>Real-Time Activity Log</h3>
              </div>
              <div
                ref={logsContainerRef}
                className="h-48 overflow-y-auto p-4 space-y-2"
                style={{ scrollBehavior: "smooth" }}
              >
                {logs.length === 0 ? (
                  <p className={textMutedClass}>Waiting for activity...</p>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-start space-x-3 p-2 rounded-lg animate-in slide-in-from-top-2 duration-300 ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <span className={`${textMutedClass} flex-shrink-0`}>
                        [{log.time}]
                      </span>
                      <span
                        className={
                          log.type === "success"
                            ? "text-green-600"
                            : log.type === "processing"
                            ? "text-blue-600"
                            : "text-yellow-600"
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Detected Faces Counter */}
            <Card className={`${cardClass} border p-6`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className={`w-5 h-5 ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
                  <h3 className={textClass}>Detected Faces</h3>
                </div>
              </div>
              <p className={`text-blue-600 ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                {detectedFaces}
              </p>
              <p className={textMutedClass}>Total today</p>
            </Card>

            {/* Unknown Faces Counter */}
            <Card className={`${cardClass} border p-6`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`w-5 h-5 ${darkMode ? "text-yellow-400" : "text-yellow-600"}`} />
                  <h3 className={textClass}>Unknown Faces</h3>
                </div>
              </div>
              <p className={`${darkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                {unknownFaces}
              </p>
              <p className={textMutedClass}>Requires attention</p>
            </Card>

            {/* Recognized Today */}
            <Card className={`${cardClass} border`}>
              <div className="p-4 border-b border-gray-200">
                <h3 className={textClass}>Recognized Today</h3>
                <p className={textMutedClass}>{recognizedToday.length} students</p>
              </div>
              <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto">
                {recognizedToday.length === 0 ? (
                  <p className={textMutedClass}>No recognitions yet</p>
                ) : (
                  recognizedToday.map((person) => (
                    <div
                      key={person.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg animate-in slide-in-from-right-2 duration-300 ${
                        darkMode ? "bg-gray-700" : "bg-gray-50"
                      }`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={person.thumbnail} alt={person.name} />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {person.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className={`${textClass} truncate`}>{person.name}</p>
                        <p className={textMutedClass}>{person.time}</p>
                      </div>
                      <div>
                        <Badge
                          className={
                            person.confidence >= 95
                              ? "bg-green-100 text-green-700 hover:bg-green-100"
                              : person.confidence >= 90
                              ? "bg-blue-100 text-blue-700 hover:bg-blue-100"
                              : "bg-yellow-100 text-yellow-700 hover:bg-yellow-100"
                          }
                        >
                          {person.confidence.toFixed(0)}%
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
