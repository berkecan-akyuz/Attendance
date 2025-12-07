const normalizedBase = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.replace(/\/$/, "") || "";

const withBase = (path: string) => `${normalizedBase}${path}`;

export interface AuthPayload {
  user_id: number;
  username: string;
  role: string;
  full_name?: string;
  email?: string;
  phone?: string;
  last_login?: string | null;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  role: string;
  full_name?: string;
  email?: string;
  phone?: string;
}

export interface UserResponse extends AuthPayload {
  is_active?: boolean;
}

export interface OverviewStats {
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_lectures: number;
  total_enrollments: number;
}

export interface TeacherStats {
  teacher_id: number;
  classes: number;
  students: number;
}

export interface LectureSummary {
  lecture_id: number;
  lecture_name: string;
  course_code?: string;
  department?: string;
  room_number?: string;
  schedule?: string;
  semester?: number | string;
  year?: number | string;
  capacity?: number;
  enrolled: number;
  teacher?: { teacher_id: number | null; full_name?: string | null; email?: string | null };
  camera?: CameraResponse | null;
}

export interface AttendanceReports {
  average_attendance: number;
  total_records: number;
  status: { present: number; absent: number; late: number; unknown: number };
  classes: Array<{
    lecture_id: number;
    lecture_name: string;
    total: number;
    present: number;
    absent: number;
    late: number;
  }>;
  recent_sessions: Array<{
    session_id: number;
    lecture_name: string;
    session_date: string | null;
    present: number;
    absent: number;
    late: number;
    status: string;
  }>;
}

export interface StudentDashboard {
  student: any;
  enrollments: Array<{
    lecture_id: number;
    lecture_name: string;
    course_code?: string;
    department?: string;
    schedule?: string;
    room_number?: string;
    semester?: string | number;
    year?: string | number;
  }>;
  attendance: { present: number; absent: number; late: number; unknown: number; percentage: number };
  recent_records: Array<{
    attendance_id: number;
    session_id: number;
    lecture: string;
    status: string;
    session_date: string | null;
    time_in: string | null;
    verification_method: string;
  }>;
}

export interface CameraResponse {
  camera_id: number;
  camera_name: string;
  location: string;
  stream_url: string;
  assigned_lecture_id: number | null;
  status: string;
  last_checked: string | null;
  lecture?: any;
  lecture_name?: string;
}

export interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  severity: "info" | "medium" | "high" | string;
  timestamp: string;
}

export interface LecturePayload {
  lecture_id: number;
  lecture_name: string;
  course_code?: string;
  department?: string;
  semester?: number | string;
  year?: number | string;
  teacher_id?: number | null;
  room_number?: string;
  capacity?: number;
  schedule?: string;
  camera?: CameraResponse | null;
}

export async function loginUser(email: string, password: string, role?: string): Promise<AuthPayload> {
  const response = await fetch(withBase("/api/login"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && payload.error) || "Unable to log in";
    throw new Error(message);
  }

  return payload as AuthPayload;
}

export async function fetchUsers(role?: string): Promise<UserResponse[]> {
  const query = role ? `?role=${encodeURIComponent(role)}` : "";
  const response = await fetch(withBase(`/api/users${query}`));
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load users";
    throw new Error(message);
  }
  return payload as UserResponse[];
}

export async function createUser(input: CreateUserPayload): Promise<UserResponse> {
  const response = await fetch(withBase("/api/users"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && payload.error) || "Unable to save user";
    throw new Error(message);
  }

  return payload as UserResponse;
}

export async function createStudent(input: {
  user_id: number;
  roll_number: string;
  department?: string;
  face_embeddings: string;
  face_image_path?: string;
  registered_by?: number;
}): Promise<any> {
  const response = await fetch(withBase("/api/students"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && payload.error) || "Unable to save student";
    throw new Error(message);
  }

  return payload;
}

export async function fetchStudents(): Promise<any[]> {
  const response = await fetch(withBase("/api/students"));
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load students";
    throw new Error(message);
  }
  return payload as any[];
}

export async function createTeacher(input: {
  user_id: number;
  department?: string;
  specialization?: string;
}): Promise<any> {
  const response = await fetch(withBase("/api/teachers"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && payload.error) || "Unable to save teacher";
    throw new Error(message);
  }

  return payload;
}

export async function fetchOverviewStats(): Promise<OverviewStats> {
  const response = await fetch(withBase("/api/stats/overview"));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && payload.error) || "Unable to load dashboard stats";
    throw new Error(message);
  }
  return payload as OverviewStats;
}

export async function fetchTeacherStats(userId: number): Promise<TeacherStats> {
  const response = await fetch(withBase(`/api/stats/teacher/${userId}`));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && payload.error) || "Unable to load teacher stats";
    throw new Error(message);
  }
  return payload as TeacherStats;
}

export async function fetchTeacherStudents(userId: number): Promise<
  Array<{
    student_id: number;
    roll_number: string;
    full_name: string;
    email?: string;
    lecture: string;
    enrollment_status: string;
  }>
> {
  const response = await fetch(withBase(`/api/teachers/${userId}/students`));
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load students";
    throw new Error(message);
  }
  return payload as Array<{
    student_id: number;
    roll_number: string;
    full_name: string;
    email?: string;
    lecture: string;
    enrollment_status: string;
  }>;
}

export async function fetchLectureSummaries(options?: { teacherUserId?: number }): Promise<LectureSummary[]> {
  const query = options?.teacherUserId ? `?teacher_user_id=${options.teacherUserId}` : "";
  const response = await fetch(withBase(`/api/lectures/summary${query}`));
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load classes";
    throw new Error(message);
  }
  return payload as LectureSummary[];
}

export async function fetchAttendanceReports(teacherUserId?: number): Promise<AttendanceReports> {
  const query = teacherUserId ? `?teacher_user_id=${teacherUserId}` : "";
  const response = await fetch(withBase(`/api/reports/attendance${query}`));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load reports";
    throw new Error(message);
  }
  return payload as AttendanceReports;
}

export async function fetchStudentDashboard(userId: number): Promise<StudentDashboard> {
  const response = await fetch(withBase(`/api/students/${userId}/dashboard`));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load student data";
    throw new Error(message);
  }
  return payload as StudentDashboard;
}

export async function fetchCameras(): Promise<CameraResponse[]> {
  const response = await fetch(withBase("/api/cameras"));
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load cameras";
    throw new Error(message);
  }
  return payload as CameraResponse[];
}

export async function createCamera(input: {
  camera_name: string;
  location: string;
  stream_url: string;
  status?: string;
  assigned_lecture_id?: number | null;
}): Promise<CameraResponse> {
  const response = await fetch(withBase("/api/cameras"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload && payload.error) || "Unable to create camera");
  }
  return payload as CameraResponse;
}

export async function updateCamera(cameraId: number, data: Partial<CameraResponse>): Promise<CameraResponse> {
  const response = await fetch(withBase(`/api/cameras/${cameraId}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload && payload.error) || "Unable to update camera");
  }
  return payload as CameraResponse;
}

export async function createLecture(data: Partial<LecturePayload>): Promise<LecturePayload> {
  const response = await fetch(withBase("/api/lectures"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload && payload.error) || "Unable to create class");
  }
  return payload as LecturePayload;
}

export async function assignLectureTeacher(lectureId: number, teacherId: number): Promise<LecturePayload> {
  const response = await fetch(withBase(`/api/lectures/${lectureId}/assign-teacher`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ teacher_id: teacherId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload && payload.error) || "Unable to assign teacher");
  }
  return payload as LecturePayload;
}

export async function assignLectureCamera(lectureId: number, cameraId: number): Promise<LecturePayload> {
  const response = await fetch(withBase(`/api/lectures/${lectureId}/assign-camera`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ camera_id: cameraId }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload && payload.error) || "Unable to assign camera");
  }
  return payload as LecturePayload;
}

export async function fetchLectures(): Promise<LecturePayload[]> {
  const response = await fetch(withBase("/api/lectures"));
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error((payload && (payload.error as string)) || "Unable to load lectures");
  }
  return payload as LecturePayload[];
}

export async function enrollStudentInLecture(
  lectureId: number,
  userId: number
): Promise<any> {
  const response = await fetch(withBase(`/api/lectures/${lectureId}/enroll`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, is_teacher: false }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload && payload.error) || "Unable to add student to class");
  }
  return payload;
}

export async function fetchLectureStudents(lectureId: number): Promise<any[]> {
  const response = await fetch(withBase(`/api/lectures/${lectureId}/students`));
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load class students";
    throw new Error(message);
  }
  return payload as any[];
}

export async function removeStudentFromLecture(
  lectureId: number,
  userId: number
): Promise<void> {
  const response = await fetch(withBase(`/api/lectures/${lectureId}/students/${userId}`), {
    method: "DELETE",
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    const message = (payload && (payload.error as string)) || "Unable to remove student";
    throw new Error(message);
  }
}

export async function fetchLectureAttendanceSummary(
  lectureId: number
): Promise<{
  lecture_id: number;
  total_records: number;
  present: number;
  absent: number;
  late: number;
  unknown: number;
}> {
  const response = await fetch(withBase(`/api/lectures/${lectureId}/attendance-summary`));
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = (payload && (payload.error as string)) || "Unable to load attendance summary";
    throw new Error(message);
  }
  return payload as {
    lecture_id: number;
    total_records: number;
    present: number;
    absent: number;
    late: number;
    unknown: number;
  };
}

export async function fetchNotifications(): Promise<NotificationItem[]> {
  const response = await fetch(withBase("/api/notifications"));
  const payload = await response.json().catch(() => []);
  if (!response.ok) {
    throw new Error((payload && (payload.error as string)) || "Unable to load notifications");
  }
  return payload as NotificationItem[];
}

export async function requestPasswordReset(email: string): Promise<{ message: string; user_id?: number }> {
  const response = await fetch(withBase("/api/forgot-password"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((payload && payload.error) || "Unable to submit reset request");
  }
  return payload as { message: string; user_id?: number };
}

export const API_BASE_URL = normalizedBase || "(proxy)";
