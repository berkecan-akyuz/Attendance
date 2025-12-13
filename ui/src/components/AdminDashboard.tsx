import { useEffect, useState } from "react";
import { DashboardNav } from "./DashboardNav";
import { DashboardStats } from "./DashboardStats";
import { QuickActions } from "./QuickActions";
import { RecentActivity } from "./RecentActivity";
import { AttendanceOverview } from "./AttendanceOverview";
import { UserManagement } from "./UserManagement";
import { ClassManagement } from "./ClassManagement";
import { fetchOverviewStats, OverviewStats } from "../lib/api";

interface AdminDashboardProps {
  onLogout: () => void;
  onNavigateToRegister: () => void;
  onNavigateToCameras: () => void;
  onNavigateToReports: () => void;
  onNavigateToSettings: () => void;
  onNavigateToLive: () => void;
  onNavigateToNotifications: () => void;
  userRole: string;
  currentActivePage?: string; // Track which top-level page is active
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  unreadCount?: number;
}

export function AdminDashboard({ 
  onLogout, 
  onNavigateToRegister, 
  onNavigateToCameras, 
  onNavigateToReports, 
  onNavigateToSettings, 
  onNavigateToLive,
  onNavigateToNotifications,
  userRole,
  currentActivePage = "Dashboard",
  activeSection,
  onSectionChange,
  unreadCount = 0,
}: AdminDashboardProps) {
  const [currentPage, setCurrentPage] = useState(activeSection || "Dashboard");
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (activeSection && activeSection !== currentPage) {
      setCurrentPage(activeSection);
    }
  }, [activeSection, currentPage]);

  useEffect(() => {
    const loadStats = async () => {
      setStatsError(null);
      try {
        const data = await fetchOverviewStats();
        setStats(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to load stats";
        setStatsError(message);
      }
    };

    loadStats();
  }, []);

  const handlePageChange = (page: string) => {
    // Handle navigation
    if (page === "Cameras") {
      onNavigateToCameras();
    } else if (page === "Reports") {
      onNavigateToReports();
    } else if (page === "Settings") {
      onNavigateToSettings();
    } else {
      setCurrentPage(page);
      onSectionChange?.(page);
    }
  };

  // Determine which nav item should be highlighted
  const getActivePage = () => {
    // If we're in a dedicated page component, use that
    if (currentActivePage !== "Dashboard") {
      return currentActivePage;
    }
    // Otherwise use internal state
    return currentPage;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <DashboardNav
        currentPage={getActivePage()}
        onPageChange={handlePageChange}
        onLogout={onLogout}
        userRole={userRole}
        onNavigateToSettings={onNavigateToSettings}
        onNavigateToNotifications={onNavigateToNotifications}
        unreadCount={unreadCount}
      />

      {/* Main Content */}
      {currentPage === "Dashboard" && (
        <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
          {/* Dashboard Stats */}
          {statsError && (
            <div className="rounded-md border border-yellow-200 bg-yellow-50 p-3 text-sm text-yellow-800">
              {statsError}
            </div>
          )}
          <DashboardStats
            onNavigateToUsers={(filter) => {
              setCurrentPage("Users");
              // Filter can be used by UserManagement component
            }}
            onNavigateToCameras={onNavigateToCameras}
            onNavigateToReports={(filter) => {
              onNavigateToReports();
              // Filter can be passed to reports page
            }}
            stats={stats}
          />

          {/* Quick Actions */}
          <QuickActions 
            onNavigateToRegister={onNavigateToRegister}
            onNavigateToCameras={onNavigateToCameras}
            onNavigateToReports={onNavigateToReports}
            onNavigateToSettings={onNavigateToSettings}
            onNavigateToLive={onNavigateToLive}
          />

          {/* Charts and Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AttendanceOverview />
            </div>
            <div className="lg:col-span-1">
              <RecentActivity 
                onViewAllActivity={() => {
                  // Navigate to activity logs or notifications
                  onNavigateToNotifications();
                }}
                onActivityClick={(activityId) => {
                  console.log("Activity clicked:", activityId);
                  // Can expand details or navigate to specific record
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* User Management Page */}
      {currentPage === "Users" && (
        <UserManagement onBack={() => setCurrentPage("Dashboard")} />
      )}

      {/* Class Management Page */}
      {currentPage === "Classes" && (
        <ClassManagement onBack={() => setCurrentPage("Dashboard")} userRole="admin" />
      )}

      {/* Other pages placeholder */}
      {currentPage !== "Dashboard" && currentPage !== "Users" && currentPage !== "Classes" && (
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <h2 className="text-gray-900 mb-2">{currentPage}</h2>
            <p className="text-gray-500">This page is under construction</p>
          </div>
        </div>
      )}
    </div>
  );
}