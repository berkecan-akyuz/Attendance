import { useEffect, useState } from "react";
import { LoginPage } from "./components/LoginPage";
import { ForgotPassword } from "./components/ForgotPassword";
import { AdminDashboard } from "./components/AdminDashboard";
import { StudentRegistration } from "./components/StudentRegistration";
import { TeacherAttendance } from "./components/TeacherAttendance";
import { CameraManagement } from "./components/CameraManagement";
import { ReportsAnalytics } from "./components/ReportsAnalytics";
import { StudentPortal } from "./components/StudentPortal";
import { SystemSettings } from "./components/SystemSettings";
import { LiveMonitoring } from "./components/LiveMonitoring";
import { NotificationsPanel } from "./components/NotificationsPanel";
import { AuthPayload, fetchNotifications } from "./lib/api";

type AdminSection = "Dashboard" | "Users" | "Classes" | "Cameras" | "Reports" | "Settings";

export default function App() {
  const [currentPage, setCurrentPage] = useState<
    | "login"
    | "forgot"
    | "dashboard"
    | "register"
    | "attendance"
    | "cameras"
    | "reports"
    | "student"
    | "settings"
    | "live"
    | "notifications"
  >("login");
  const [userRole, setUserRole] = useState<string>("");
  const [auth, setAuth] = useState<AuthPayload | null>(null);
  const [adminSection, setAdminSection] = useState<AdminSection>("Dashboard");
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const loadNotifications = async () => {
      if (!auth) return;
      try {
        const payload = await fetchNotifications();
        const unread = payload.filter((item) => !item.read).length;
        setUnreadNotifications(unread);
      } catch (err) {
        console.warn("Unable to refresh notifications", err);
      }
    };

    loadNotifications();
  }, [auth]);

  const handleLogin = (payload: AuthPayload) => {
    const normalizedRole = payload.role?.toLowerCase() || "";
    setUserRole(normalizedRole);
    setAuth(payload);
    setAdminSection("Dashboard");
    // Route based on role
    if (normalizedRole === "admin") {
      setCurrentPage("dashboard");
    } else if (normalizedRole === "teacher") {
      setCurrentPage("attendance");
    } else if (normalizedRole === "student") {
      setCurrentPage("student");
    }
  };

  const handleLogout = () => {
    setUserRole("");
    setAuth(null);
    setCurrentPage("login");
  };

  const handleAdminSectionChange = (section: AdminSection) => {
    setAdminSection(section);
    setCurrentPage("dashboard");
  };

  const handleNavigateToForgot = () => setCurrentPage("forgot");

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
      handleAdminSectionChange("Dashboard");
    } else if (userRole === "teacher") {
      setCurrentPage("attendance");
    } else if (userRole === "student") {
      setCurrentPage("student");
    }
  };

  return (
    <>
      {currentPage === "login" && (
        <LoginPage onLogin={handleLogin} onForgotPassword={handleNavigateToForgot} />
      )}
      {currentPage === "forgot" && (
        <ForgotPassword onBack={() => setCurrentPage("login")} />
      )}
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
          currentActivePage={adminSection}
          activeSection={adminSection}
          onSectionChange={handleAdminSectionChange}
          unreadCount={unreadNotifications}
        />
      )}
      {currentPage === "register" && (
        <StudentRegistration onBack={handleBackToDashboard} registeredBy={auth?.user_id} />
      )}
      {currentPage === "attendance" && userRole === "teacher" && (
        <TeacherAttendance
          userId={auth?.user_id}
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
          onNavigateToDashboard={handleAdminSectionChange}
          onNavigateToReports={handleNavigateToReports}
          userRole={userRole}
          unreadCount={unreadNotifications}
        />
      )}
      {currentPage === "reports" && (
        <ReportsAnalytics
          onBack={handleBackToDashboard}
          userRole={userRole as "admin" | "teacher"}
          userId={auth?.user_id}
          onLogout={handleLogout}
          onNavigateToSettings={handleNavigateToSettings}
          onNavigateToNotifications={handleNavigateToNotifications}
          onNavigateToDashboard={handleAdminSectionChange}
          onNavigateToCameras={handleNavigateToCameras}
          unreadCount={unreadNotifications}
        />
      )}
      {currentPage === "student" && userRole === "student" && (
        <StudentPortal
          userId={auth?.user_id}
          onLogout={handleLogout}
          onNavigateToNotifications={handleNavigateToNotifications}
        />
      )}
      {currentPage === "settings" && userRole === "admin" && (
        <SystemSettings
          onBack={handleBackToDashboard}
          onLogout={handleLogout}
          onNavigateToNotifications={handleNavigateToNotifications}
          onNavigateToDashboard={handleAdminSectionChange}
          onNavigateToReports={handleNavigateToReports}
          onNavigateToCameras={handleNavigateToCameras}
          userRole={userRole}
          unreadCount={unreadNotifications}
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
          onUnreadChange={setUnreadNotifications}
        />
      )}
    </>
  );
}