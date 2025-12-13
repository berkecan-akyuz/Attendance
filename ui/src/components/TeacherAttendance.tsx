import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { EditAttendanceModal } from "./EditAttendanceModal";
import { ClassManagement } from "./ClassManagement";
import { fetchTeacherStats, fetchTeacherStudents } from "../lib/api";
import { ProfileSettingsModal } from "./ProfileSettingsModal";
import {
  ScanFace,
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Edit,
  LogOut,
  User,
  Settings,
  FileText,
  Radio,
  Eye,
  Lock,
  Scan,
  PenSquare,
  Bell,
  BookOpen,
} from "lucide-react";

interface AttendanceRecord {
  id: string;
  rollNumber: string;
  studentName: string;
  lecture: string;
  status: string;
  email?: string;
}

interface TeacherAttendanceProps {
  userId?: number | null;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToReports: () => void;
  onNavigateToLive: () => void;
  onNavigateToNotifications: () => void;
}

export function TeacherAttendance({ userId, onBack, onLogout, onNavigateToReports, onNavigateToLive, onNavigateToNotifications }: TeacherAttendanceProps) {
  const [currentPage, setCurrentPage] = useState("attendance");
  const [selectedClass, setSelectedClass] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickFilter, setQuickFilter] = useState("today");
  const [editingStudent, setEditingStudent] = useState<AttendanceRecord | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [profileModal, setProfileModal] = useState<{
    open: boolean;
    tab: "profile" | "security" | "preferences";
  }>({ open: false, tab: "profile" });

  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    presentToday: 0,
    absentToday: 0,
    attendanceRate: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const [teacherSummary, students] = await Promise.all([
          fetchTeacherStats(userId),
          fetchTeacherStudents(userId),
        ]);

        const mapped = students.map((student) => ({
          id: String(student.student_id),
          rollNumber: student.roll_number,
          studentName: student.full_name,
          lecture: student.lecture,
          status: student.enrollment_status,
          email: student.email,
        }));
        setAttendanceData(mapped);

        const uniqueClasses = Array.from(new Set(mapped.map((m) => m.lecture).filter(Boolean)));
        setClassOptions(uniqueClasses);
        if (!selectedClass && uniqueClasses.length) {
          setSelectedClass(uniqueClasses[0]);
        }

        const totalStudents = teacherSummary.students || mapped.length;
        setStats({
          totalStudents,
          presentToday: totalStudents,
          absentToday: 0,
          attendanceRate: totalStudents ? 100 : 0,
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load teacher data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleExport = () => {
    // Mock export functionality
    alert("Exporting attendance data...");
  };

  const handleLockAttendance = () => {
    setIsLocked(true);
    alert("Attendance has been locked and can no longer be edited.");
  };

  const handleSaveEdit = (updatedRecord: AttendanceRecord) => {
    setAttendanceData(
      attendanceData.map((record) =>
        record.id === updatedRecord.id ? updatedRecord : record
      )
    );
    setEditingStudent(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
            Present
          </Badge>
        );
      case "absent":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Absent</Badge>
        );
      case "late":
        return (
          <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100">
            Late
          </Badge>
        );
      default:
        return (
          <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
            {status || "Enrolled"}
          </Badge>
        );
    }
  };

  const getRowClassName = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-50 hover:bg-green-100";
      case "absent":
        return "bg-red-50 hover:bg-red-100";
      case "late":
        return "bg-yellow-50 hover:bg-yellow-100";
      default:
        return "hover:bg-gray-50";
    }
  };

  const filteredData = selectedClass
    ? attendanceData.filter((record) => record.lecture === selectedClass)
    : attendanceData;

  if (currentPage === "classes") {
    return (
      <ClassManagement
        onBack={() => setCurrentPage("attendance")}
        userRole="teacher"
        teacherUserId={userId ?? undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header with Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <ScanFace className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">Teacher Portal</h1>
                <p className="text-gray-500">Attendance Management</p>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-lg">
              <Button
                variant={currentPage === "attendance" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("attendance")}
                className={
                  currentPage === "attendance"
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "hover:bg-gray-200"
                }
              >
                <Users className="w-4 h-4 mr-2" />
                Attendance
              </Button>
              <Button
                variant={currentPage === "classes" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("classes")}
                className={
                  currentPage === "classes"
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "hover:bg-gray-200"
                }
              >
                <BookOpen className="w-4 h-4 mr-2" />
                My Classes
              </Button>
            </div>

            {/* Navigation and Actions */}
            <div className="flex items-center space-x-3">
              {/* Quick Actions */}
              <div className="flex items-center space-x-3">
                <Button
                  onClick={onNavigateToLive}
                  className="bg-red-600 hover:bg-red-700"
                >
                  <Radio className="mr-2 h-4 w-4" />
                  Live Monitoring
                </Button>
                <Button
                  onClick={onNavigateToReports}
                  variant="outline"
                  className="border-blue-200 hover:bg-blue-50"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Reports
                </Button>

                {/* Notifications Bell */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={onNavigateToNotifications}
                >
                  <Bell className="w-5 h-5" />
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                    2
                  </Badge>
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="relative h-10 w-10 rounded-full"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt="Teacher" />
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          TC
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end">
                    <DropdownMenuLabel>
                      <div>
                        <p>Teacher User</p>
                        <p className="text-gray-500">teacher@attendance.com</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setProfileModal({ open: true, tab: "profile" })}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setProfileModal({ open: true, tab: "security" })}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                  onClick={onLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <ProfileSettingsModal
        open={profileModal.open}
        onClose={() => setProfileModal((prev) => ({ ...prev, open: false }))}
        role="teacher"
        userName="Teacher User"
        email="teacher@attendance.com"
        defaultTab={profileModal.tab}
      />

      {/* Page Title */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-gray-900 mb-2">Attendance Review</h1>
          <p className="text-gray-500">Monitor and manage student attendance records</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filters Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Class Selector */}
              <div className="space-y-2">
                <Label>Class/Section</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classOptions.map((cls) => (
                      <SelectItem key={cls} value={cls}>
                        {cls}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date From */}
              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>

              {/* Export Button */}
              <div className="space-y-2">
                <Label className="opacity-0">Export</Label>
                <Button onClick={handleExport} className="w-full" variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            {/* Quick Filters */}
            <div className="flex items-center space-x-2">
              <span className="text-gray-600">Quick filters:</span>
              {["today", "thisWeek", "thisMonth"].map((filter) => (
                <Button
                  key={filter}
                  variant={quickFilter === filter ? "default" : "outline"}
                  size="sm"
                  onClick={() => setQuickFilter(filter)}
                  className={
                    quickFilter === filter ? "bg-blue-600 hover:bg-blue-700" : ""
                  }
                >
                  {filter === "today" && "Today"}
                  {filter === "thisWeek" && "This Week"}
                  {filter === "thisMonth" && "This Month"}
                </Button>
              ))}
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Students</p>
                <p className="text-gray-900">{stats.totalStudents}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Present</p>
                <p className="text-gray-900">{stats.presentToday}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Absent</p>
                <p className="text-gray-900">{stats.absentToday}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-gray-900">{stats.attendanceRate}%</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Attendance Table */}
        <Card>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Roll Number</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Lecture</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-6 text-gray-500">
                      {loading ? "Loading students..." : "No students assigned yet"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData.map((record) => (
                    <TableRow key={record.id} className={getRowClassName(record.status)}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="w-10 h-10">
                            <AvatarFallback>
                              {record.studentName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-gray-900">{record.studentName}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-600">{record.rollNumber}</TableCell>
                      <TableCell className="text-gray-600">{record.email || "-"}</TableCell>
                      <TableCell className="text-gray-600">{record.lecture}</TableCell>
                      <TableCell>{getStatusBadge(record.status)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Lock Attendance Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleLockAttendance}
            disabled={isLocked}
            className={`${
              isLocked
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700"
            }`}
          >
            <Lock className="w-4 h-4 mr-2" />
            {isLocked ? "Attendance Locked" : "Lock Attendance"}
          </Button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingStudent && (
        <EditAttendanceModal
          student={editingStudent}
          onSave={handleSaveEdit}
          onClose={() => setEditingStudent(null)}
        />
      )}

      <ProfileSettingsModal
        open={profileModal.open}
        onClose={() => setProfileModal((prev) => ({ ...prev, open: false }))}
        role="teacher"
        userName="Teacher User"
        email="teacher@attendance.com"
        defaultTab={profileModal.tab}
      />
    </div>
  );
}