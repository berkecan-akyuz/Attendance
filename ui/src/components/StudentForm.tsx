import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import type { Department } from "../lib/api";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { format } from "date-fns";
import { cn } from "./ui/utils";
import { CalendarIcon } from "lucide-react";

interface StudentFormProps {
  formData: {
    fullName: string;
    rollNumber: string;
    department: string;
    email: string;
    phoneNumber: string;

    password: string;
  };
  departments: Department[];
  departmentsLoading?: boolean;
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function StudentForm({
  formData,
  setFormData,
  departments,
  departmentsLoading,
}: StudentFormProps) {
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-2">
      <div>
        <h2 className="text-gray-900 mb-1">Student Information</h2>
      </div>

      <div className="space-y-2">
        {/* Full Name */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            type="text"
            placeholder="Enter full name"
            value={formData.fullName}
            onChange={(e) => handleChange("fullName", e.target.value)}
            required
          />
        </div>

        {/* Roll Number */}
        <div className="space-y-2">
          <Label htmlFor="rollNumber">
            Roll Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="rollNumber"
            type="text"
            placeholder="Enter roll number"
            value={formData.rollNumber}
            onChange={(e) => handleChange("rollNumber", e.target.value)}
            required
          />
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">
            Department <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleChange("department", value)}
            disabled={departmentsLoading}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder={
                departmentsLoading
                  ? "Loading departments..."
                  : departments.length
                    ? "Select department"
                    : "No departments available"
              } />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.department_id} value={String(dept.department_id)}>
                  {dept.name}
                </SelectItem>
              ))}
              {!departments.length && (
                <SelectItem value="no-departments" disabled>
                  No departments found
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="student@example.com"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">
            Password <span className="text-red-500">*</span>
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Enter a secure password"
            value={formData.password}
            onChange={(e) => handleChange("password", e.target.value)}
            required
          />
        </div>

        {/* Phone Number */}
        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="+1 (555) 000-0000"
            value={formData.phoneNumber}
            onChange={(e) => handleChange("phoneNumber", e.target.value)}
          />
        </div>


      </div>
    </div>
  );
}
