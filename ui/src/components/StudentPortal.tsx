import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
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
import { CorrectionRequestModal } from "./CorrectionRequestModal";
import { AttendanceDetailsModal } from "./AttendanceDetailsModal";
import { CircularProgress } from "./CircularProgress";
import {
  ScanFace,
  LogOut,
  User,
  Settings,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Scan,
  PenSquare,
  ChevronLeft,
  ChevronRight,
  Bell,
} from "lucide-react";
import { fetchStudentDashboard, StudentDashboard, submitCorrectionRequest } from "../lib/api";
// ProfileSettingsModal import removed


interface AttendanceRecord {
  id: string;
  date: string;
  class: string;
  status: "present" | "absent" | "late";
  timeIn: string;
  verificationMethod: "auto" | "manual";
}

interface StudentPortalProps {
  userId?: number | null;
  onLogout: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToUserProfile?: (tab?: string) => void;
}

export function StudentPortal({ userId, onLogout, onNavigateToNotifications, onNavigateToUserProfile }: StudentPortalProps) {
  const [selectedFilter, setSelectedFilter] = useState("thisMonth");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [requestingCorrection, setRequestingCorrection] = useState<AttendanceRecord | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboard | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Modal state removed

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setError(null);
      try {
        const data = await fetchStudentDashboard(userId);
        setDashboard(data);
        const mapped = (data.recent_records || []).map((record) => ({
          id: `record-${record.attendance_id}`,
          date: record.session_date || "",
          class: record.lecture,
          status: record.status as AttendanceRecord["status"],
          timeIn: record.time_in || "-",
          verificationMethod: (record.verification_method === "Manual" ? "manual" : "auto") as "auto" | "manual",
        }));
        setAttendanceRecords(mapped);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load student data";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId]);

  const stats = useMemo(() => {
    const present = dashboard?.attendance.present || 0;
    const absent = dashboard?.attendance.absent || 0;
    const late = dashboard?.attendance.late || 0;
    const unknown = dashboard?.attendance.unknown || 0;
    const total = present + absent + late + unknown || attendanceRecords.length;
    return {
      totalClasses: total,
      present,
      absent,
      late,
      percentage: dashboard?.attendance.percentage || (total ? Math.round((present / total) * 1000) / 10 : 0),
    };
  }, [attendanceRecords.length, dashboard]);

  const studentName =
    dashboard?.student?.user?.full_name || dashboard?.student?.full_name || "Student";
  const rollNumber = dashboard?.student?.roll_number || dashboard?.student?.user?.username || "";

  const getStatusBadge = (status: string) => {
    const configs = {
      present: {
        className: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle2,
        label: "Present",
      },
      absent: {
        className: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: XCircle,
        label: "Absent",
      },
      late: {
        className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: Clock,
        label: "Late",
      },
    };

    const config = configs[status as keyof typeof configs];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleDownloadReport = () => {
    console.log("Downloading attendance report...");
    alert("Your attendance report is being downloaded!");
  };

  const handleSubmitCorrection = async (reason: string) => {
    if (!userId || !requestingCorrection) return;

    try {
      // Extract numeric ID from "record-123"
      const attendanceId = parseInt(requestingCorrection.id.replace("record-", ""));
      if (isNaN(attendanceId)) throw new Error("Invalid attendance ID");

      await submitCorrectionRequest(attendanceId, userId, reason);
      alert("Your correction request has been submitted successfully!");
      setRequestingCorrection(null);
    } catch (err) {
      alert("Failed to submit request: " + (err instanceof Error ? err.message : "Unknown error"));
    }
  };

  // Filter attendance records based on selected filter
  const getFilteredRecords = () => {
    const now = new Date();

    if (selectedFilter === "thisWeek") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekAgo && recordDate <= now;
      });
    }

    if (selectedFilter === "thisMonth") {
      const monthAgo = new Date(now);
      monthAgo.setMonth(now.getMonth() - 1);
      return attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= monthAgo && recordDate <= now;
      });
    }

    // custom or default - show all
    return attendanceRecords;
  };

  const filteredRecords = getFilteredRecords();

  // Calendar functions
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getAttendanceForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0];
    return attendanceRecords.find((record) => record.date === dateStr);
  };

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Navigation */}
      <nav className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ScanFace className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-gray-900">Attendance System</span>
                <p className="text-gray-500">Student Portal</p>
              </div>
            </div>

            {/* Profile and Logout */}
            <div className="flex items-center space-x-3">
              {/* Notifications Bell */}
              <Button
                variant="ghost"
                size="icon"
                className="relative"
                onClick={onNavigateToNotifications}
              >
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white">
                  1
                </Badge>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={studentName} />
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {studentName.split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div>
                      <p>{studentName}</p>
                      <p className="text-gray-500">{rollNumber}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => {
                      onNavigateToUserProfile?.("profile");
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      onNavigateToUserProfile?.("security");
                    }}
                  >
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

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
      </nav>



      <div className="max-w-7xl mx-auto px-6 py-4 space-y-2">
        {error && (
          <Card className="p-4 border-red-200 bg-red-50 text-red-700">{error}</Card>
        )}
        {loading && (
          <Card className="p-4 border-blue-100 bg-blue-50 text-blue-700">Loading your attendance...</Card>
        )}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Welcome Header */}
        <div>
          <h1 className="text-gray-900 mb-2">Welcome, {studentName}!</h1>
          <p className="text-gray-500">Track your attendance and stay updated</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Circular Progress Card */}
          <Card className="p-6 md:col-span-1">
            <div className="flex flex-col items-center">
              <CircularProgress value={stats.percentage} />
              <p className="text-gray-600 mt-4">Overall Attendance</p>
            </div>
          </Card>

          {/* Stats Cards */}
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Classes</p>
                <p className="text-gray-900">{stats.totalClasses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Present</p>
                <p className="text-gray-900">{stats.present}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Absent</p>
                <p className="text-gray-900">{stats.absent}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Monthly Calendar */}
        <Card className="p-6">
          <CardHeader className="p-0 mb-6">
            <div className="flex items-center justify-between">
              <CardTitle>Monthly Attendance Calendar</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-gray-900 min-w-[150px] text-center">
                  {currentMonth.toLocaleDateString("en-US", {
                    month: "long",
                    year: "numeric",
                  })}
                </span>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 gap-2">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-gray-600 py-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {(() => {
                const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
                const days = [];

                // Empty cells for days before month starts
                for (let i = 0; i < startingDayOfWeek; i++) {
                  days.push(
                    <div key={`empty-${i}`} className="aspect-square"></div>
                  );
                }

                // Days of the month
                for (let day = 1; day <= daysInMonth; day++) {
                  const date = new Date(
                    currentMonth.getFullYear(),
                    currentMonth.getMonth(),
                    day
                  );
                  const attendance = getAttendanceForDate(date);
                  const isToday =
                    date.toDateString() === new Date().toDateString();

                  let bgColor = "bg-gray-100";
                  if (attendance) {
                    if (attendance.status === "present") bgColor = "bg-green-100";
                    if (attendance.status === "absent") bgColor = "bg-red-100";
                    if (attendance.status === "late") bgColor = "bg-yellow-100";
                  }

                  days.push(
                    <button
                      key={day}
                      onClick={() => attendance && setSelectedDate(date)}
                      className={`aspect-square rounded-lg ${bgColor} hover:opacity-80 transition-opacity flex items-center justify-center ${isToday ? "ring-2 ring-blue-500" : ""
                        } ${attendance ? "cursor-pointer" : "cursor-default"}`}
                    >
                      <span className="text-gray-900">{day}</span>
                    </button>
                  );
                }

                return days;
              })()}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center space-x-6 mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-green-100"></div>
                <span className="text-gray-600">Present</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-red-100"></div>
                <span className="text-gray-600">Absent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-yellow-100"></div>
                <span className="text-gray-600">Late</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gray-100"></div>
                <span className="text-gray-600">No Class</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>My Attendance Records</CardTitle>
              <div className="flex items-center space-x-3">
                {/* Filter Buttons */}
                <div className="flex items-center space-x-2">
                  {["thisWeek", "thisMonth", "custom"].map((filter) => (
                    <Button
                      key={filter}
                      variant={selectedFilter === filter ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedFilter(filter)}
                      className={
                        selectedFilter === filter
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }
                    >
                      {filter === "thisWeek" && "This Week"}
                      {filter === "thisMonth" && "This Month"}
                      {filter === "custom" && "Custom Range"}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={handleDownloadReport}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Report
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Time In</TableHead>
                    <TableHead>Verification</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell>
                        {new Date(record.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </TableCell>
                      <TableCell>{record.class}</TableCell>
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRequestingCorrection(record)}
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Request Correction
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      {requestingCorrection && (
        <CorrectionRequestModal
          record={requestingCorrection}
          onSubmit={handleSubmitCorrection}
          onClose={() => setRequestingCorrection(null)}
        />
      )}

      {selectedDate && (
        <AttendanceDetailsModal
          date={selectedDate}
          attendance={getAttendanceForDate(selectedDate)!}
          onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}