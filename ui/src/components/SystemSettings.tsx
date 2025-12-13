import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";
import { Slider } from "./ui/slider";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { DashboardNav } from "./DashboardNav";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  Settings,
  Clock,
  Bell,
  Eye,
  ArrowLeft,
  ChevronRight,
  Building2,
  Monitor,
  Globe,
  Calendar,
  Sun,
  Moon,
  Lock,
} from "lucide-react";

interface SystemSettingsProps {
  onBack: () => void;
  onLogout?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToDashboard?: (section?: string) => void;
  onNavigateToReports?: () => void;
  onNavigateToCameras?: () => void;
  userRole?: string;
  unreadCount?: number;
}

export function SystemSettings({ 
  onBack,
  onLogout,
  onNavigateToNotifications,
  onNavigateToDashboard,
  onNavigateToReports,
  onNavigateToCameras,
  userRole = "admin",
  unreadCount = 0
}: SystemSettingsProps) {
  const [activeSection, setActiveSection] = useState("general");
  const [profileModal, setProfileModal] = useState<{
    open: boolean;
    tab: "profile" | "security" | "preferences";
  }>({ open: false, tab: "profile" });

  // General Settings State
  const [systemName, setSystemName] = useState("Face Recognition Attendance System");
  const [institutionName, setInstitutionName] = useState("ABC University");
  const [academicYear, setAcademicYear] = useState("2024-2025");
  const [timezone, setTimezone] = useState("America/New_York");
  const [language, setLanguage] = useState("en");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");
  const [timeFormat, setTimeFormat] = useState("12-hour");
  const [theme, setTheme] = useState("light");
  const [classDuration, setClassDuration] = useState([60]);
  const [attendanceWindow, setAttendanceWindow] = useState([15]);
  const [lateThreshold, setLateThreshold] = useState(10);

  // Attendance Rules State
  const [autoAttendance, setAutoAttendance] = useState(true);
  const [gracePeriod, setGracePeriod] = useState([15]);
  const [detectionConfidence, setDetectionConfidence] = useState([85]);
  const [allowMultipleDetections, setAllowMultipleDetections] = useState(false);
  const [allowManualMarking, setAllowManualMarking] = useState(true);
  const [requireVerification, setRequireVerification] = useState(true);
  const [teachersEditAfterDeadline, setTeachersEditAfterDeadline] = useState(false);
  const [lockAfterValue, setLockAfterValue] = useState(24);
  const [lockAfterUnit, setLockAfterUnit] = useState("hours");
  const [enableAbsenceAlerts, setEnableAbsenceAlerts] = useState(true);
  const [consecutiveAbsences, setConsecutiveAbsences] = useState(3);
  const [notifyParents, setNotifyParents] = useState(true);
  const [alertThreshold, setAlertThreshold] = useState([75]);

  // Recognition Settings State
  const [recognitionModel, setRecognitionModel] = useState("FaceNet");
  const [similarityThreshold, setSimilarityThreshold] = useState([0.85]);
  const [faceQualityScore, setFaceQualityScore] = useState([70]);
  const [enableMultipleFaces, setEnableMultipleFaces] = useState(true);
  const [minFaceSize, setMinFaceSize] = useState([100]);
  const [detectionSpeed, setDetectionSpeed] = useState("balanced");
  const [maxFacesPerFrame, setMaxFacesPerFrame] = useState(5);
  const [logUnknownFaces, setLogUnknownFaces] = useState(true);
  const [saveDetectionImages, setSaveDetectionImages] = useState(false);
  const [reRecognitionInterval, setReRecognitionInterval] = useState(30);
  const [processEveryNFrames, setProcessEveryNFrames] = useState([3]);
  const [gpuAcceleration, setGpuAcceleration] = useState(false);
  const [processingThreads, setProcessingThreads] = useState(4);
  const [memoryLimit, setMemoryLimit] = useState(2048);
  const [memoryUnit, setMemoryUnit] = useState("MB");
  const [showPerformanceMetrics, setShowPerformanceMetrics] = useState(true);

  const menuItems = [
    { id: "general", label: "General Settings", icon: Settings },
    { id: "attendance", label: "Attendance Rules", icon: Clock },
    { id: "recognition", label: "Recognition Settings", icon: Eye },
    { id: "notifications", label: "Notification Settings", icon: Bell },
  ];

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  const backgroundClass = theme === "dark" ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900";

  const handleSave = () => {
    alert("Settings saved successfully!");
  };

  const handleReset = () => {
    if (confirm("Are you sure you want to reset all settings to defaults?")) {
      setSystemName("Face Recognition Attendance System");
      setInstitutionName("ABC University");
      setAcademicYear("2024-2025");
      setTimezone("America/New_York");
      setLanguage("en");
      setDateFormat("MM/DD/YYYY");
      setTimeFormat("12-hour");
      setTheme("light");
      setClassDuration([60]);
      setAttendanceWindow([15]);
      setLateThreshold(10);

      // Attendance Rules Defaults
      setAutoAttendance(true);
      setGracePeriod([15]);
      setDetectionConfidence([85]);
      setAllowMultipleDetections(false);
      setAllowManualMarking(true);
      setRequireVerification(true);
      setTeachersEditAfterDeadline(false);
      setLockAfterValue(24);
      setLockAfterUnit("hours");
      setEnableAbsenceAlerts(true);
      setConsecutiveAbsences(3);
      setNotifyParents(true);
      setAlertThreshold([75]);

      // Recognition Settings Defaults
      setRecognitionModel("FaceNet");
      setSimilarityThreshold([0.85]);
      setFaceQualityScore([70]);
      setEnableMultipleFaces(true);
      setMinFaceSize([100]);
      setDetectionSpeed("balanced");
      setMaxFacesPerFrame(5);
      setLogUnknownFaces(true);
      setSaveDetectionImages(false);
      setReRecognitionInterval(30);
      setProcessEveryNFrames([3]);
      setGpuAcceleration(false);
      setProcessingThreads(4);
      setMemoryLimit(2048);
      setMemoryUnit("MB");
      setShowPerformanceMetrics(true);
    }
  };

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">General Settings</h2>
        <p className="text-gray-500">Configure basic system information and preferences</p>
      </div>

      {/* Basic Information */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-gray-900">Basic Information</h3>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="systemName">System Name</Label>
              <Input
                id="systemName"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                placeholder="Enter system name"
              />
              <p className="text-gray-500">
                The name displayed across the system
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="institutionName">Institution Name</Label>
              <Input
                id="institutionName"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                placeholder="Enter institution name"
              />
              <p className="text-gray-500">
                Your school or organization name
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="academicYear">Academic Year</Label>
              <Select value={academicYear} onValueChange={setAcademicYear}>
                <SelectTrigger id="academicYear">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023-2024">2023-2024</SelectItem>
                  <SelectItem value="2024-2025">2024-2025</SelectItem>
                  <SelectItem value="2025-2026">2025-2026</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-gray-500">Current academic year</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger id="timezone">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/New_York">Eastern Time (ET)</SelectItem>
                  <SelectItem value="America/Chicago">Central Time (CT)</SelectItem>
                  <SelectItem value="America/Denver">Mountain Time (MT)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Pacific Time (PT)</SelectItem>
                  <SelectItem value="Europe/London">London (GMT)</SelectItem>
                  <SelectItem value="Europe/Istanbul">Istanbul (TRT)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (JST)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-gray-500">System timezone</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger id="language">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="tr">Turkish</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-gray-500">System language</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Display Preferences */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
            <Monitor className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-gray-900">Display Preferences</h3>
        </div>

        <div className="space-y-6">
          {/* Date Format */}
          <div className="space-y-3">
            <Label>Date Format</Label>
            <RadioGroup value={dateFormat} onValueChange={setDateFormat}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="MM/DD/YYYY" id="date1" />
                <Label htmlFor="date1" className="cursor-pointer">
                  MM/DD/YYYY <span className="text-gray-500">(12/31/2024)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DD/MM/YYYY" id="date2" />
                <Label htmlFor="date2" className="cursor-pointer">
                  DD/MM/YYYY <span className="text-gray-500">(31/12/2024)</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="YYYY-MM-DD" id="date3" />
                <Label htmlFor="date3" className="cursor-pointer">
                  YYYY-MM-DD <span className="text-gray-500">(2024-12-31)</span>
                </Label>
              </div>
            </RadioGroup>
            <p className="text-gray-500">Choose how dates are displayed</p>
          </div>

          {/* Time Format */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Time Format</Label>
                <p className="text-gray-500">
                  {timeFormat === "12-hour" ? "12-hour (2:30 PM)" : "24-hour (14:30)"}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-gray-600">12-hour</span>
                <Switch
                  checked={timeFormat === "24-hour"}
                  onCheckedChange={(checked) =>
                    setTimeFormat(checked ? "24-hour" : "12-hour")
                  }
                />
                <span className="text-gray-600">24-hour</span>
              </div>
            </div>
          </div>

          {/* Theme */}
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme("light")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === "light"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <Sun className="w-6 h-6 text-yellow-500" />
                  </div>
                  <span className="text-gray-900">Light</span>
                </div>
              </button>

              <button
                onClick={() => setTheme("dark")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === "dark"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gray-800 border-2 border-gray-700 rounded-lg flex items-center justify-center">
                    <Moon className="w-6 h-6 text-blue-400" />
                  </div>
                  <span className="text-gray-900">Dark</span>
                </div>
              </button>

              <button
                onClick={() => setTheme("auto")}
                className={`p-4 border-2 rounded-lg transition-all ${
                  theme === "auto"
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center space-y-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-white to-gray-800 border-2 border-gray-400 rounded-lg flex items-center justify-center">
                    <Monitor className="w-6 h-6 text-gray-600" />
                  </div>
                  <span className="text-gray-900">Auto</span>
                </div>
              </button>
            </div>
            <p className="text-gray-500">Choose your preferred color scheme</p>
          </div>
        </div>
      </Card>

      {/* Default Settings */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="text-gray-900">Default Settings</h3>
        </div>

        <div className="space-y-6">
          {/* Default Class Duration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Default Class Duration</Label>
              <span className="text-gray-900">{classDuration[0]} minutes</span>
            </div>
            <Slider
              value={classDuration}
              onValueChange={setClassDuration}
              min={30}
              max={180}
              step={15}
              className="py-4"
            />
            <div className="flex justify-between text-gray-500">
              <span>30 min</span>
              <span>180 min</span>
            </div>
            <p className="text-gray-500">Standard duration for class sessions</p>
          </div>

          {/* Attendance Window */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Attendance Window</Label>
              <span className="text-gray-900">{attendanceWindow[0]} minutes</span>
            </div>
            <Slider
              value={attendanceWindow}
              onValueChange={setAttendanceWindow}
              min={5}
              max={30}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-gray-500">
              <span>5 min</span>
              <span>30 min</span>
            </div>
            <p className="text-gray-500">
              Time window before/after class start for attendance marking
            </p>
          </div>

          {/* Late Threshold */}
          <div className="space-y-3">
            <Label htmlFor="lateThreshold">Late Threshold</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="lateThreshold"
                type="number"
                min={1}
                max={60}
                value={lateThreshold}
                onChange={(e) => setLateThreshold(parseInt(e.target.value) || 0)}
                className="max-w-32"
              />
              <span className="text-gray-600">minutes</span>
            </div>
            <p className="text-gray-500">
              Minutes after class start to mark student as late instead of absent
            </p>
          </div>
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderAttendanceRules = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Attendance Rules</h2>
        <p className="text-gray-500">Configure automated attendance marking and verification rules</p>
      </div>

      {/* Automatic Marking */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-gray-900">Automatic Marking</h3>
        </div>

        <div className="space-y-6">
          {/* Enable Auto-Attendance */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Enable Auto-Attendance</Label>
              <p className="text-gray-500">
                Automatically mark attendance when students are detected by face recognition
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${autoAttendance ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={autoAttendance}
                onCheckedChange={setAutoAttendance}
              />
              <span className={`${autoAttendance ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Grace Period */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Grace Period for Late Arrival</Label>
              <span className="text-gray-900">{gracePeriod[0]} minutes</span>
            </div>
            <Slider
              value={gracePeriod}
              onValueChange={setGracePeriod}
              min={0}
              max={30}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-gray-500">
              <span>0 min</span>
              <span>30 min</span>
            </div>
            <p className="text-gray-500">
              Allow students to arrive within this time without being marked late
            </p>
          </div>

          {/* Detection Confidence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Minimum Detection Confidence</Label>
              <span className="text-gray-900">{detectionConfidence[0]}%</span>
            </div>
            <Slider
              value={detectionConfidence}
              onValueChange={setDetectionConfidence}
              min={70}
              max={99}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-gray-500">
              <span>70%</span>
              <span>99%</span>
            </div>
            <p className="text-gray-500">
              Minimum confidence level required for automatic face recognition
            </p>
          </div>

          {/* Allow Multiple Detections */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Allow Multiple Detections Per Session</Label>
              <p className="text-gray-500">
                Record all detections during a class session (for monitoring movement)
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${allowMultipleDetections ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={allowMultipleDetections}
                onCheckedChange={setAllowMultipleDetections}
              />
              <span className={`${allowMultipleDetections ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Manual Override */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
            <Lock className="w-5 h-5 text-orange-600" />
          </div>
          <h3 className="text-gray-900">Manual Override</h3>
        </div>

        <div className="space-y-6">
          {/* Allow Manual Marking */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Allow Manual Attendance Marking</Label>
              <p className="text-gray-500">
                Teachers can manually mark attendance for students
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${allowManualMarking ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={allowManualMarking}
                onCheckedChange={setAllowManualMarking}
              />
              <span className={`${allowManualMarking ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Require Verification */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Require Verification for Manual Edits</Label>
              <p className="text-gray-500">
                Manual attendance changes require admin approval
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${requireVerification ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={requireVerification}
                onCheckedChange={setRequireVerification}
              />
              <span className={`${requireVerification ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Teachers Edit After Deadline */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Teachers Can Edit After Deadline</Label>
              <p className="text-gray-500">
                Allow teachers to modify attendance after the lock period
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${teachersEditAfterDeadline ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={teachersEditAfterDeadline}
                onCheckedChange={setTeachersEditAfterDeadline}
              />
              <span className={`${teachersEditAfterDeadline ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Lock Attendance After */}
          <div className="space-y-3">
            <Label>Lock Attendance After</Label>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min={1}
                max={365}
                value={lockAfterValue}
                onChange={(e) => setLockAfterValue(parseInt(e.target.value) || 1)}
                className="max-w-32"
              />
              <Select value={lockAfterUnit} onValueChange={setLockAfterUnit}>
                <SelectTrigger className="max-w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hours">Hours</SelectItem>
                  <SelectItem value="days">Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-gray-500">
              Attendance records will be locked automatically after this period
            </p>
          </div>
        </div>
      </Card>

      {/* Absence Alerts */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <Bell className="w-5 h-5 text-red-600" />
          </div>
          <h3 className="text-gray-900">Absence Alerts</h3>
        </div>

        <div className="space-y-6">
          {/* Enable Absence Notifications */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Enable Absence Notifications</Label>
              <p className="text-gray-500">
                Send alerts when students are absent or have low attendance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${enableAbsenceAlerts ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={enableAbsenceAlerts}
                onCheckedChange={setEnableAbsenceAlerts}
              />
              <span className={`${enableAbsenceAlerts ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Consecutive Absences Alert */}
          <div className="space-y-3">
            <Label htmlFor="consecutiveAbsences">Alert After Consecutive Absences</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="consecutiveAbsences"
                type="number"
                min={1}
                max={10}
                value={consecutiveAbsences}
                onChange={(e) => setConsecutiveAbsences(parseInt(e.target.value) || 1)}
                className="max-w-32"
              />
              <span className="text-gray-600">days</span>
            </div>
            <p className="text-gray-500">
              Trigger notification after this many consecutive absent days
            </p>
          </div>

          {/* Notify Parents */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Notify Parents/Guardians</Label>
              <p className="text-gray-500">
                Send absence alerts to student's parents or guardians
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${notifyParents ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={notifyParents}
                onCheckedChange={setNotifyParents}
              />
              <span className={`${notifyParents ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Alert Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Alert Threshold Percentage</Label>
              <span className="text-gray-900">{alertThreshold[0]}%</span>
            </div>
            <Slider
              value={alertThreshold}
              onValueChange={setAlertThreshold}
              min={50}
              max={95}
              step={5}
              className="py-4"
            />
            <div className="flex justify-between text-gray-500">
              <span>50%</span>
              <span>95%</span>
            </div>
            <p className="text-gray-500">
              Send alert when student's attendance drops below this percentage
            </p>
          </div>
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderRecognitionSettings = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">Recognition Settings</h2>
        <p className="text-gray-500">Configure face recognition parameters and performance</p>
      </div>

      {/* Recognition Model */}
      <Card className="p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-gray-900">Recognition Model</h3>
        </div>

        <div className="space-y-6">
          {/* Recognition Model */}
          <div className="space-y-3">
            <Label>Recognition Model</Label>
            <Select value={recognitionModel} onValueChange={setRecognitionModel}>
              <SelectTrigger id="recognitionModel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="FaceNet">FaceNet</SelectItem>
                <SelectItem value="ArcFace">ArcFace</SelectItem>
                <SelectItem value="DeepFace">DeepFace</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-gray-500">Choose the face recognition model</p>
          </div>

          {/* Similarity Threshold */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Similarity Threshold</Label>
              <span className="text-gray-900">{similarityThreshold[0]}%</span>
            </div>
            <Slider
              value={similarityThreshold}
              onValueChange={setSimilarityThreshold}
              min={0.5}
              max={1.0}
              step={0.01}
              className="py-4"
            />
            <div className="flex justify-between text-gray-500">
              <span>50%</span>
              <span>100%</span>
            </div>
            <p className="text-gray-500">
              Minimum similarity score to consider a match
            </p>
          </div>

          {/* Face Quality Score */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Face Quality Score</Label>
              <span className="text-gray-900">{faceQualityScore[0]}%</span>
            </div>
            <Slider
              value={faceQualityScore}
              onValueChange={setFaceQualityScore}
              min={0}
              max={100}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-gray-500">
              <span>0%</span>
              <span>100%</span>
            </div>
            <p className="text-gray-500">
              Minimum quality score for face detection
            </p>
          </div>

          {/* Enable Multiple Faces */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Enable Multiple Faces Detection</Label>
              <p className="text-gray-500">
                Detect and process multiple faces in a single frame
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${enableMultipleFaces ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={enableMultipleFaces}
                onCheckedChange={setEnableMultipleFaces}
              />
              <span className={`${enableMultipleFaces ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Minimum Face Size */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Minimum Face Size</Label>
              <span className="text-gray-900">{minFaceSize[0]} pixels</span>
            </div>
            <Slider
              value={minFaceSize}
              onValueChange={setMinFaceSize}
              min={50}
              max={500}
              step={10}
              className="py-4"
            />
            <div className="flex justify-between text-gray-500">
              <span>50 px</span>
              <span>500 px</span>
            </div>
            <p className="text-gray-500">
              Minimum size of face to be detected
            </p>
          </div>

          {/* Detection Speed */}
          <div className="space-y-3">
            <Label>Detection Speed</Label>
            <Select value={detectionSpeed} onValueChange={setDetectionSpeed}>
              <SelectTrigger id="detectionSpeed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fast">Fast</SelectItem>
                <SelectItem value="balanced">Balanced</SelectItem>
                <SelectItem value="accurate">Accurate</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-gray-500">Choose the detection speed</p>
          </div>

          {/* Max Faces Per Frame */}
          <div className="space-y-3">
            <Label>Max Faces Per Frame</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={maxFacesPerFrame}
              onChange={(e) => setMaxFacesPerFrame(parseInt(e.target.value) || 1)}
              className="max-w-32"
            />
            <p className="text-gray-500">
              Maximum number of faces to detect in a single frame
            </p>
          </div>

          {/* Log Unknown Faces */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Log Unknown Faces</Label>
              <p className="text-gray-500">
                Record faces that do not match any known student
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${logUnknownFaces ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={logUnknownFaces}
                onCheckedChange={setLogUnknownFaces}
              />
              <span className={`${logUnknownFaces ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Save Detection Images */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Save Detection Images</Label>
              <p className="text-gray-500">
                Store images of detected faces for analysis
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${saveDetectionImages ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={saveDetectionImages}
                onCheckedChange={setSaveDetectionImages}
              />
              <span className={`${saveDetectionImages ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Re-Recognition Interval */}
          <div className="space-y-3">
            <Label>Re-Recognition Interval</Label>
            <Input
              type="number"
              min={1}
              max={60}
              value={reRecognitionInterval}
              onChange={(e) => setReRecognitionInterval(parseInt(e.target.value) || 1)}
              className="max-w-32"
            />
            <p className="text-gray-500">
              Time interval (in seconds) for re-recognition of faces
            </p>
          </div>

          {/* Process Every N Frames */}
          <div className="space-y-3">
            <Label>Process Every N Frames</Label>
            <Input
              type="number"
              min={1}
              max={10}
              value={processEveryNFrames[0]}
              onChange={(e) => setProcessEveryNFrames([parseInt(e.target.value) || 1])}
              className="max-w-32"
            />
            <p className="text-gray-500">
              Process face recognition every N frames
            </p>
          </div>

          {/* GPU Acceleration */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>GPU Acceleration</Label>
              <p className="text-gray-500">
                Use GPU for faster face recognition processing
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${gpuAcceleration ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={gpuAcceleration}
                onCheckedChange={setGpuAcceleration}
              />
              <span className={`${gpuAcceleration ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>

          {/* Processing Threads */}
          <div className="space-y-3">
            <Label>Processing Threads</Label>
            <Input
              type="number"
              min={1}
              max={16}
              value={processingThreads}
              onChange={(e) => setProcessingThreads(parseInt(e.target.value) || 1)}
              className="max-w-32"
            />
            <p className="text-gray-500">
              Number of threads to use for face recognition processing
            </p>
          </div>

          {/* Memory Limit */}
          <div className="space-y-3">
            <Label>Memory Limit</Label>
            <div className="flex items-center space-x-3">
              <Input
                type="number"
                min={512}
                max={8192}
                value={memoryLimit}
                onChange={(e) => setMemoryLimit(parseInt(e.target.value) || 512)}
                className="max-w-32"
              />
              <Select value={memoryUnit} onValueChange={setMemoryUnit}>
                <SelectTrigger className="max-w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MB">MB</SelectItem>
                  <SelectItem value="GB">GB</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-gray-500">
              Maximum memory usage for face recognition processing
            </p>
          </div>

          {/* Show Performance Metrics */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <Label>Show Performance Metrics</Label>
              <p className="text-gray-500">
                Display performance metrics for face recognition
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`${showPerformanceMetrics ? "text-gray-400" : "text-gray-900"}`}>
                OFF
              </span>
              <Switch
                checked={showPerformanceMetrics}
                onCheckedChange={setShowPerformanceMetrics}
              />
              <span className={`${showPerformanceMetrics ? "text-gray-900" : "text-gray-400"}`}>
                ON
              </span>
            </div>
          </div>
        </div>
      </Card>

      {/* Action Bar */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          Save Changes
        </Button>
      </div>
    </div>
  );

  const renderPlaceholderSection = (title: string) => (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-2">{title}</h2>
        <p className="text-gray-500">This section is under construction</p>
      </div>
      <Card className="p-12 text-center">
        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-500">Settings for this section will be available soon</p>
      </Card>
    </div>
  );

  return (
    <div className={`min-h-screen ${backgroundClass} flex`}>
      {/* Left Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 fixed h-screen overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <Button variant="ghost" size="icon" onClick={onBack} className="mb-4">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-gray-900">Settings</h2>
        </div>

        {/* Menu Items */}
        <nav className="p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-blue-600 text-white"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className={isActive ? "" : ""}>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="ml-64 flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-gray-900">System Settings</h1>
            <p className="text-gray-500">Adjust platform preferences and your personal admin profile.</p>
          </div>
          <Button variant="ghost" className="p-0" onClick={() => setProfileModal({ open: true, tab: "profile" })}>
            <Avatar className="h-10 w-10">
              <AvatarImage src="" alt="Admin" />
              <AvatarFallback className="bg-blue-100 text-blue-600">AD</AvatarFallback>
            </Avatar>
          </Button>
        </div>
        <div className="max-w-5xl">
          {activeSection === "general" && renderGeneralSettings()}
          {activeSection === "attendance" && renderAttendanceRules()}
          {activeSection === "recognition" && renderRecognitionSettings()}
          {activeSection === "notifications" &&
            renderPlaceholderSection("Notification Settings")}
        </div>
      </div>

      <ProfileSettingsModal
        open={profileModal.open}
        onClose={() => setProfileModal((prev) => ({ ...prev, open: false }))}
        role={userRole as "admin"}
        userName="Admin User"
        email="admin@attendance.com"
        defaultTab={profileModal.tab}
      />
    </div>
  );
}