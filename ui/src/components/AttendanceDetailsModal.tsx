import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { X, CheckCircle2, XCircle, Clock, Calendar } from "lucide-react";

interface AttendanceRecord {
  id: string;
  date: string;
  class: string;
  status: "present" | "absent" | "late";
  timeIn: string;
  verificationMethod: "auto" | "manual";
}

interface AttendanceDetailsModalProps {
  date: Date;
  attendance: AttendanceRecord;
  onClose: () => void;
}

export function AttendanceDetailsModal({
  date,
  attendance,
  onClose,
}: AttendanceDetailsModalProps) {
  const getStatusConfig = (status: string) => {
    const configs = {
      present: {
        className: "bg-green-100 text-green-700 hover:bg-green-100",
        icon: CheckCircle2,
        label: "Present",
        color: "text-green-600",
      },
      absent: {
        className: "bg-red-100 text-red-700 hover:bg-red-100",
        icon: XCircle,
        label: "Absent",
        color: "text-red-600",
      },
      late: {
        className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100",
        icon: Clock,
        label: "Late",
        color: "text-yellow-600",
      },
    };

    return configs[status as keyof typeof configs];
  };

  const statusConfig = getStatusConfig(attendance.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-gray-900">Attendance Details</h2>
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
          {/* Date Display */}
          <div className="text-center">
            <p className="text-gray-900 mb-2">
              {date.toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="text-gray-500">{attendance.class}</p>
          </div>

          {/* Status Display */}
          <div className="flex flex-col items-center space-y-4 py-6">
            <div className={`w-20 h-20 rounded-full bg-opacity-20 flex items-center justify-center ${statusConfig.className}`}>
              <StatusIcon className={`w-10 h-10 ${statusConfig.color}`} />
            </div>
            <Badge className={statusConfig.className}>
              <StatusIcon className="w-4 h-4 mr-1" />
              {statusConfig.label}
            </Badge>
          </div>

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Time In:</span>
              <span className="text-gray-900">{attendance.timeIn}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Verification:</span>
              <span className="text-gray-900 capitalize">
                {attendance.verificationMethod}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t border-gray-200 bg-gray-50">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
