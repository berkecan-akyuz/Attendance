import { useState } from "react";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { X, AlertCircle } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  class: string;
  status: "present" | "absent" | "late";
  timeIn: string;
  verificationMethod: "auto" | "manual";
}

interface CorrectionRequestModalProps {
  record: AttendanceRecord;
  onSubmit: (reason: string) => void;
  onClose: () => void;
}

export function CorrectionRequestModal({
  record,
  onSubmit,
  onClose,
}: CorrectionRequestModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!reason.trim()) {
      alert("Please provide a reason for the correction request");
      return;
    }
    onSubmit(reason);
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      present: "bg-green-100 text-green-700 hover:bg-green-100",
      absent: "bg-red-100 text-red-700 hover:bg-red-100",
      late: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
    };

    return (
      <Badge className={configs[status as keyof typeof configs]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-orange-600" />
            <h2 className="text-gray-900">Request Attendance Correction</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Record Details */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="text-gray-900">
                {new Date(record.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Class:</span>
              <span className="text-gray-900">{record.class}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Current Status:</span>
              {getStatusBadge(record.status)}
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Time In:</span>
              <span className="text-gray-900">{record.timeIn}</span>
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-2">
            <Label htmlFor="reason">
              Reason for Correction Request <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="reason"
              placeholder="Please explain why you believe your attendance record is incorrect. Provide as much detail as possible..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={6}
              className="resize-none"
            />
            <p className="text-gray-500">
              Your request will be reviewed by your teacher. You will be notified once a
              decision is made.
            </p>
          </div>

          {/* Info Alert */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
              <div className="text-blue-900">
                <p className="mb-1">
                  <strong>Note:</strong> Correction requests are reviewed within 48
                  hours.
                </p>
                <p className="text-blue-700">
                  Please ensure your reason is valid and accurate.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-orange-600 hover:bg-orange-700"
          >
            Submit Request
          </Button>
        </div>
      </div>
    </div>
  );
}
