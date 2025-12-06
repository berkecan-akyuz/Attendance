import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface StudentFormProps {
  formData: {
    fullName: string;
    rollNumber: string;
    classSection: string;
    department: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    password: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<any>>;
}

export function StudentForm({ formData, setFormData }: StudentFormProps) {
  const handleChange = (field: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-gray-900 mb-1">Student Information</h2>
        <p className="text-gray-500">Fill in the student's personal details</p>
      </div>

      <div className="space-y-4">
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

        {/* Class/Section */}
        <div className="space-y-2">
          <Label htmlFor="classSection">
            Class/Section <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.classSection}
            onValueChange={(value) => handleChange("classSection", value)}
          >
            <SelectTrigger id="classSection">
              <SelectValue placeholder="Select class/section" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10-A">10-A</SelectItem>
              <SelectItem value="10-B">10-B</SelectItem>
              <SelectItem value="11-A">11-A</SelectItem>
              <SelectItem value="11-B">11-B</SelectItem>
              <SelectItem value="12-A">12-A</SelectItem>
              <SelectItem value="12-B">12-B</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Department */}
        <div className="space-y-2">
          <Label htmlFor="department">
            Department <span className="text-red-500">*</span>
          </Label>
          <Select
            value={formData.department}
            onValueChange={(value) => handleChange("department", value)}
          >
            <SelectTrigger id="department">
              <SelectValue placeholder="Select department" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="science">Science</SelectItem>
              <SelectItem value="commerce">Commerce</SelectItem>
              <SelectItem value="arts">Arts</SelectItem>
              <SelectItem value="engineering">Engineering</SelectItem>
              <SelectItem value="medical">Medical</SelectItem>
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

        {/* Date of Birth */}
        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">Date of Birth</Label>
          <Input
            id="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange("dateOfBirth", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
