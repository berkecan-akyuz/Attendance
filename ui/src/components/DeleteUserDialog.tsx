import { Button } from "./ui/button";
import { AlertTriangle, X } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "teacher" | "student";
  department?: string;
  photo: string;
  status: boolean;
  lastLogin: string;
}

interface DeleteUserDialogProps {
  user: User;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteUserDialog({ user, onConfirm, onCancel }: DeleteUserDialogProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-gray-900">Delete User</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <p className="text-gray-900">
            Are you sure you want to delete <strong>{user.name}</strong>?
          </p>
          <p className="text-gray-600">
            This action cannot be undone. All user data, including attendance records and
            associated information, will be permanently removed from the system.
          </p>

          {/* User Info */}
          <div className="p-4 bg-gray-50 rounded-lg space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="text-gray-900">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Role:</span>
              <span className="text-gray-900 capitalize">{user.role}</span>
            </div>
            {user.department && (
              <div className="flex justify-between">
                <span className="text-gray-600">Department:</span>
                <span className="text-gray-900">{user.department}</span>
              </div>
            )}
          </div>

          {/* Warning */}
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="text-red-900">
                <p className="mb-1">
                  <strong>Warning:</strong> This action is permanent!
                </p>
                <p className="text-red-700">
                  Consider deactivating the user instead if you may need to restore access
                  later.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Delete User
          </Button>
        </div>
      </div>
    </div>
  );
}
