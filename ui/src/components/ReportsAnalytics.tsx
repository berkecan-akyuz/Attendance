import React, { useEffect, useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { DashboardNav } from "./DashboardNav";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { AttendanceTrendChart } from "./charts/AttendanceTrendChart";
import { ClassComparisonChart } from "./charts/ClassComparisonChart";
import { StatusDistributionChart } from "./charts/StatusDistributionChart";
import { AttendanceHeatMap } from "./charts/AttendanceHeatMap";

import {
  Download,
  ArrowLeft,
  TrendingUp,
  Users,
  Award,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  File,
  CalendarIcon,
  Check,
  ChevronsUpDown
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  AttendanceReports,
  fetchAttendanceReports,
  fetchLectureSummaries,
  LectureSummary,
  fetchTeacherStudents,
  fetchStudents,
  fetchLectureStudents
} from "../lib/api";
import { format } from "date-fns";
import { cn } from "./ui/utils";
import { Calendar } from "./ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";

interface StudentAttendance {
  id: string;
  name: string;
  rollNumber: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

interface ReportsAnalyticsProps {
  onBack: () => void;
  userRole: "admin" | "teacher";
  userId?: number | null;
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToDashboard?: (section?: string) => void;
  onNavigateToCameras?: () => void;

  onNavigateToUserProfile?: (tab?: string) => void;
  unreadCount?: number;
  embedded?: boolean;
}

export function ReportsAnalytics({
  onBack,
  userRole,
  userId,
  onLogout = () => { },
  onNavigateToSettings = () => { },
  onNavigateToNotifications = () => { },
  onNavigateToDashboard = () => { },
  onNavigateToCameras = () => { },

  onNavigateToUserProfile = () => { },
  unreadCount = 0,
  embedded = false
}: ReportsAnalyticsProps) {
  const [selectedClass, setSelectedClass] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [allStudents, setAllStudents] = useState<
    Array<{
      id: number;
      name: string;
      rollNumber: string;
      email?: string;
      // Stats
      totalClasses?: number;
      present?: number;
      absent?: number;
      late?: number;
      attendancePercentage?: number;
    }>
  >([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateRange, setDateRange] = useState("last30");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

  const [reports, setReports] = useState<AttendanceReports | null>(null);
  const [classes, setClasses] = useState<LectureSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [reportData, lectureData] = await Promise.all([
          fetchAttendanceReports(userRole === "teacher" ? userId || undefined : undefined),
          fetchLectureSummaries(
            userRole === "teacher" && userId ? { teacherUserId: userId } : undefined
          ),
        ]);
        setReports(reportData);
        setClasses(lectureData);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load reports";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, userRole]);

  // Fetch students when class changes or on load
  useEffect(() => {
    const loadStudents = async () => {
      try {
        let data = [];
        if (selectedClass && selectedClass !== "all") {
          data = await fetchLectureStudents(Number(selectedClass));
        } else {
          if (userRole === "teacher" && userId) {
            data = await fetchTeacherStudents(userId);
          } else {
            data = await fetchStudents();
          }
        }

        // Normalize data structure
        const normalized = data.map(s => ({
          id: s.student_id /* teacher endpoint */ || s.user_id /* admin endpoint */,
          name: s.full_name,
          rollNumber: s.roll_number,
          email: s.email,
          totalClasses: s.total_classes || 0,
          present: s.present || 0,
          absent: s.absent || 0,
          late: s.late || 0,
          attendancePercentage: s.attendance_percentage || 0,
        }));

        // Filter unique by ID (teacher endpoint might return same student multiple times for different lectures)
        const unique = Array.from(new Map(normalized.map(item => [item.id, item])).values());

        setAllStudents(unique);
      } catch (e) {
        console.error("Failed to load students", e);
      }
    };
    loadStudents();
  }, [selectedClass, userRole, userId]);

  const tableRows = useMemo(() => {
    // If we have search term, filter allStudents. 
    // Ideally we should show attendance for these students. 
    // Since we lack bulk student attendance stats API, we will list the students.
    // Use 'allStudents' as the source of truth for the list.

    return allStudents.map((student) => {
      // Mock stats or find if available in reports (unlikely)
      return {
        id: String(student.id),
        name: student.name,
        rollNumber: student.rollNumber,
        totalClasses: student.totalClasses || 0,
        present: student.present || 0,
        absent: student.absent || 0,
        late: student.late || 0,
        percentage: student.attendancePercentage || 0,
      } as StudentAttendance;
    });
  }, [allStudents]);

  const filteredStudents = tableRows.filter((student) => {
    if (studentSearch === "All Students") return true;
    return student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(studentSearch.toLowerCase());
  });

  const searchSuggestions = useMemo(() => {
    if (!studentSearch) return [];
    return allStudents.filter(s =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
    ).slice(0, 5); // Limit suggestions
  }, [studentSearch, allStudents]);

  const stats = {
    averageAttendance: reports?.average_attendance || 0,
    totalClasses: reports?.classes.length || 0,
    mostAttended: reports?.classes[0]?.lecture_name || "N/A",
    lowestDay: reports?.recent_sessions[0]?.session_date || "Most recent",
  };

  const trendData = useMemo(() => {
    if (!reports?.recent_sessions) return [] as Array<{ date: string; attendance: number }>;
    return reports.recent_sessions.map((session) => {
      const total = session.present + session.absent + session.late;
      const attendance = total ? Math.round((session.present / total) * 1000) / 10 : 0;
      return {
        date: session.session_date || `Session ${session.session_id}`,
        attendance,
      };
    });
  }, [reports]);

  const statusData = useMemo(() => {
    const base = reports?.status;
    if (!base) return [] as Array<{ name: string; value: number; percentage?: number }>;
    const total = base.present + base.absent + base.late + (base.unknown || 0);
    const pct = (val: number) => (total ? Math.round((val / total) * 1000) / 10 : 0);
    return [
      { name: "Present", value: base.present, percentage: pct(base.present) },
      { name: "Absent", value: base.absent, percentage: pct(base.absent) },
      { name: "Late", value: base.late, percentage: pct(base.late) },
    ];
  }, [reports]);

  const heatMapData = useMemo(
    () =>
      trendData.map((item) => ({
        date: item.date,
        attendance: item.attendance,
      })),
    [trendData]
  );

  const comparisonData = useMemo(() => {
    if (!reports?.classes) return [] as Array<{ class: string; attendance: number }>;
    return reports.classes.map((cls) => {
      const total = cls.total || cls.present + cls.absent + cls.late;
      const attendance = total ? Math.round((cls.present / total) * 1000) / 10 : 0;
      return { class: cls.lecture_name, attendance };
    });
  }, [reports]);

  const handleGenerateReport = () => {
    if (!reports) return;
    const rows = [
      ["Lecture", "Date", "Present", "Absent", "Late", "Status"],
      ...(reports.recent_sessions || []).map((s) => [
        s.lecture_name,
        s.session_date,
        s.present,
        s.absent,
        s.late,
        s.status,
      ]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "attendance-report.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: string) => {
    console.log(`Exporting as ${format}`);
  };

  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    const today = new Date();
    let from = new Date();

    switch (range) {
      case "last7":
        from.setDate(today.getDate() - 7);
        break;
      case "last30":
        from.setDate(today.getDate() - 30);
        break;
      case "semester":
        from.setMonth(today.getMonth() - 3);
        break;
      default:
        return;
    }

    setDateFrom(from.toISOString().split('T')[0]);
    setDateTo(today.toISOString().split('T')[0]);
  };

  const handlePageChange = (page: string) => {
    if (page === "Dashboard") {
      onNavigateToDashboard?.("Dashboard");
    } else if ((page === "Users" || page === "Classes") && onNavigateToDashboard) {
      onNavigateToDashboard(page);
    } else if (page === "Settings" && onNavigateToSettings) {
      onNavigateToSettings();
    } else if (page === "Cameras" && onNavigateToCameras) {
      onNavigateToCameras();
    }
    // Reports is already the active page
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      {!embedded && (
        <DashboardNav
          currentPage="Reports"
          onPageChange={handlePageChange}
          onLogout={onLogout}
          userRole={userRole}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToNotifications={onNavigateToNotifications}
          unreadCount={unreadCount}
          onProfileClick={(tab) => onNavigateToUserProfile(tab)}
        />
      )}



      {/* Page Header with Export */}
      {!embedded && (
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-gray-900">Reports & Analytics</h1>
                <p className="text-gray-500">
                  {userRole === "admin"
                    ? "View comprehensive attendance analytics"
                    : "View your class attendance reports"}
                </p>
              </div>
            </div>

            {/* Export Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport("pdf")}>
                  <FileText className="w-4 h-4 mr-2" />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("excel")}>
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  Export as Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport("csv")}>
                  <File className="w-4 h-4 mr-2" />
                  Export as CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <div className={cn("max-w-7xl mx-auto px-6 py-8 space-y-6", embedded && "px-0 py-0")}>
        {error && (
          <Card className="p-4 border-red-200 bg-red-50 text-red-700">{error}</Card>
        )}
        {loading && (
          <Card className="p-4 border-blue-100 bg-blue-50 text-blue-700">Loading reports...</Card>
        )}
        {/* Filter Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Class/Section</Label>
                <Select
                  value={selectedClass}
                  onValueChange={(val: string) => {
                    setSelectedClass(val);
                    setStudentSearch((val === "all") ? "All Students" : ""); // Auto-set All Students text
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={userRole === "admin" ? "All Classes" : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">
                      {userRole === "admin" ? "All Classes" : "All My Classes"}
                    </SelectItem>
                    {classes.map((cls) => (
                      <SelectItem key={cls.lecture_id} value={String(cls.lecture_id)}>
                        {cls.lecture_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search Student</Label>
                <div className="relative z-50">
                  <Input
                    type="text"
                    disabled={!selectedClass || selectedClass === "all"}
                    placeholder={
                      !selectedClass
                        ? "Select a class first search students"
                        : selectedClass === "all"
                          ? "Viewing all students (Search disabled)"
                          : "Name or Roll Number"
                    }
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      setOpen(true);
                      setActiveSuggestionIndex(0); // Reset active index on new input
                    }}
                    onFocus={() => setOpen(true)}
                    onBlur={() => {
                      // Delay closing to allow click events on suggestions to fire
                      setTimeout(() => setOpen(false), 200);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "ArrowDown") {
                        e.preventDefault();
                        setActiveSuggestionIndex((prevIndex) =>
                          Math.min(prevIndex + 1, searchSuggestions.length - 1)
                        );
                      } else if (e.key === "ArrowUp") {
                        e.preventDefault();
                        setActiveSuggestionIndex((prevIndex) =>
                          Math.max(prevIndex - 1, 0)
                        );
                      } else if (e.key === "Enter" && open && searchSuggestions.length > 0) {
                        e.preventDefault();
                        const selectedStudent = searchSuggestions[activeSuggestionIndex];
                        if (selectedStudent) {
                          setStudentSearch(selectedStudent.name);
                          setOpen(false);
                        }
                      } else if (e.key === "Escape") {
                        setOpen(false);
                      }
                    }}
                    className="w-full"
                  />
                  {open && (searchSuggestions.length > 0 || "all students".includes(studentSearch.toLowerCase())) && (
                    <div className="absolute top-full left-0 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg overflow-hidden z-50">
                      <ul>
                        {/* Option for All Students */}
                        {"all students".includes(studentSearch.toLowerCase()) && (
                          <li
                            className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm font-semibold border-b border-gray-100 flex items-center justify-between text-blue-600"
                            onClick={() => {
                              setStudentSearch("All Students"); // Explicitly set text
                              setOpen(false);
                            }}
                          >
                            <span>All Students</span>
                            <Check className={cn("h-4 w-4", studentSearch === "All Students" || studentSearch === "" ? "opacity-100" : "opacity-0")} />
                          </li>
                        )}
                        {searchSuggestions.map((s, idx) => (
                          <li
                            key={s.id}
                            className={cn(
                              "px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm flex items-center justify-between",
                              activeSuggestionIndex === idx && "bg-gray-50"
                            )}
                            onClick={() => {
                              setStudentSearch(s.name);
                              setOpen(false);
                            }}
                          >
                            <span>{s.name} <span className="text-gray-500 text-xs">({s.rollNumber})</span></span>
                          </li>
                        ))}
                      </ul>
                      {/* "Backdrop" to close on click outside could be handled by a global listener or valid Blur.
                          For simplicity, we can rely on standard blur if we carefully handle click vs blur timing,
                          or simple toggle. Adding a close on blur: */}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>From Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      disabled={!selectedClass}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateFrom && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateFrom ? format(new Date(dateFrom), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateFrom ? new Date(dateFrom) : undefined}
                      onSelect={(date) => setDateFrom(date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={2000}
                      toYear={2030}
                      weekStartsOn={1}
                      modifiers={{
                        weekend: (date) => {
                          const day = date.getDay();
                          return day === 0 || day === 6;
                        }
                      }}
                      modifiersClassNames={{
                        weekend: "text-red-500"
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      disabled={!selectedClass}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateTo && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateTo ? format(new Date(dateTo), "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dateTo ? new Date(dateTo) : undefined}
                      onSelect={(date) => setDateTo(date ? format(date, "yyyy-MM-dd") : "")}
                      initialFocus
                      captionLayout="dropdown-buttons"
                      fromYear={2000}
                      toYear={2030}
                      weekStartsOn={1}
                      modifiers={{
                        weekend: (date) => {
                          const day = date.getDay();
                          return day === 0 || day === 6;
                        }
                      }}
                      modifiersClassNames={{
                        weekend: "text-red-500"
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-gray-600">Quick range:</span>
                {[
                  { value: "last7", label: "Last 7 Days" },
                  { value: "last30", label: "Last 30 Days" },
                  { value: "semester", label: "This Semester" },
                  { value: "custom", label: "Custom" },
                ].map((range) => (
                  <Button
                    key={range.value}
                    variant={dateRange === range.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleDateRangeChange(range.value)}
                    className={dateRange === range.value ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {range.label}
                  </Button>
                ))}
              </div>

              <Button onClick={handleGenerateReport} className="bg-green-600 hover:bg-green-700">
                Generate Report
              </Button>
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Average Attendance</p>
                <p className="text-gray-900 mb-2">{stats.averageAttendance}%</p>
                <p className="text-gray-500">Based on recent sessions</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Classes</p>
                <p className="text-gray-900 mb-2">{stats.totalClasses}</p>
                <p className="text-gray-500">Across all sessions</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Most Attended</p>
                <p className="text-gray-900 mb-2">{stats.mostAttended}</p>
                <p className="text-gray-500">Highest attendance class</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Lowest Attendance</p>
                <p className="text-gray-900 mb-2">{stats.lowestDay}</p>
                <p className="text-gray-500">Most recent low session</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <AttendanceTrendChart data={trendData} />
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <StatusDistributionChart data={statusData} />
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Attendance Calendar Heat Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AttendanceHeatMap data={heatMapData} />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Detailed Report Tab */}
          <TabsContent value="detailed" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Attendance Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 text-gray-600">Student Name</th>
                        <th className="text-left py-3 px-4 text-gray-600">Roll Number</th>
                        <th className="text-center py-3 px-4 text-gray-600">Total Classes</th>
                        <th className="text-center py-3 px-4 text-gray-600">Present</th>
                        <th className="text-center py-3 px-4 text-gray-600">Absent</th>
                        <th className="text-center py-3 px-4 text-gray-600">Late</th>
                        <th className="text-left py-3 px-4 text-gray-600">Percentage</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">{student.name}</td>
                          <td className="py-3 px-4 text-gray-600">{student.rollNumber}</td>
                          <td className="py-3 px-4 text-center">{student.totalClasses}</td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-green-600">{student.present}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-red-600">{student.absent}</span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className="text-yellow-600">{student.late}</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className={`${student.percentage >= 90 ? 'text-green-600' :
                                  student.percentage >= 75 ? 'text-yellow-600' :
                                    'text-red-600'
                                  }`}>
                                  {student.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <Progress
                                value={student.percentage}
                                className={`h-2 ${student.percentage >= 90 ? '[&>div]:bg-green-500' :
                                  student.percentage >= 75 ? '[&>div]:bg-yellow-500' :
                                    '[&>div]:bg-red-500'
                                  }`}
                              />
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Charts Tab */}
          <TabsContent value="charts" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Daily Attendance Trend</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <AttendanceTrendChart data={trendData} />
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Class Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ClassComparisonChart userRole={userRole} data={comparisonData} />
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <StatusDistributionChart data={statusData} />
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Weekly Pattern</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <AttendanceHeatMap compact data={heatMapData} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div >
    </div >
  );
}