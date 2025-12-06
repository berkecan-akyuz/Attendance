import { useState } from "react";
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
  photo: string;
  status: "present" | "absent" | "late";
  timeIn: string;
  verificationMethod: "auto" | "manual";
  notes?: string;
}

interface TeacherAttendanceProps {
  onBack: () => void;
  onLogout: () => void;
  onNavigateToReports: () => void;
  onNavigateToLive: () => void;
  onNavigateToNotifications: () => void;
}

export function TeacherAttendance({ onBack, onLogout, onNavigateToReports, onNavigateToLive, onNavigateToNotifications }: TeacherAttendanceProps) {
  const [currentPage, setCurrentPage] = useState("attendance");
  const [selectedClass, setSelectedClass] = useState("CS 10A");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickFilter, setQuickFilter] = useState("today");
  const [editingStudent, setEditingStudent] = useState<AttendanceRecord | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // Mock data
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([
    {
      id: "1",
      rollNumber: "CS-2023-001",
      studentName: "John Smith",
      photo:
        "https://ui-avatars.com/api/?name=John+Smith&size=100&background=4F46E5",
      status: "present",
      timeIn: "09:15 AM",
      verificationMethod: "auto",
    },
    {
      id: "2",
      rollNumber: "CS-2023-002",
      studentName: "Sarah Johnson",
      photo:
        "https://ui-avatars.com/api/?name=Sarah+Johnson&size=100&background=10B981",
      status: "present",
      timeIn: "09:10 AM",
      verificationMethod: "auto",
    },
    {
      id: "3",
      rollNumber: "CS-2023-003",
      studentName: "Mike Davis",
      photo:
        "https://ui-avatars.com/api/?name=Mike+Davis&size=100&background=F59E0B",
      status: "late",
      timeIn: "09:35 AM",
      verificationMethod: "auto",
    },
    {
      id: "4",
      rollNumber: "CS-2023-004",
      studentName: "Emily Brown",
      photo:
        "https://ui-avatars.com/api/?name=Emily+Brown&size=100&background=EC4899",
      status: "absent",
      timeIn: "-",
      verificationMethod: "manual",
      notes: "Sick leave",
    },
    {
      id: "5",
      rollNumber: "CS-2023-005",
      studentName: "David Wilson",
      photo:
        "https://ui-avatars.com/api/?name=David+Wilson&size=100&background=8B5CF6",
      status: "present",
      timeIn: "09:05 AM",
      verificationMethod: "auto",
    },
    {
      id: "6",
      rollNumber: "CS-2023-006",
      studentName: "Lisa Anderson",
      photo:
        "https://ui-avatars.com/api/?name=Lisa+Anderson&size=100&background=06B6D4",
      status: "late",
      timeIn: "09:40 AM",
      verificationMethod: "manual",
    },
  ]);

  const stats = {
    totalStudents: 32,
    presentToday: 28,
    absentToday: 4,
    attendanceRate: 87.5,
  };

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
        return null;
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

  if (currentPage === "classes") {
    return (
      <ClassManagement
        onBack={() => setCurrentPage("attendance")}
        userRole="teacher"
        teacherId="t1"
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
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
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
                    <SelectItem value="cs-10a">Computer Science - 10A</SelectItem>
                    <SelectItem value="cs-10b">Computer Science - 10B</SelectItem>
                    <SelectItem value="math-11a">Mathematics - 11A</SelectItem>
                    <SelectItem value="eng-12a">English - 12A</SelectItem>
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
                  <TableHead>Status</TableHead>
                  <TableHead>Time In</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceData.map((record) => (
                  <TableRow key={record.id} className={getRowClassName(record.status)}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={record.photo} />
                          <AvatarFallback>
                            {record.studentName.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{record.studentName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{record.rollNumber}</TableCell>
                    <TableCell>{getStatusBadge(record.status)}</TableCell>
                    <TableCell className="text-gray-600">{record.timeIn}</TableCell>
                    <TableCell>
                      {record.verificationMethod === "auto" ? (
                        <div className="flex items-center text-blue-600">
                          <Scan className="w-4 h-4 mr-1" />
                          <span>Auto</span>
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-600">
                          <PenSquare className="w-4 h-4 mr-1" />
                          <span>Manual</span>
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingStudent(record)}
                          disabled={isLocked}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
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
    </div>
  );
}