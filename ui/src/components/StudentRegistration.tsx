import { useEffect, useState } from "react";
import { StudentForm } from "./StudentForm";
import { FaceCapture } from "./FaceCapture";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import {
  createStudent,
  createUser,
  fetchDepartments,
  type Department,
} from "../lib/api";

interface StudentRegistrationProps {
  onBack: () => void;
  registeredBy?: number | null;
}

export function StudentRegistration({ onBack, registeredBy }: StudentRegistrationProps) {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    department: "",
    email: "",
    phoneNumber: "",

    password: "",
  });
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDepartments = async () => {
      setDepartmentsLoading(true);
      try {
        const results = await fetchDepartments();
        setDepartments(results);
        if (results.length && !formData.department) {
          setFormData((prev) => ({ ...prev, department: String(results[0].department_id) }));
        }
      } catch (err) {
        console.error("Unable to load departments", err);
      } finally {
        setDepartmentsLoading(false);
      }
    };

    loadDepartments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCaptureImage = () => {
    // Simulate capturing an image
    const newImage = `https://ui-avatars.com/api/?name=${formData.fullName || 'User'}&size=200&background=random&seed=${Date.now()}`;
    if (capturedImages.length < 5) {
      setCapturedImages([...capturedImages, newImage]);
    }
  };

  const handleRemoveImage = (index: number) => {
    setCapturedImages(capturedImages.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setError(null);
    setIsSaving(true);
    try {
      const user = await createUser({
        username: formData.email,
        email: formData.email,
        password: formData.password || formData.rollNumber || "tempPass123!",
        role: "Student",
        full_name: formData.fullName,
        phone: formData.phoneNumber,
      });

      const departmentName =
        departments.find((dept) => String(dept.department_id) === formData.department)?.name ||
        undefined;

      await createStudent({
        user_id: user.user_id,
        roll_number: formData.rollNumber,
        department_id: formData.department || undefined,
        department: departmentName,
        face_embeddings: JSON.stringify(capturedImages),
        registered_by: registeredBy || undefined,
      });

      alert("Student registered successfully!");
      onBack();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to save student";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (confirm("Are you sure you want to cancel? All data will be lost.")) {
      onBack();
    }
  };

  const isFormValid = () => {
    const requiredFields = [
      formData.fullName,
      formData.rollNumber,
      formData.department,
      formData.email,
      formData.password,
    ];
    const allFieldsFilled = requiredFields.every((field) => field.trim() !== "");
    const hasEnoughImages = capturedImages.length >= 3;
    return allFieldsFilled && hasEnoughImages && formData.password.length >= 6;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-2">
        <div className="max-w-7xl mx-auto flex items-center space-x-4">
          <Button variant="ghost" size="icon" onClick={handleCancel}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-gray-900">Register New Student</h1>
            <p className="text-gray-500">Complete the form and capture face images</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Panel - Form Fields */}
          <Card className="p-4">
            <StudentForm
              formData={formData}
              setFormData={setFormData}
              departments={departments}
              departmentsLoading={departmentsLoading}
            />
          </Card>

          {/* Right Panel - Face Capture */}
          <Card className="p-4">
            <FaceCapture
              capturedImages={capturedImages}
              onCapture={handleCaptureImage}
              onRemove={handleRemoveImage}
            />
          </Card>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-4 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
          <div className="text-gray-600">
            {capturedImages.length >= 3 ? (
              <span className="text-green-600">✓ Ready to submit</span>
            ) : (
              <span>Please capture at least 3 face images to continue</span>
            )}
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!isFormValid() || isSaving}
              className="px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {isSaving ? "Saving..." : "Save Student"}
            </Button>
          </div>
          {error && <div className="text-red-600 text-sm mt-2">{error}</div>}
        </div>
      </div>
    </div>
  );
}