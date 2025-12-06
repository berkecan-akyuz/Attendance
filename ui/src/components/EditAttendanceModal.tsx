import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { X, Clock } from "lucide-react";

interface AttendanceRecord {
  id: string;
  rollNumber: string;
  studentName: string;
  photo: string;
  status: "present" | "absent" | "late";
  timeIn: string;
  verificationMethod: "auto" | "manual";
  notes?: string;
}

interface EditAttendanceModalProps {
  student: AttendanceRecord;
  onSave: (updatedStudent: AttendanceRecord) => void;
  onClose: () => void;
}

export function EditAttendanceModal({ student, onSave, onClose }: EditAttendanceModalProps) {
  const [status, setStatus] = useState(student.status);
  const [notes, setNotes] = useState(student.notes || "");

  const handleSave = () => {
    onSave({
      ...student,
      status,
      notes,
      verificationMethod: "manual",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-gray-900">Edit Attendance</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Info Header */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <Avatar className="w-16 h-16">
              <AvatarImage src={student.photo} />
              <AvatarFallback>{student.studentName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="text-gray-900">{student.studentName}</p>
              <p className="text-gray-500">{student.rollNumber}</p>
            </div>
          </div>

          {/* Timestamp */}
          <div className="flex items-center space-x-2 text-gray-600 p-3 bg-blue-50 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>Current Time In: {student.timeIn}</span>
          </div>

          {/* Status Radio Buttons */}
          <div className="space-y-3">
            <Label>Attendance Status</Label>
            <RadioGroup value={status} onValueChange={(value: any) => setStatus(value)}>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="present" id="present" />
                <Label htmlFor="present" className="cursor-pointer flex-1">
                  <span className="text-green-600">Present</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="late" id="late" />
                <Label htmlFor="late" className="cursor-pointer flex-1">
                  <span className="text-yellow-600">Late</span>
                </Label>
              </div>
              <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value="absent" id="absent" />
                <Label htmlFor="absent" className="cursor-pointer flex-1">
                  <span className="text-red-600">Absent</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any notes or remarks..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
