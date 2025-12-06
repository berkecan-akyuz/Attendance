import { useState } from "react";
import { StudentForm } from "./StudentForm";
import { FaceCapture } from "./FaceCapture";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { ArrowLeft } from "lucide-react";
import { createStudent, createUser } from "../lib/api";

interface StudentRegistrationProps {
  onBack: () => void;
}

export function StudentRegistration({ onBack }: StudentRegistrationProps) {
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    rollNumber: "",
    classSection: "",
    department: "",
    email: "",
    phoneNumber: "",
    dateOfBirth: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        password: formData.rollNumber || "tempPass123!",
        role: "Student",
        full_name: formData.fullName,
        phone: formData.phoneNumber,
      });

      await createStudent({
        user_id: user.user_id,
        roll_number: formData.rollNumber,
        department: formData.department,
        face_embeddings: JSON.stringify(capturedImages),
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
      formData.classSection,
      formData.department,
      formData.email,
    ];
    const allFieldsFilled = requiredFields.every((field) => field.trim() !== "");
    const hasEnoughImages = capturedImages.length >= 3;
    return allFieldsFilled && hasEnoughImages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
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
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Form Fields */}
          <Card className="p-6">
            <StudentForm formData={formData} setFormData={setFormData} />
          </Card>

          {/* Right Panel - Face Capture */}
          <Card className="p-6">
            <FaceCapture
              capturedImages={capturedImages}
              onCapture={handleCaptureImage}
            />
          </Card>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-8 flex items-center justify-between bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
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