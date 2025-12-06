import { useState } from "react";
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
  File
} from "lucide-react";

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
  onLogout?: () => void;
  onNavigateToSettings?: () => void;
  onNavigateToNotifications?: () => void;
  onNavigateToDashboard?: () => void;
  onNavigateToCameras?: () => void;
}

export function ReportsAnalytics({ 
  onBack, 
  userRole,
  onLogout,
  onNavigateToSettings,
  onNavigateToNotifications,
  onNavigateToDashboard,
  onNavigateToCameras
}: ReportsAnalyticsProps) {
  const [selectedClass, setSelectedClass] = useState("");
  const [studentSearch, setStudentSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [dateRange, setDateRange] = useState("last30");

  // Mock data
  const studentData: StudentAttendance[] = [
    {
      id: "1",
      name: "John Smith",
      rollNumber: "CS-2023-001",
      totalClasses: 45,
      present: 42,
      absent: 2,
      late: 1,
      percentage: 93.3,
    },
    {
      id: "2",
      name: "Sarah Johnson",
      rollNumber: "CS-2023-002",
      totalClasses: 45,
      present: 44,
      absent: 1,
      late: 0,
      percentage: 97.8,
    },
    {
      id: "3",
      name: "Mike Davis",
      rollNumber: "CS-2023-003",
      totalClasses: 45,
      present: 38,
      absent: 4,
      late: 3,
      percentage: 84.4,
    },
    {
      id: "4",
      name: "Emily Brown",
      rollNumber: "CS-2023-004",
      totalClasses: 45,
      present: 40,
      absent: 3,
      late: 2,
      percentage: 88.9,
    },
    {
      id: "5",
      name: "David Wilson",
      rollNumber: "CS-2023-005",
      totalClasses: 45,
      present: 45,
      absent: 0,
      late: 0,
      percentage: 100,
    },
    {
      id: "6",
      name: "Lisa Anderson",
      rollNumber: "CS-2023-006",
      totalClasses: 45,
      present: 35,
      absent: 7,
      late: 3,
      percentage: 77.8,
    },
  ];

  const filteredStudents = studentData.filter((student) =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.rollNumber.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const stats = {
    averageAttendance: 90.4,
    totalClasses: userRole === "admin" ? 450 : 45,
    mostAttended: "Computer Science - 10A",
    lowestDay: "Friday",
  };

  const handleGenerateReport = () => {
    console.log("Generating report...");
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
      onBack();
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
      {onLogout && onNavigateToSettings && onNavigateToNotifications && (
        <DashboardNav 
          currentPage="Reports"
          onPageChange={handlePageChange}
          onLogout={onLogout}
          userRole={userRole}
          onNavigateToSettings={onNavigateToSettings}
          onNavigateToNotifications={onNavigateToNotifications}
        />
      )}

      {/* Page Header with Export */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-gray-900">Reports & Analytics</h1>
            <p className="text-gray-500">
              {userRole === "admin" 
                ? "View comprehensive attendance analytics"
                : "View your class attendance reports"}
            </p>
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

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Filter Section */}
        <Card className="p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label>Class/Section</Label>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger>
                    <SelectValue placeholder={userRole === "admin" ? "All Classes" : "Select class"} />
                  </SelectTrigger>
                  <SelectContent>
                    {userRole === "admin" && <SelectItem value="all">All Classes</SelectItem>}
                    <SelectItem value="cs-10a">Computer Science - 10A</SelectItem>
                    <SelectItem value="cs-10b">Computer Science - 10B</SelectItem>
                    <SelectItem value="math-11a">Mathematics - 11A</SelectItem>
                    <SelectItem value="eng-12a">English - 12A</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Search Student</Label>
                <Input
                  type="text"
                  placeholder="Name or Roll Number"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
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
                <p className="text-green-600">+2.3% from last month</p>
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
                <p className="text-green-600">96.5% attendance</p>
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
                <p className="text-red-600">82.1% average</p>
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
                  <AttendanceTrendChart />
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <StatusDistributionChart />
                </CardContent>
              </Card>
            </div>

            <Card className="p-6">
              <CardHeader className="p-0 mb-4">
                <CardTitle>Attendance Calendar Heat Map</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <AttendanceHeatMap />
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
                                <span className={`${
                                  student.percentage >= 90 ? 'text-green-600' :
                                  student.percentage >= 75 ? 'text-yellow-600' :
                                  'text-red-600'
                                }`}>
                                  {student.percentage.toFixed(1)}%
                                </span>
                              </div>
                              <Progress 
                                value={student.percentage} 
                                className={`h-2 ${
                                  student.percentage >= 90 ? '[&>div]:bg-green-500' :
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
                  <AttendanceTrendChart />
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Class Comparison</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ClassComparisonChart userRole={userRole} />
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Attendance Distribution</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <StatusDistributionChart />
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle>Weekly Pattern</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="h-64 flex items-center justify-center text-gray-400">
                    <AttendanceHeatMap compact />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}