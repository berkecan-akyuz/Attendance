import React, { useEffect, useState } from "react";
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
  fetchTeacherStats,
  fetchTeacherStudents,
  batchMarkAttendance,
  fetchCorrectionRequests,
  resolveCorrectionRequest,
  CorrectionRequest,
  getOrCreateSession,
  lockSession,
  fetchLectures,
} from "../lib/api";

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
  ClipboardList,
  MessageSquare,
  RefreshCcw,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "./ui/utils";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { CalendarIcon } from "lucide-react";
import { ReportsAnalytics } from "./ReportsAnalytics";

interface AttendanceRecord {
  id: string;
  userId: number;
  rollNumber: string;
  studentName: string;
  lecture: string;
  status: string;
  email?: string;
  // Added for manual marking
  manualStatus?: string;
}

interface TeacherAttendanceProps {
  userId: number;
  onBack: () => void;
  onLogout: () => void;
  onNavigateToReports: () => void;
  onNavigateToLive: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToUserProfile?: (tab?: string) => void;
}

export function TeacherAttendance({ userId, onBack, onLogout, onNavigateToReports, onNavigateToLive, onNavigateToNotifications, onNavigateToUserProfile }: TeacherAttendanceProps) {
  const [currentPage, setCurrentPage] = useState("attendance"); // "attendance" is now "Daily Review"
  const [selectedClass, setSelectedClass] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [quickFilter, setQuickFilter] = useState("today");
  const [editingStudent, setEditingStudent] = useState<AttendanceRecord | null>(null);
  const [isLocked, setIsLocked] = useState(false);

  // New State for Manual/Requests
  const [manualDate, setManualDate] = useState<Date>(new Date());
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [lectureSchedules, setLectureSchedules] = useState<Record<string, number[]>>({});

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

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    try {
      const [teacherSummary, students, allLectures] = await Promise.all([
        fetchTeacherStats(userId),
        fetchTeacherStudents(userId),
        fetchLectures(),
      ]);

      // Process schedules
      const schedules: Record<string, number[]> = {};
      allLectures.forEach(lecture => {
        if (lecture.schedule) {
          // Robust parsing for "Monday", "Mon", "Tu", "Tues", etc.
          const days: number[] = [];
          const lower = lecture.schedule.toLowerCase();

          if (lower.includes("sun")) days.push(0);
          if (lower.includes("mon")) days.push(1);
          if (lower.includes("tue")) days.push(2);
          if (lower.includes("wed")) days.push(3);
          if (lower.includes("thu")) days.push(4);
          if (lower.includes("fri")) days.push(5);
          if (lower.includes("sat")) days.push(6);

          if (days.length) schedules[lecture.lecture_name] = days;
        }
      });
      setLectureSchedules(schedules);

      const mapped = students.map((student) => ({
        id: String(student.student_id),
        userId: (student as any).user_id || student.student_id,
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

  useEffect(() => {
    loadData();
  }, [userId]);

  // Load existing session data when class or date changes
  useEffect(() => {
    const loadSession = async () => {
      if (!selectedClass || !manualDate) return;

      const dateStr = format(manualDate, "yyyy-MM-dd");
      setIsLocked(false); // Reset lock state initially
      try {
        const { existing_records, status } = await getOrCreateSession(selectedClass, dateStr);

        // Check if session is locked
        if (status === 'locked') {
          setIsLocked(true);
        }

        if (existing_records && Object.keys(existing_records).length > 0) {
          setAttendanceData(prev => prev.map(record => ({
            ...record,
            manualStatus: existing_records[record.userId] || record.manualStatus
          })));
        } else {
          // Reset if new session and not locked (if locked, we assume records are there or it's just locked empty)
          setAttendanceData(prev => prev.map(record => ({
            ...record,
            manualStatus: undefined
          })));
        }
      } catch (e) {
        console.error("Failed to load session", e);
      }
    };
    loadSession();
  }, [selectedClass, manualDate]);

  const handleExport = () => {
    // Mock export functionality
    alert("Exporting attendance data...");
  };

  const handleLockAttendance = async () => {
    if (!selectedClass) return;
    const dateStr = format(manualDate, "yyyy-MM-dd");

    if (confirm("Are you sure you want to lock this attendance session? This action cannot be undone.")) {
      try {
        // We typically need the session ID, so we might need to get it again or store it.
        // For simplicity, let's assume we get it again or it was stored. 
        // Ideally we should store currentSessionId in state. 
        // Let's do a quick fetch to get ID.
        const { session_id } = await getOrCreateSession(selectedClass, dateStr);
        await lockSession(session_id);
        setIsLocked(true);
        alert("Attendance has been locked.");
      } catch (e: any) {
        alert("Error locking attendance: " + e.message);
      }
    }
  };



  const handleManualSubmit = async () => {
    if (isLocked) {
      alert("Attendance is locked and cannot be modified.");
      return;
    }
    if (!userId) return;
    if (!selectedClass) {
      alert("Please select a class first.");
      return;
    }

    setLoading(true);
    try {
      // Get or Create Session
      const dateStr = format(manualDate, "yyyy-MM-dd");
      const sessionData = await getOrCreateSession(selectedClass, dateStr);
      const sessionId = sessionData.session_id;

      const records = filteredData.map(student => ({
        session_id: sessionId,
        user_id: student.userId,
        status: student.manualStatus || "Absent"
      }));

      await batchMarkAttendance(records, userId);
      alert("Attendance marked successfully");
    } catch (e: any) {
      alert("Error marking attendance: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentPage === 'requests' && userId) {
      setLoadingRequests(true);
      fetchCorrectionRequests(userId)
        .then(setRequests)
        .catch(e => console.error(e))
        .finally(() => setLoadingRequests(false));
    }
  }, [currentPage, userId]);

  const handleResolveRequest = async (reqId: number, status: "Approved" | "Rejected") => {
    if (!userId) return;
    try {
      await resolveCorrectionRequest(reqId, status, userId, "Reviewed by teacher");
      setRequests(requests.filter(r => r.request_id !== reqId));
      alert(`Request ${status}`);
    } catch (e: any) {
      alert("Error resolving request: " + e.message);
    }
  };


  const handleSaveEdit = (updatedRecord: any) => {
    setAttendanceData(
      attendanceData.map((record) =>
        record.id === updatedRecord.id ? (updatedRecord as AttendanceRecord) : record
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
                <FileText className="w-4 h-4 mr-2" />
                Daily Review
              </Button>
              <Button
                variant={currentPage === "manual" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("manual")}
                className={
                  currentPage === "manual"
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "hover:bg-gray-200"
                }
              >
                <ClipboardList className="w-4 h-4 mr-2" />
                Attendance Verification And View
              </Button>
              <Button
                variant={currentPage === "requests" ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage("requests")}
                className={
                  currentPage === "requests"
                    ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700"
                    : "hover:bg-gray-200"
                }
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Requests
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
                {/* REMOVED: Reports Button as it is now integrated */}

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
                    <DropdownMenuItem
                      onSelect={() => {
                        onNavigateToUserProfile?.();
                      }}
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={() => {
                        onNavigateToUserProfile?.();
                      }}
                    >
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
          <h1 className="text-gray-900 mb-2">
            {currentPage === "attendance" ? "Daily Review" :
              currentPage === "manual" ? "Attendance Verification And View" :
                currentPage === "requests" ? "Correction Requests" : "Teacher Portal"}
          </h1>
          <p className="text-gray-500">
            {currentPage === "attendance" ? "Comprehensive reports and analytics for your classes" :
              currentPage === "manual" ? "View and verify student attendance records manually" :
                "Manage system changes"}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">

        {/* --- REQUESTS VIEW --- */}
        {currentPage === "requests" && (
          <Card className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Student</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingRequests ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">Loading...</TableCell></TableRow>
                ) : requests.length === 0 ? (
                  <TableRow><TableCell colSpan={5} className="text-center py-8 text-gray-500">No pending requests</TableCell></TableRow>
                ) : (
                  requests.map(req => (
                    <TableRow key={req.request_id}>
                      <TableCell>{req.requested_at ? new Date(req.requested_at).toLocaleDateString() : "-"}</TableCell>
                      <TableCell>{req.requesting_user_name || req.requesting_user_id}</TableCell>
                      <TableCell>{req.reason}</TableCell>
                      <TableCell><Badge variant="outline">{req.status}</Badge></TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button size="sm" variant="outline" className="text-green-600 hover:bg-green-50" onClick={() => handleResolveRequest(req.request_id, "Approved")}>Approve</Button>
                        <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50" onClick={() => handleResolveRequest(req.request_id, "Rejected")}>Reject</Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        )}

        {/* --- MANUAL VIEW ("Attendance Verification And View") --- */}
        {currentPage === "manual" && (
          <div className="space-y-6">
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Class</Label>
                  <Select value={selectedClass} onValueChange={setSelectedClass}>
                    <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
                    <SelectContent>
                      {classOptions.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {selectedClass && (
                    <p className="text-xs text-muted-foreground">
                      {lectureSchedules[selectedClass]
                        ? `Schedule: ${lectureSchedules[selectedClass].map(d => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}`
                        : "No schedule found (all dates enabled)"}
                    </p>
                  )}
                </div>
                <div className="space-y-2 flex flex-col">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !manualDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {manualDate ? format(manualDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={manualDate}
                        onSelect={(d) => d && setManualDate(d)}
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={2000}
                        toYear={2030}
                        disabled={(date) => {
                          if (!selectedClass) return false;
                          const schedule = lectureSchedules[selectedClass];
                          if (!schedule) {
                            console.log("No schedule found for", selectedClass, lectureSchedules);
                            return false;
                          }
                          const day = date.getDay();
                          // console.log("Checking date", date, day, "Schedule:", schedule, "Disabled?", !schedule.includes(day));
                          return !schedule.includes(day);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="flex items-end space-x-2">
                  <Button onClick={handleManualSubmit} disabled={loading || isLocked} className="flex-1 bg-blue-600 hover:bg-blue-700">
                    {loading ? "Saving..." : isLocked ? "Attendance Locked" : "Save Attendance"}
                  </Button>

                  {/* Lock Button Moved Here */}
                  <Button
                    onClick={handleLockAttendance}
                    disabled={isLocked || loading}
                    title={isLocked ? "Attendance Session is Locked" : "Lock this session permanently"}
                    className={`${isLocked
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-orange-600 hover:bg-orange-700"
                      }`}
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    {isLocked ? "Locked" : "Lock"}
                  </Button>
                </div>
              </div>
            </Card>

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredData.map((record, idx) => (
                    <TableRow key={record.id}>
                      <TableCell>
                        <div className="font-medium">{record.studentName}</div>
                        <div className="text-xs text-gray-500">{record.rollNumber}</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          {["Present", "Absent", "Late"].map(status => (
                            <Button
                              key={status}
                              size="sm"
                              disabled={isLocked}
                              variant={record.manualStatus === status ? "default" : "outline"}
                              onClick={() => {
                                if (isLocked) return;
                                const newData = [...attendanceData];
                                const globalIndex = newData.findIndex(r => r.id === record.id);
                                if (globalIndex !== -1) {
                                  newData[globalIndex].manualStatus = status;
                                  setAttendanceData(newData);
                                }
                              }}
                              className={
                                record.manualStatus === status
                                  ? (status === "Present" ? "bg-green-600" : status === "Absent" ? "bg-red-600" : "bg-yellow-600")
                                  : ""
                              }
                            >
                              {status}
                            </Button>
                          ))}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </div>
        )}

        {/* --- DAILY REVIEW VIEW ("Attendance") --- */}
        {currentPage === "attendance" && (
          <ReportsAnalytics
            onBack={() => { }}
            userId={userId}
            userRole="teacher"
            embedded={true}
            onNavigateToUserProfile={onNavigateToUserProfile}
          />
        )}

      </div>

      {/* Edit Modal */}
      {
        editingStudent && (
          <EditAttendanceModal
            student={editingStudent as any}
            onSave={handleSaveEdit}
            onClose={() => setEditingStudent(null)}
          />
        )
      }
    </div >
  );
}