import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Checkbox } from "./ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { X, Clock } from "lucide-react";

interface Teacher {
  id: string;
  name: string;
  photo: string;
  department: string;
}

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

interface CreateEditClassModalProps {
  classData: Class | null;
  onSave: (classData: Partial<Class>) => void;
  onClose: () => void;
}

export function CreateEditClassModal({
  classData,
  onSave,
  onClose,
}: CreateEditClassModalProps) {
  const [formData, setFormData] = useState({
    code: classData?.code || "",
    name: classData?.name || "",
    department: classData?.department || "",
    teacherId: classData?.teacher?.id || "none",
    semester: classData?.semester || "Fall",
    year: classData?.year || "2024",
    days: classData?.schedule.days || [],
    startTime: classData?.schedule.startTime || "09:00",
    endTime: classData?.schedule.endTime || "10:30",
    room: classData?.room || "",
    camera: classData?.camera || "",
    maxCapacity: classData?.enrollment.max || 30,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock teacher data
  const teachers: Teacher[] = [
    {
      id: "t1",
      name: "John Teacher",
      photo: "",
      department: "Computer Science",
    },
    {
      id: "t2",
      name: "Sarah Williams",
      photo: "",
      department: "Mathematics",
    },
    {
      id: "t3",
      name: "Lisa Anderson",
      photo: "",
      department: "English",
    },
    {
      id: "t4",
      name: "Mike Johnson",
      photo: "",
      department: "Physics",
    },
  ];

  // Mock camera data
  const cameras = Array.from({ length: 15 }, (_, i) => ({
    id: `cam${i + 1}`,
    name: `Camera ${String(i + 1).padStart(2, "0")}`,
    location: `Location ${i + 1}`,
  }));

  const departments = [
    "Computer Science",
    "Mathematics",
    "English",
    "Physics",
    "Chemistry",
    "Biology",
  ];

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleInputChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: "" });
    }
  };

  const handleDayToggle = (day: string) => {
    const newDays = formData.days.includes(day)
      ? formData.days.filter((d) => d !== day)
      : [...formData.days, day];
    handleInputChange("days", newDays);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.code.trim()) {
      newErrors.code = "Class code is required";
    }

    if (!formData.name.trim()) {
      newErrors.name = "Class name is required";
    }

    if (!formData.department) {
      newErrors.department = "Department is required";
    }

    if (formData.days.length === 0) {
      newErrors.days = "Select at least one day";
    }

    if (!formData.room.trim()) {
      newErrors.room = "Room/Location is required";
    }

    if (!formData.camera) {
      newErrors.camera = "Camera assignment is required";
    }

    if (formData.maxCapacity < 1) {
      newErrors.maxCapacity = "Capacity must be at least 1";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      const selectedTeacher = formData.teacherId !== "none"
        ? teachers.find((t) => t.id === formData.teacherId)
        : undefined;

      onSave({
        code: formData.code,
        name: formData.name,
        department: formData.department,
        teacher: selectedTeacher
          ? {
              id: selectedTeacher.id,
              name: selectedTeacher.name,
              photo: selectedTeacher.photo,
            }
          : null,
        enrollment: {
          current: classData?.enrollment.current || 0,
          max: formData.maxCapacity,
        },
        schedule: {
          days: formData.days,
          startTime: formData.startTime,
          endTime: formData.endTime,
        },
        room: formData.room,
        camera: formData.camera,
        semester: formData.semester,
        year: formData.year,
      });
    }
  };

  const selectedTeacher = formData.teacherId !== "none"
    ? teachers.find((t) => t.id === formData.teacherId)
    : undefined;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-gray-900">
            {classData ? "Edit Class" : "Create New Class"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-gray-900">Basic Information</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="code">
                  Class Code <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="code"
                  value={formData.code}
                  onChange={(e) => handleInputChange("code", e.target.value)}
                  placeholder="e.g., CS101"
                  className={errors.code ? "border-red-500" : ""}
                />
                {errors.code && <p className="text-red-500">{errors.code}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.department}
                  onValueChange={(value) => handleInputChange("department", value)}
                >
                  <SelectTrigger
                    id="department"
                    className={errors.department ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-red-500">{errors.department}</p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="name">
                  Class Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="e.g., Introduction to Programming"
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500">{errors.name}</p>}
              </div>
            </div>
          </div>

          {/* Teacher Assignment */}
          <div className="space-y-4">
            <h3 className="text-gray-900">Teacher Assignment</h3>

            <div className="space-y-2">
              <Label htmlFor="teacher">Assign Teacher</Label>
              <Select
                value={formData.teacherId}
                onValueChange={(value) => handleInputChange("teacherId", value)}
              >
                <SelectTrigger id="teacher">
                  <SelectValue placeholder="Select teacher (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No teacher assigned</SelectItem>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      <div className="flex items-center space-x-2">
                        <span>{teacher.name}</span>
                        <span className="text-gray-500">({teacher.department})</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedTeacher && (
                <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg mt-2">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={selectedTeacher.photo} alt={selectedTeacher.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {selectedTeacher.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-gray-900">{selectedTeacher.name}</p>
                    <p className="text-gray-600">{selectedTeacher.department}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Semester and Year */}
          <div className="space-y-4">
            <h3 className="text-gray-900">Academic Period</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="semester">Semester</Label>
                <Select
                  value={formData.semester}
                  onValueChange={(value) => handleInputChange("semester", value)}
                >
                  <SelectTrigger id="semester">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fall">Fall</SelectItem>
                    <SelectItem value="Spring">Spring</SelectItem>
                    <SelectItem value="Summer">Summer</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select
                  value={formData.year}
                  onValueChange={(value) => handleInputChange("year", value)}
                >
                  <SelectTrigger id="year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="text-gray-900">Schedule</h3>

            <div className="space-y-2">
              <Label>
                Days of Week <span className="text-red-500">*</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {weekDays.map((day) => (
                  <label
                    key={day}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 cursor-pointer transition-colors ${
                      formData.days.includes(day)
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <Checkbox
                      checked={formData.days.includes(day)}
                      onCheckedChange={() => handleDayToggle(day)}
                    />
                    <span className="text-gray-900">{day}</span>
                  </label>
                ))}
              </div>
              {errors.days && <p className="text-red-500">{errors.days}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => handleInputChange("startTime", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => handleInputChange("endTime", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Location and Camera */}
          <div className="space-y-4">
            <h3 className="text-gray-900">Location & Equipment</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="room">
                  Room/Location <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="room"
                  value={formData.room}
                  onChange={(e) => handleInputChange("room", e.target.value)}
                  placeholder="e.g., Room 101"
                  className={errors.room ? "border-red-500" : ""}
                />
                {errors.room && <p className="text-red-500">{errors.room}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="camera">
                  Camera Assignment <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.camera}
                  onValueChange={(value) => handleInputChange("camera", value)}
                >
                  <SelectTrigger
                    id="camera"
                    className={errors.camera ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {cameras.map((camera) => (
                      <SelectItem key={camera.id} value={camera.name}>
                        {camera.name} - {camera.location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.camera && <p className="text-red-500">{errors.camera}</p>}
              </div>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-4">
            <h3 className="text-gray-900">Class Capacity</h3>

            <div className="space-y-2">
              <Label htmlFor="maxCapacity">
                Maximum Capacity <span className="text-red-500">*</span>
              </Label>
              <Input
                id="maxCapacity"
                type="number"
                min="1"
                value={formData.maxCapacity}
                onChange={(e) =>
                  handleInputChange("maxCapacity", parseInt(e.target.value) || 0)
                }
                placeholder="e.g., 30"
                className={errors.maxCapacity ? "border-red-500" : ""}
              />
              {errors.maxCapacity && (
                <p className="text-red-500">{errors.maxCapacity}</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
            {classData ? "Save Changes" : "Create Class"}
          </Button>
        </div>
      </div>
    </div>
  );
}