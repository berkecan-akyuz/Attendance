import { useEffect, useState } from "react";
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
import {
  assignLectureCamera,
  assignLectureTeacher,
  CameraResponse,
  createLecture,
  enrollStudentInLecture,
  fetchCameras,
  fetchLectureAttendanceSummary,
  fetchLectureStudents,
  fetchLectureSummaries,
  fetchStudents,
  fetchUsers,
  LectureSummary,
  UserResponse,
} from "../lib/api";

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
  semesterLabel: string;
  year: string;
}

interface ClassStudent {
  user_id: number;
  student_id: number;
  full_name?: string;
  email?: string;
  roll_number?: string;
  enrollment_status?: string;
}

interface ClassManagementProps {
  onBack: () => void;
  userRole: "admin" | "teacher";
  teacherUserId?: number;
}

export function ClassManagement({ onBack, userRole, teacherUserId }: ClassManagementProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<UserResponse[]>([]);
  const [cameras, setCameras] = useState<CameraResponse[]>([]);
  const [studentModalClass, setStudentModalClass] = useState<Class | null>(null);
  const [classStudents, setClassStudents] = useState<ClassStudent[]>([]);
  const [availableStudents, setAvailableStudents] = useState<ClassStudent[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<
    | { present: number; absent: number; late: number; unknown: number; total_records: number }
    | null
  >(null);
  const [studentModalLoading, setStudentModalLoading] = useState(false);
  const [studentModalError, setStudentModalError] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string>("");

  const getSemesterLabel = (value: string | number | null | undefined) => {
    const map: Record<string, string> = {
      "1": "Spring",
      "2": "Summer",
      "3": "Fall",
      "4": "Winter",
    };
    const key = value !== null && value !== undefined ? String(value) : "";
    return map[key] || key;
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [summaries, teacherList, cameraList] = await Promise.all([
          fetchLectureSummaries(userRole === "teacher" && teacherUserId ? { teacherUserId } : undefined),
          fetchUsers("teacher"),
          fetchCameras(),
        ]);

        const mapped: Class[] = summaries.map((lecture) => {
          const semesterValue = lecture.semester != null ? String(lecture.semester) : "";
          return {
            id: String(lecture.lecture_id),
            code: lecture.course_code || `L-${lecture.lecture_id}`,
            name: lecture.lecture_name,
            department: lecture.department || "Unassigned",
            teacher: lecture.teacher
              ? {
                  id: lecture.teacher.teacher_id
                    ? String(lecture.teacher.teacher_id)
                    : lecture.teacher.full_name || "",
                  name: lecture.teacher.full_name || "Unassigned",
                  photo: "",
                }
              : null,
            enrollment: {
              current: lecture.enrolled,
              max: lecture.capacity || lecture.enrolled || 0,
            },
            schedule: {
              days: lecture.schedule ? lecture.schedule.split(",").map((d) => d.trim()) : [],
              startTime: "",
              endTime: "",
            },
            room: lecture.room_number || "TBD",
            camera: lecture.camera?.camera_name || lecture.camera?.lecture_name || "Unassigned",
            semester: semesterValue,
            semesterLabel: getSemesterLabel(semesterValue),
            year: lecture.year ? String(lecture.year) : "",
          };
        });

        setClasses(mapped);
        setTeachers(teacherList);
        setCameras(cameraList);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load classes";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [teacherUserId, userRole]);

  // Filter classes for teachers - only show their assigned classes
  const displayClasses = classes;

  const totalEnrollment = displayClasses.reduce(
    (acc, c) => acc + c.enrollment.current,
    0
  );

  const stats = {
    totalClasses: displayClasses.length,
    activeSemester: displayClasses.filter((c) => c.semesterLabel === "Fall").length,
    avgClassSize: displayClasses.length
      ? Math.round(totalEnrollment / displayClasses.length)
      : 0,
    withoutTeachers: displayClasses.filter((c) => !c.teacher).length,
  };

  const departments = Array.from(new Set(displayClasses.map((c) => c.department)));
  const semesters = Array.from(
    new Set(displayClasses.map((c) => `${c.semesterLabel} ${c.year}`))
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
      `${cls.semesterLabel} ${cls.year}` === semesterFilter;

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

  const loadClassStudents = async (lectureId: number) => {
    setStudentModalLoading(true);
    setStudentModalError(null);
    try {
      const [enrolled, allStudents, summary] = await Promise.all([
        fetchLectureStudents(lectureId),
        fetchStudents(),
        fetchLectureAttendanceSummary(lectureId),
      ]);

      const mappedEnrolled: ClassStudent[] = enrolled.map((record: any) => ({
        user_id: record.user_id,
        student_id: record.student_id,
        full_name: record.full_name,
        email: record.email,
        roll_number: record.roll_number,
        enrollment_status: record.enrollment_status,
      }));

      const mappedAvailable: ClassStudent[] = (allStudents || []).map((record: any) => {
        const user = record.user || {};
        return {
          user_id: record.user_id || user.user_id,
          student_id: record.student_id,
          full_name: user.full_name || user.username,
          email: user.email,
          roll_number: record.roll_number,
        };
      });

      const enrolledUserIds = new Set(mappedEnrolled.map((s) => s.user_id));
      setAvailableStudents(mappedAvailable.filter((s) => !enrolledUserIds.has(s.user_id)));
      setClassStudents(mappedEnrolled);
      setAttendanceSummary(summary);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load class students";
      setStudentModalError(message);
    } finally {
      setStudentModalLoading(false);
    }
  };

  const handleOpenStudents = async (cls: Class) => {
    setStudentModalClass(cls);
    setSelectedStudentId("");
    setStudentModalError(null);
    setAttendanceSummary(null);
    setClassStudents([]);
    setAvailableStudents([]);
    setStudentModalLoading(true);
    try {
      await loadClassStudents(Number(cls.id));
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to load class details";
      setStudentModalError(message);
    } finally {
      setStudentModalLoading(false);
    }
  };

  const handleAddStudentToClass = async () => {
    if (!studentModalClass || !selectedStudentId) return;
    setStudentModalLoading(true);
    setStudentModalError(null);
    try {
      await enrollStudentInLecture(Number(studentModalClass.id), Number(selectedStudentId));
      await loadClassStudents(Number(studentModalClass.id));
      setSelectedStudentId("");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to add student";
      setStudentModalError(message);
    } finally {
      setStudentModalLoading(false);
    }
  };

  const refreshClasses = async () => {
    const summaries: LectureSummary[] = await fetchLectureSummaries(
      userRole === "teacher" && teacherUserId ? { teacherUserId } : undefined
    );
    const mapped: Class[] = summaries.map((lecture) => {
      const semesterValue = lecture.semester != null ? String(lecture.semester) : "";
      return {
        id: String(lecture.lecture_id),
        code: lecture.course_code || `L-${lecture.lecture_id}`,
        name: lecture.lecture_name,
        department: lecture.department || "Unassigned",
        teacher: lecture.teacher
          ? {
              id: lecture.teacher.teacher_id
                ? String(lecture.teacher.teacher_id)
                : lecture.teacher.full_name || "",
              name: lecture.teacher.full_name || "Unassigned",
              photo: "",
            }
          : null,
        enrollment: {
          current: lecture.enrolled,
          max: lecture.capacity || lecture.enrolled || 0,
        },
        schedule: {
          days: lecture.schedule ? lecture.schedule.split(",").map((d) => d.trim()) : [],
          startTime: "",
          endTime: "",
        },
        room: lecture.room_number || "TBD",
        camera: lecture.camera?.camera_name || lecture.camera?.lecture_name || "Unassigned",
        semester: semesterValue,
        semesterLabel: getSemesterLabel(semesterValue),
        year: lecture.year ? String(lecture.year) : "",
      };
    });
    setClasses(mapped);
  };

  const handleSaveClass = async (classData: Partial<Class> & { teacherId?: number | null; cameraId?: number | null }) => {
    setLoading(true);
    try {
      let lectureId: number | null = editingClass ? Number(editingClass.id) : null;
      if (!editingClass) {
        const semesterValue = classData.semester ? Number(classData.semester) : undefined;
        const created = await createLecture({
          lecture_name: classData.name,
          course_code: classData.code,
          department: classData.department,
          teacher_id: classData.teacherId || undefined,
          room_number: classData.room,
          schedule: classData.schedule?.days?.join(", "),
          semester: semesterValue,
          year: classData.year ? Number(classData.year) : undefined,
          capacity: classData.enrollment?.max,
        });
        lectureId = created.lecture_id;
      } else {
        lectureId = Number(editingClass.id);
        if (classData.teacherId) {
          await assignLectureTeacher(lectureId, classData.teacherId);
        }
      }

      if (lectureId && classData.cameraId) {
        await assignLectureCamera(lectureId, classData.cameraId);
      }

      await refreshClasses();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save class";
      setError(message);
    } finally {
      setLoading(false);
      setModalOpen(false);
      setEditingClass(null);
    }
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
        {error && (
          <Card className="p-4 border-red-200 bg-red-50 text-red-700">
            {error}
          </Card>
        )}
        {loading && (
          <Card className="p-4 border-blue-100 bg-blue-50 text-blue-700">
            Loading classes from the server...
          </Card>
        )}
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
                      onClick={() => handleOpenStudents(cls)}
                    >
                      <Users className="w-4 h-4 mr-1" />
                      Students
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleOpenStudents(cls)}
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
          teachers={teachers.map((t) => ({
            id: t.teacher_id || t.user_id,
            name: t.full_name || t.username,
            department: (t as any).department,
            email: t.email,
          }))}
          cameras={cameras.map((c) => ({
            id: c.camera_id,
            name: c.camera_name,
            location: c.location,
          }))}
        />
      )}

      {studentModalClass && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 bg-white relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-gray-900">{studentModalClass.name}</h3>
                <p className="text-gray-500">Manage students and attendance</p>
              </div>
              <Button
                variant="ghost"
                onClick={() => {
                  setStudentModalClass(null);
                  setStudentModalError(null);
                }}
              >
                Close
              </Button>
            </div>

            {studentModalError && (
              <Card className="p-3 mb-3 border-red-200 bg-red-50 text-red-700">{studentModalError}</Card>
            )}

            {attendanceSummary && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {["present", "absent", "late", "unknown"].map((key) => {
                  const value = (attendanceSummary as any)[key] || 0;
                  const labels: Record<string, string> = {
                    present: "Present",
                    absent: "Absent",
                    late: "Late",
                    unknown: "Unknown",
                  };
                  return (
                    <Card key={key} className="p-4 text-center">
                      <p className="text-gray-500">{labels[key]}</p>
                      <p className="text-gray-900 text-xl font-semibold">{value}</p>
                    </Card>
                  );
                })}
                <Card className="p-4 text-center">
                  <p className="text-gray-500">Total Records</p>
                  <p className="text-gray-900 text-xl font-semibold">
                    {attendanceSummary.total_records || 0}
                  </p>
                </Card>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-gray-900">Enrolled Students</h4>
                  {studentModalLoading && <span className="text-sm text-gray-500">Refreshing...</span>}
                </div>
                <Card className="divide-y">
                  {classStudents.length === 0 ? (
                    <div className="p-4 text-gray-500">No students enrolled yet.</div>
                  ) : (
                    classStudents.map((student) => (
                      <div key={student.student_id} className="p-4 flex items-center justify-between">
                        <div>
                          <p className="text-gray-900">{student.full_name || "Unnamed"}</p>
                          <p className="text-gray-500 text-sm">{student.email}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Roll: {student.roll_number || "N/A"}</p>
                          <p className="text-xs text-gray-500">Status: {student.enrollment_status || "Active"}</p>
                        </div>
                      </div>
                    ))
                  )}
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="text-gray-900">Add Student to Class</h4>
                <Select value={selectedStudentId} onValueChange={setSelectedStudentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a student" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudents.length === 0 ? (
                      <SelectItem value="" disabled>
                        No available students
                      </SelectItem>
                    ) : (
                      availableStudents.map((student) => (
                        <SelectItem key={student.user_id} value={String(student.user_id)}>
                          {student.full_name || student.email || "Student"}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddStudentToClass}
                  disabled={!selectedStudentId || studentModalLoading}
                >
                  Add Student
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}