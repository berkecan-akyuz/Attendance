import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ScanFace, LogOut, User, Settings } from "lucide-react";
import { Bell } from "lucide-react";
import { Badge } from "./ui/badge";

interface DashboardNavProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
  userRole: string;
  onNavigateToSettings?: () => void;
  onNavigateToNotifications?: () => void;
  unreadCount?: number;
  onProfileClick: (tab?: "profile" | "security" | "preferences") => void;
}

export function DashboardNav({
  currentPage,
  onPageChange,
  onLogout,
  userRole,
  onNavigateToSettings,
  onNavigateToNotifications,
  unreadCount = 0,
  onProfileClick,
}: DashboardNavProps) {
  // Define navigation items based on role
  const getNavItems = () => {
    if (userRole === "admin") {
      return [
        { id: "Dashboard", label: "Dashboard" },
        { id: "Users", label: "Users" },
        { id: "Classes", label: "Classes" },
        { id: "Cameras", label: "Cameras" },
        { id: "Reports", label: "Reports" },
        { id: "Settings", label: "Settings" },
      ];
    } else if (userRole === "teacher") {
      return [
        { id: "Dashboard", label: "Dashboard" },
        { id: "Classes", label: "Classes" },
        { id: "Reports", label: "Reports" },
      ];
    } else if (userRole === "student") {
      return [
        { id: "Dashboard", label: "Dashboard" },
        { id: "Profile", label: "Profile" },
      ];
    }
    return [];
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <ScanFace className="w-6 h-6 text-white" />
              </div>
              <span className="text-gray-900">Attendance System</span>
            </div>

            {/* Navigation Items */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = currentPage === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.id === "Settings" && onNavigateToSettings) {
                        onNavigateToSettings();
                      } else {
                        onPageChange(item.id);
                      }
                    }}
                    className={`px-4 py-2 rounded-t-lg transition-all relative ${isActive
                      ? "text-blue-600"
                      : "text-gray-600 hover:bg-blue-50 hover:text-gray-900"
                      }`}
                  >
                    <span className={isActive ? "" : ""}>{item.label}</span>
                    {isActive && (
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Profile and Logout */}
          <div className="flex items-center space-x-3">
            {/* Notifications Bell */}
            {onNavigateToNotifications && (
              <button
                className="relative p-2 rounded-md hover:bg-gray-100 transition-colors"
                onClick={onNavigateToNotifications}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1 flex items-center justify-center p-0 bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </button>
            )}

            {/* Profile Dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" alt="Admin" />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {userRole === "admin" ? "AD" : userRole === "teacher" ? "TC" : "ST"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div>
                    <p>{userRole.charAt(0).toUpperCase() + userRole.slice(1)} User</p>
                    <p className="text-gray-500">{userRole}@attendance.com</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => {
                    onProfileClick("profile");
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onSelect={() => {
                    onProfileClick("security");
                  }}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Logout Button */}
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
              onClick={onLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
