
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { ScrollArea } from "./ui/scroll-area";
import { Clock } from "lucide-react";

export interface EnrollmentFormProps {
    isOpen: boolean;
    onClose: () => void;
    classData: { id: string; name: string } | null;

    // State
    activeTab: "students" | "attendance";
    onTabChange: (tab: "students" | "attendance") => void;
    loading: boolean;
    error: string | null;

    // Attendance Data
    attendanceSummary: {
        present: number;
        absent: number;
        late: number;
        unknown: number;
        total_records: number;
    } | null;
    attendanceSessions: Array<{
        session_id: number;
        lecture_name: string;
        session_date: string | null;
        status: string;
        present: number;
        absent: number;
        late: number;
    }>;

    // Enrolled Students Data
    enrolledStudents: Array<{
        user_id: number;
        student_id: number;
        full_name?: string;
        email?: string;
        roll_number?: string;
        enrollment_status?: string;
    }>;
    onRemoveStudent: (userId: number) => void;

    // Add Student Data/Actions
    availableStudents: Array<{
        user_id: number;
        full_name?: string;
        email?: string;
        roll_number?: string;
    }>;
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedStudentIds: string[];
    onSelectionChange: (ids: string[]) => void;
    onAddStudents: () => void;
}

export function EnrollmentForm({
    isOpen,
    onClose,
    classData,
    activeTab,
    onTabChange,
    loading,
    error,
    attendanceSummary,
    attendanceSessions,
    enrolledStudents,
    onRemoveStudent,
    availableStudents,
    searchQuery,
    onSearchChange,
    selectedStudentIds,
    onSelectionChange,
    onAddStudents,
}: EnrollmentFormProps) {
    if (!isOpen || !classData) return null;

    const handleSelectAllVisible = () => {
        // This logic was previously in the parent, but can be derived here or passed.
        // If passed props are strictly controlled, we might need a callback, 
        // but for "Select All" it relies on filtered students.
        // Since we don't have the filtering logic here (it was memoized in parent),
        // we rely on the parent to pass the *filtered* available students?
        // Actually the parent passed 'availableStudents' and filtered them there.
        // To keep this pure, let's assume 'availableStudents' passed here ARE the filtered ones if the parent filters them.
        // OR we implement filtering here.
        // Let's implement filtering here for UI responsiveness if the parent passes ALL available.
        // But looking at previous code, parent did the filtering.
        // I'll add a onSelectAll callback to be safe/pure.
    };

    // Re-implementing derived state or assuming props are prepared?
    // The parent implementation had: `filteredAvailableStudents` memoized.
    // To keep this Dumb, we should receive `filteredStudents` or do the filtering here.
    // Doing it here is fine.

    const filteredAvailableStudents = availableStudents.filter((student) => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return true;
        const fullName = (student.full_name || "").toLowerCase();
        const email = (student.email || "").toLowerCase();
        const roll = (student.roll_number || "").toLowerCase();
        return fullName.includes(query) || email.includes(query) || roll.includes(query);
    });

    const toggleStudentSelection = (userId: number) => {
        const id = String(userId);
        const newIds = selectedStudentIds.includes(id)
            ? selectedStudentIds.filter((val) => val !== id)
            : [...selectedStudentIds, id];
        onSelectionChange(newIds);
    };

    const onSelectAllVisible = () => {
        const visibleIds = filteredAvailableStudents.map(s => String(s.user_id));
        onSelectionChange(visibleIds);
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 px-4">
            <Card className="w-full max-w-5xl max-h-[92vh] overflow-hidden bg-white relative animate-slide-up shadow-2xl">
                {/* Header */}
                <div className="bg-gradient-to-r from-slate-50 via-white to-indigo-50 p-4 text-slate-900 flex items-center justify-between shadow-sm border-b border-slate-200">
                    <div>
                        <p className="text-xs uppercase tracking-wide text-slate-500">Class tools</p>
                        <h3 className="text-xl font-semibold text-slate-900">{classData.name}</h3>
                        <p className="text-sm text-slate-600">Manage roster and attendance with live data</p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="bg-white hover:bg-slate-50"
                    >
                        Close
                    </Button>
                </div>

                <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant={activeTab === "students" ? "default" : "outline"}
                            onClick={() => onTabChange("students")}
                            className="transition-all"
                        >
                            Students
                        </Button>
                        <Button
                            variant={activeTab === "attendance" ? "default" : "outline"}
                            onClick={() => onTabChange("attendance")}
                            className="transition-all"
                        >
                            Attendance
                        </Button>
                        {loading && <span className="text-sm text-gray-500">Loading...</span>}
                    </div>

                    {error && (
                        <Card className="p-3 border-red-200 bg-red-50 text-red-700">{error}</Card>
                    )}

                    {activeTab === "attendance" && (
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {["present", "absent", "late", "unknown"].map((key) => {
                                    const value = (attendanceSummary as any)?.[key] || 0;
                                    const labels: Record<string, string> = {
                                        present: "Present",
                                        absent: "Absent",
                                        late: "Late",
                                        unknown: "Unknown",
                                    };
                                    return (
                                        <Card key={key} className="p-4 text-center floating-card animate-fade-in">
                                            <p className="text-gray-500">{labels[key]}</p>
                                            <p className="text-gray-900 text-xl font-semibold">{value}</p>
                                        </Card>
                                    );
                                })}
                                <Card className="p-4 text-center floating-card animate-fade-in">
                                    <p className="text-gray-500">Total Records</p>
                                    <p className="text-gray-900 text-xl font-semibold">
                                        {attendanceSummary?.total_records || 0}
                                    </p>
                                </Card>
                            </div>

                            <Card className="p-4 space-y-3 floating-card animate-fade-in">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-gray-900">Recent Sessions</h4>
                                    <span className="text-sm text-gray-500">
                                        {attendanceSessions.length} session{attendanceSessions.length === 1 ? "" : "s"}
                                    </span>
                                </div>
                                {attendanceSessions.length === 0 ? (
                                    <p className="text-gray-500 text-sm">No attendance sessions recorded for this class yet.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {attendanceSessions.map((session) => (
                                            <div
                                                key={session.session_id}
                                                className="flex items-center justify-between border rounded-lg p-3 transition-all hover:border-blue-200"
                                            >
                                                <div>
                                                    <p className="text-gray-900 font-medium">{session.lecture_name}</p>
                                                    <p className="text-gray-500 text-sm">
                                                        {session.session_date || "Unscheduled"}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3 text-sm text-gray-600">
                                                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />
                                                        {session.status}
                                                    </span>
                                                    <span className="text-green-600">P {session.present}</span>
                                                    <span className="text-red-600">A {session.absent}</span>
                                                    <span className="text-yellow-600">L {session.late}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {activeTab === "students" && (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 animate-fade-in">
                            <div className="lg:col-span-2 space-y-3">
                                <div className="flex items-center justify-between">
                                    <h4 className="text-gray-900">Enrolled Students</h4>
                                    {loading && <span className="text-sm text-gray-500">Refreshing...</span>}
                                </div>
                                <Card className="divide-y floating-card">
                                    {enrolledStudents.length === 0 ? (
                                        <div className="p-4 text-gray-500">No students enrolled yet.</div>
                                    ) : (
                                        enrolledStudents.map((student) => (
                                            <div
                                                key={student.student_id || student.user_id}
                                                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                                            >
                                                <div>
                                                    <p className="text-gray-900 font-medium">{student.full_name || "Unnamed"}</p>
                                                    <p className="text-gray-500 text-sm">{student.email}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <div className="text-right">
                                                        <p className="text-sm text-gray-600">Roll: {student.roll_number || "N/A"}</p>
                                                        <p className="text-xs text-gray-500">Status: {student.enrollment_status || "Active"}</p>
                                                    </div>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                                        onClick={() => onRemoveStudent(student.user_id)}
                                                        disabled={loading}
                                                    >
                                                        Remove
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </Card>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-gray-900">Add Student to Class</h4>
                                <div className="space-y-2">
                                    <Input
                                        placeholder="Search by name, email, or roll number"
                                        value={searchQuery}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                    />
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={onSelectAllVisible}
                                            disabled={filteredAvailableStudents.length === 0}
                                        >
                                            Select Visible
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => onSelectionChange([])}
                                            disabled={selectedStudentIds.length === 0}
                                        >
                                            Clear
                                        </Button>
                                        <span className="ml-auto text-xs text-gray-500">
                                            {selectedStudentIds.length} selected
                                        </span>
                                    </div>
                                </div>
                                <ScrollArea className="h-64 border rounded-lg">
                                    {filteredAvailableStudents.length === 0 ? (
                                        <div className="p-4 text-sm text-gray-500">No students match your search.</div>
                                    ) : (
                                        <div className="divide-y">
                                            {filteredAvailableStudents.map((student) => {
                                                const id = String(student.user_id);
                                                return (
                                                    <label
                                                        key={id}
                                                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer"
                                                    >
                                                        <Checkbox
                                                            checked={selectedStudentIds.includes(id)}
                                                            onCheckedChange={() => toggleStudentSelection(student.user_id)}
                                                        />
                                                        <div className="flex-1">
                                                            <p className="text-gray-900 font-medium">
                                                                {student.full_name || student.email || "Student"}
                                                            </p>
                                                            <p className="text-xs text-gray-500">
                                                                {student.roll_number ? `Roll: ${student.roll_number} · ` : ""}
                                                                {student.email}
                                                            </p>
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    )}
                                </ScrollArea>
                                <Button
                                    className="w-full bg-blue-600 hover:bg-blue-700"
                                    onClick={onAddStudents}
                                    disabled={selectedStudentIds.length === 0 || loading}
                                >
                                    Add Selected Students
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
