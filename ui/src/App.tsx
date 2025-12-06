import { useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { AdminDashboard } from "./components/AdminDashboard";
import { StudentRegistration } from "./components/StudentRegistration";
import { TeacherAttendance } from "./components/TeacherAttendance";
import { CameraManagement } from "./components/CameraManagement";
import { ReportsAnalytics } from "./components/ReportsAnalytics";
import { StudentPortal } from "./components/StudentPortal";
import { SystemSettings } from "./components/SystemSettings";
import { LiveMonitoring } from "./components/LiveMonitoring";
import { NotificationsPanel } from "./components/NotificationsPanel";

export default function App() {
  const [currentPage, setCurrentPage] = useState<"login" | "dashboard" | "register" | "attendance" | "cameras" | "reports" | "student" | "settings" | "live" | "notifications">("login");
  const [userRole, setUserRole] = useState<string>("");

  const handleLogin = (role: string) => {
    setUserRole(role);
    // Route based on role
    if (role === "admin") {
      setCurrentPage("dashboard");
    } else if (role === "teacher") {
      setCurrentPage("attendance");
    } else if (role === "student") {
      setCurrentPage("student");
    }
  };

  const handleLogout = () => {
    setUserRole("");
    setCurrentPage("login");
  };

  const handleNavigateToRegister = () => {
    setCurrentPage("register");
  };

  const handleNavigateToCameras = () => {
    setCurrentPage("cameras");
  };

  const handleNavigateToReports = () => {
    setCurrentPage("reports");
  };

  const handleNavigateToSettings = () => {
    setCurrentPage("settings");
  };

  const handleNavigateToLive = () => {
    setCurrentPage("live");
  };

  const handleNavigateToNotifications = () => {
    setCurrentPage("notifications");
  };

  const handleBackToDashboard = () => {
    if (userRole === "admin") {
      setCurrentPage("dashboard");
    } else if (userRole === "teacher") {
      setCurrentPage("attendance");
    } else if (userRole === "student") {
      setCurrentPage("student");
    }
  };

  return (
    <>
      {currentPage === "login" && <LoginPage onLogin={handleLogin} />}
      {currentPage === "dashboard" && userRole === "admin" && (
        <AdminDashboard
          onLogout={handleLogout}
          onNavigateToRegister={handleNavigateToRegister}
          onNavigateToCameras={handleNavigateToCameras}
          onNavigateToReports={handleNavigateToReports}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToLive={handleNavigateToLive}
          onNavigateToNotifications={handleNavigateToNotifications}
          userRole={userRole}
          currentActivePage="Dashboard"
        />
      )}
      {currentPage === "register" && (
        <StudentRegistration onBack={handleBackToDashboard} />
      )}
      {currentPage === "attendance" && userRole === "teacher" && (
        <TeacherAttendance 
          onBack={handleBackToDashboard} 
          onLogout={handleLogout}
          onNavigateToReports={handleNavigateToReports}
          onNavigateToLive={handleNavigateToLive}
          onNavigateToNotifications={handleNavigateToNotifications}
        />
      )}
      {currentPage === "cameras" && userRole === "admin" && (
        <CameraManagement 
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToNotifications={handleNavigateToNotifications}
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToReports={handleNavigateToReports}
          userRole={userRole}
        />
      )}
      {currentPage === "reports" && (
        <ReportsAnalytics 
          onBack={handleBackToDashboard}
          userRole={userRole as "admin" | "teacher"}
          onLogout={handleLogout}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToNotifications={handleNavigateToNotifications}
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToCameras={handleNavigateToCameras}
        />
      )}
      {currentPage === "student" && userRole === "student" && (
        <StudentPortal 
          onLogout={handleLogout}
          onNavigateToNotifications={handleNavigateToNotifications}
        />
      )}
      {currentPage === "settings" && userRole === "admin" && (
        <SystemSettings 
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          onNavigateToNotifications={handleNavigateToNotifications}
          onNavigateToDashboard={handleBackToDashboard}
          onNavigateToReports={handleNavigateToReports}
          onNavigateToCameras={handleNavigateToCameras}
          userRole={userRole}
        />
      )}
      {currentPage === "live" && (userRole === "admin" || userRole === "teacher") && (
        <LiveMonitoring 
          onBack={handleBackToDashboard}
          userRole={userRole as "admin" | "teacher"}
        />
      )}
      {currentPage === "notifications" && (
        <NotificationsPanel
          onBack={handleBackToDashboard}
          userRole={userRole as "admin" | "teacher" | "student"}
        />
      )}
    </>
  );
}