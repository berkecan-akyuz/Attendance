import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Progress } from "./ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { CreateEditClassModal } from "./CreateEditClassModal";
import {
  ArrowLeft,
  Search,
  Plus,
  BookOpen,
  Users,
  TrendingUp,
  AlertTriangle,
  MapPin,
  Camera,
  Clock,
  Calendar,
  Edit,
  Eye,
  ClipboardList,
} from "lucide-react";

interface Class {
  id: string;
  code: string;
  name: string;
  department: string;
  teacher: {
    id: string;
    name: string;
    photo: string;
  } | null;
  enrollment: {
    current: number;
    max: number;
  };
  schedule: {
    days: string[];
    startTime: string;
    endTime: string;
  };
  room: string;
  camera: string;
  semester: string;
  year: string;
}

interface ClassManagementProps {
  onBack: () => void;
  userRole: "admin" | "teacher";
  teacherId?: string;
}

export function ClassManagement({ onBack, userRole, teacherId }: ClassManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);

  const [classes, setClasses] = useState<Class[]>([
    {
      id: "1",
      code: "CS101",
      name: "Introduction to Programming",
      department: "Computer Science",
      teacher: {
        id: "t1",
        name: "John Teacher",
        photo: "",
      },
      enrollment: { current: 32, max: 40 },
      schedule: {
        days: ["Mon", "Wed", "Fri"],
        startTime: "09:00",
        endTime: "10:30",
      },
      room: "Room 101",
      camera: "Camera 12",
      semester: "Fall",
      year: "2024",
    },
    {
      id: "2",
      code: "MATH201",
      name: "Calculus II",
      department: "Mathematics",
      teacher: {
        id: "t2",
        name: "Sarah Williams",
        photo: "",
      },
      enrollment: { current: 28, max: 35 },
      schedule: {
        days: ["Tue", "Thu"],
        startTime: "14:00",
        endTime: "16:00",
      },
      room: "Room 203",
      camera: "Camera 08",
      semester: "Fall",
      year: "2024",
    },
    {
      id: "3",
      code: "ENG105",
      name: "English Literature",
      department: "English",
      teacher: {
        id: "t3",
        name: "Lisa Anderson",
        photo: "",
      },
      enrollment: { current: 25, max: 30 },
      schedule: {
        days: ["Mon", "Wed"],
        startTime: "11:00",
        endTime: "12:30",
      },
      room: "Room 305",
      camera: "Camera 15",
      semester: "Fall",
      year: "2024",
    },
    {
      id: "4",
      code: "PHY301",
      name: "Quantum Physics",
      department: "Physics",
      teacher: null,
      enrollment: { current: 0, max: 25 },
      schedule: {
        days: ["Tue", "Thu"],
        startTime: "10:00",
        endTime: "11:30",
      },
      room: "Room 402",
      camera: "Camera 20",
      semester: "Spring",
      year: "2025",
    },
    {
      id: "5",
      code: "CS201",
      name: "Data Structures & Algorithms",
      department: "Computer Science",
      teacher: {
        id: "t1",
        name: "John Teacher",
        photo: "",
      },
      enrollment: { current: 38, max: 40 },
      schedule: {
        days: ["Mon", "Wed", "Fri"],
        startTime: "13:00",
        endTime: "14:30",
      },
      room: "Room 102",
      camera: "Camera 13",
      semester: "Fall",
      year: "2024",
    },
    {
      id: "6",
      code: "CHEM101",
      name: "General Chemistry",
      department: "Chemistry",
      teacher: null,
      enrollment: { current: 0, max: 30 },
      schedule: {
        days: ["Tue", "Thu"],
        startTime: "08:00",
        endTime: "09:30",
      },
      room: "Lab 201",
      camera: "Camera 25",
      semester: "Fall",
      year: "2024",
    },
  ]);

  // Filter classes for teachers - only show their assigned classes
  const displayClasses =
    userRole === "teacher"
      ? classes.filter((c) => c.teacher?.id === teacherId)
      : classes;

  const stats = {
    totalClasses: displayClasses.length,
    activeSemester: displayClasses.filter(
      (c) => c.semester === "Fall" && c.year === "2024"
    ).length,
    avgClassSize: Math.round(
      displayClasses.reduce((acc, c) => acc + c.enrollment.current, 0) /
        displayClasses.length
    ),
    withoutTeachers: displayClasses.filter((c) => !c.teacher).length,
  };

  const departments = Array.from(new Set(displayClasses.map((c) => c.department)));
  const semesters = Array.from(
    new Set(displayClasses.map((c) => `${c.semester} ${c.year}`))
  );

  const getDepartmentColor = (dept: string) => {
    const colors: Record<string, string> = {
      "Computer Science": "bg-blue-100 text-blue-700 hover:bg-blue-100",
      Mathematics: "bg-purple-100 text-purple-700 hover:bg-purple-100",
      English: "bg-green-100 text-green-700 hover:bg-green-100",
      Physics: "bg-orange-100 text-orange-700 hover:bg-orange-100",
      Chemistry: "bg-pink-100 text-pink-700 hover:bg-pink-100",
    };
    return colors[dept] || "bg-gray-100 text-gray-700 hover:bg-gray-100";
  };

  const filteredClasses = displayClasses.filter((cls) => {
    const matchesSearch =
      cls.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cls.teacher?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDept =
      departmentFilter === "all" || cls.department === departmentFilter;

    const matchesSemester =
      semesterFilter === "all" ||
      `${cls.semester} ${cls.year}` === semesterFilter;

    return matchesSearch && matchesDept && matchesSemester;
  });

  const handleCreateClass = () => {
    setEditingClass(null);
    setModalOpen(true);
  };

  const handleEditClass = (cls: Class) => {
    setEditingClass(cls);
    setModalOpen(true);
  };

  const handleSaveClass = (classData: Partial<Class>) => {
    if (editingClass) {
      setClasses(
        classes.map((c) => (c.id === editingClass.id ? { ...c, ...classData } : c))
      );
    } else {
      const newClass: Class = {
        id: String(classes.length + 1),
        code: classData.code || "",
        name: classData.name || "",
        department: classData.department || "",
        teacher: classData.teacher || null,
        enrollment: classData.enrollment || { current: 0, max: 30 },
        schedule: classData.schedule || { days: [], startTime: "", endTime: "" },
        room: classData.room || "",
        camera: classData.camera || "",
        semester: classData.semester || "",
        year: classData.year || "",
      };
      setClasses([...classes, newClass]);
    }
    setModalOpen(false);
    setEditingClass(null);
  };

  const getEnrollmentPercentage = (current: number, max: number) => {
    return (current / max) * 100;
  };

  const getEnrollmentColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-gray-900">Class Management</h1>
            <p className="text-gray-500">
              {userRole === "admin"
                ? "Manage all classes and assignments"
                : "View and manage your assigned classes"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Total Classes</p>
                <p className="text-gray-900">{stats.totalClasses}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Active This Semester</p>
                <p className="text-gray-900">{stats.activeSemester}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Average Class Size</p>
                <p className="text-gray-900">{stats.avgClassSize || 0}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-1">Without Teachers</p>
                <p className="text-gray-900">{stats.withoutTeachers}</p>
              </div>
              <div
                className={`w-12 h-12 ${
                  stats.withoutTeachers > 0 ? "bg-red-100" : "bg-gray-100"
                } rounded-lg flex items-center justify-center`}
              >
                <AlertTriangle
                  className={`w-6 h-6 ${
                    stats.withoutTeachers > 0 ? "text-red-600" : "text-gray-400"
                  }`}
                />
              </div>
            </div>
          </Card>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 flex-1">
            <div className="relative w-full md:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search by code, name, or teacher..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="All Semesters" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Semesters</SelectItem>
                {semesters.map((sem) => (
                  <SelectItem key={sem} value={sem}>
                    {sem}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {userRole === "admin" && (
            <Button onClick={handleCreateClass} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Create New Class
            </Button>
          )}
        </div>

        {/* Class Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClasses.length === 0 ? (
            <div className="col-span-full">
              <Card className="p-12 text-center">
                <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-gray-900 mb-2">No classes found</h3>
                <p className="text-gray-500">
                  {userRole === "admin"
                    ? "Create a new class to get started"
                    : "No classes assigned to you"}
                </p>
              </Card>
            </div>
          ) : (
            filteredClasses.map((cls) => {
              const enrollmentPercentage = getEnrollmentPercentage(
                cls.enrollment.current,
                cls.enrollment.max
              );

              return (
                <Card
                  key={cls.id}
                  className="p-6 hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200"
                >
                  {/* Class Code and Name */}
                  <div className="mb-4">
                    <h3 className="text-gray-900 mb-2">
                      {cls.code} - {cls.name}
                    </h3>
                    <Badge className={getDepartmentColor(cls.department)}>
                      {cls.department}
                    </Badge>
                  </div>

                  {/* Teacher */}
                  <div className="mb-4">
                    {cls.teacher ? (
                      <div className="flex items-center space-x-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={cls.teacher.photo} alt={cls.teacher.name} />
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {cls.teacher.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-gray-600">Assigned Teacher</p>
                          <p className="text-gray-900">{cls.teacher.name}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertTriangle className="w-4 h-4" />
                        <span>No teacher assigned</span>
                      </div>
                    )}
                  </div>

                  {/* Enrollment */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-gray-600">Student Enrollment</p>
                      <p
                        className={`${getEnrollmentColor(
                          enrollmentPercentage
                        )}`}
                      >
                        {cls.enrollment.current}/{cls.enrollment.max} students
                      </p>
                    </div>
                    <Progress value={enrollmentPercentage} className="h-2" />
                  </div>

                  {/* Schedule */}
                  <div className="mb-4 space-y-2">
                    <div className="flex items-start space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4 mt-0.5" />
                      <span>
                        {cls.schedule.days.join(", ")} • {cls.schedule.startTime} -{" "}
                        {cls.schedule.endTime}
                      </span>
                    </div>
                    <div className="flex items-start space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>{cls.room}</span>
                    </div>
                    <div className="flex items-start space-x-2 text-gray-600">
                      <Camera className="w-4 h-4 mt-0.5" />
                      <span>{cls.camera}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 pt-4 border-t border-gray-200">
                    {userRole === "admin" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditClass(cls)}
                        className="flex-1"
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => alert(`Viewing students for ${cls.name}`)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Students
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => alert(`Viewing attendance for ${cls.name}`)}
                    >
                      <ClipboardList className="w-4 h-4 mr-1" />
                      Attendance
                    </Button>
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {modalOpen && (
        <CreateEditClassModal
          classData={editingClass}
          onSave={handleSaveClass}
          onClose={() => {
            setModalOpen(false);
            setEditingClass(null);
          }}
        />
      )}
    </div>
  );
}