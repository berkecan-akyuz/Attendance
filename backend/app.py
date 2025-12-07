import os
from datetime import datetime, timezone
from typing import Tuple
from urllib.parse import quote_plus

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import case, func, or_, text
from sqlalchemy.exc import DBAPIError, OperationalError
from werkzeug.security import check_password_hash, generate_password_hash

from .models import (
    AttendanceSession,
    Camera,
    Lecture,
    Student,
    StudentAttendance,
    Teacher,
    User,
    UserLecture,
    db,
)


ALLOWED_ROLES = {"ADMIN", "TEACHER", "STUDENT"}


def build_mssql_uri() -> str:
    dsn = os.getenv("SQLSERVER_ODBC_DSN")
    if dsn:
        parts = [f"DSN={dsn}", "TrustServerCertificate=Yes"]
        user = os.getenv("SQLSERVER_USER")
        password = os.getenv("SQLSERVER_PASSWORD")
        if user:
            parts.append(f"UID={user}")
        if password:
            parts.append(f"PWD={password}")
        return f"mssql+pyodbc:///?odbc_connect={quote_plus(';'.join(parts))}"

    user = os.getenv("SQLSERVER_USER", "sa")
    password = os.getenv("SQLSERVER_PASSWORD", "YourStrong!Passw0rd")
    host = os.getenv("SQLSERVER_HOST", "localhost")
    port = os.getenv("SQLSERVER_PORT", "1433")
    database = os.getenv("SQLSERVER_DATABASE", "ATTENDANCE")
    driver = os.getenv("SQLSERVER_DRIVER", "ODBC Driver 18 for SQL Server")

    odbc_connect = os.getenv("SQLSERVER_ODBC_CONNECT")
    if odbc_connect:
        return f"mssql+pyodbc:///?odbc_connect={quote_plus(odbc_connect)}"

    return (
        f"mssql+pyodbc://{user}:{password}@{host}:{port}/{database}"
        f"?driver={driver.replace(' ', '+')}&TrustServerCertificate=yes"
    )


def create_app() -> Flask:
    app = Flask(__name__)
    database_url = os.getenv("DATABASE_URL") or build_mssql_uri()
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_pre_ping": True,
        "pool_recycle": 300,
    }

    db.init_app(app)
    CORS(app)

    register_error_handlers(app)
    register_routes(app)
    return app


def validate_role(role: str) -> Tuple[bool, str]:
    normalized = (role or "").strip().upper()
    return normalized in ALLOWED_ROLES, normalized


def error_response(message: str, status: int = 400):
    return jsonify({"error": message}), status


def register_error_handlers(app: Flask) -> None:
    @app.errorhandler(OperationalError)
    @app.errorhandler(DBAPIError)
    def handle_database_error(error):
        app.logger.error("Database error: %s", error)
        details = str(error.orig) if getattr(error, "orig", None) else str(error)
        return (
            jsonify(
                {
                    "error": "Database unavailable. Verify SQL Server host/port/credentials.",
                    "details": details,
                }
            ),
            503,
        )


def get_lecture_and_user(lecture_id: int, user_id: int) -> Tuple[Lecture, User]:
    lecture = Lecture.query.get(lecture_id)
    user = User.query.get(user_id)
    return lecture, user


def get_teacher_by_user_id(user_id: int) -> Teacher | None:
    return Teacher.query.filter_by(user_id=user_id).first()


def coerce_semester(value):
    """Normalize semester to an integer for SQL Server storage.

    Accepts integer-like strings ("1"), seasonal labels ("Fall"/"Spring"/"Summer"/"Winter"),
    or None. Returns None if the value cannot be parsed.
    """

    if value is None:
        return None

    term_map = {
        "spring": 1,
        "summer": 2,
        "fall": 3,
        "autumn": 3,
        "winter": 4,
    }

    if isinstance(value, str):
        trimmed = value.strip()
        if not trimmed:
            return None
        lowered = trimmed.lower()
        if lowered in term_map:
            return term_map[lowered]
        try:
            return int(trimmed)
        except ValueError:
            return None

    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def coerce_int(value):
    if value is None:
        return None
    if isinstance(value, str):
        stripped = value.strip()
        if not stripped:
            return None
        try:
            return int(stripped)
        except ValueError:
            return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def register_routes(app: Flask) -> None:
    @app.route("/api/health", methods=["GET"])
    def health_check():
        try:
            db.session.execute(text("SELECT 1"))
            db.session.commit()
            db_ok = True
        except Exception:
            db.session.rollback()
            db_ok = False
        return jsonify(
            {
                "status": "ok",
                "database": db_ok,
                "timestamp": datetime.now(timezone.utc).isoformat(),
            }
        )

    @app.route("/api/users", methods=["POST"])
    def create_user():
        data = request.get_json() or {}
        username = data.get("username")
        password = data.get("password")
        role_ok, role = validate_role(data.get("role"))

        if not username or not password:
            return error_response("Username and password are required")
        if not role_ok:
            return error_response("Invalid role. Use Admin, Teacher, or Student.")
        if User.query.filter_by(username=username).first():
            return error_response("Username already exists", 409)

        email = data.get("email")
        if email and User.query.filter_by(email=email).first():
            return error_response("Email already exists", 409)

        user = User(
            username=username,
            password_hash=generate_password_hash(password),
            role=role.title(),
            full_name=data.get("full_name", username),
            email=email,
            phone=data.get("phone"),
            profile_picture=data.get("profile_picture"),
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201

    @app.route("/api/login", methods=["POST"])
    def login():
        data = request.get_json() or {}
        identifier = (data.get("username") or data.get("email") or "").strip()
        password = data.get("password")
        requested_role = (data.get("role") or "").strip().lower()

        if not identifier or not password:
            return error_response("Email and password are required", 400)

        user = User.query.filter(or_(User.username.ilike(identifier), User.email.ilike(identifier))).first()

        if not user or not check_password_hash(user.password_hash, password):
            return error_response("Invalid email or password", 401)
        if requested_role and user.role.lower() != requested_role:
            return error_response("Role mismatch for this account", 403)
        if not user.is_active:
            return error_response("Account is disabled", 403)

        user.last_login = datetime.now(timezone.utc)
        db.session.commit()

        payload = user.to_dict()
        payload["role"] = user.role
        payload["last_login"] = user.last_login.isoformat() if user.last_login else None
        return jsonify(payload)

    @app.route("/api/forgot-password", methods=["POST"])
    def forgot_password():
        data = request.get_json() or {}
        email = (data.get("email") or "").strip()
        if not email:
            return error_response("Email is required")

        user = User.query.filter(func.lower(User.email) == email.lower()).first()
        if not user:
            return error_response("Account not found", 404)

        return jsonify({"message": "Password reset instructions sent", "user_id": user.user_id})

    @app.route("/api/users", methods=["GET"])
    def list_users():
        role = request.args.get("role")
        query = User.query
        if role:
            query = query.filter(User.role.ilike(role))
        users = query.order_by(User.user_id.asc()).all()
        return jsonify([user.to_dict() for user in users])

    @app.route("/api/students", methods=["POST"])
    def create_student():
        data = request.get_json() or {}
        user_id = data.get("user_id")
        roll_number = data.get("roll_number")
        face_embeddings = data.get("face_embeddings")

        if not user_id or not roll_number or face_embeddings is None:
            return error_response("user_id, roll_number, and face_embeddings are required")

        user = User.query.get(user_id)
        if not user:
            return error_response("User not found", 404)
        if user.role.lower() != "student":
            return error_response("User must have Student role")

        if Student.query.filter_by(user_id=user_id).first():
            return error_response("Student profile already exists for this user", 409)
        if Student.query.filter_by(roll_number=roll_number).first():
            return error_response("Roll number already exists", 409)

        student = Student(
            user_id=user_id,
            roll_number=roll_number,
            department=data.get("department"),
            registered_by=data.get("registered_by"),
            face_embeddings=face_embeddings,
            face_image_path=data.get("face_image_path"),
            enrollment_status=data.get("enrollment_status", "Active"),
        )
        db.session.add(student)
        db.session.commit()
        return jsonify(student.to_dict()), 201

    @app.route("/api/students", methods=["GET"])
    def list_students():
        students = Student.query.order_by(Student.student_id.asc()).all()
        return jsonify([student.to_dict() for student in students])

    @app.route("/api/students/<int:user_id>/dashboard", methods=["GET"])
    def student_dashboard(user_id: int):
        student = Student.query.filter_by(user_id=user_id).first()
        if not student:
            return error_response("Student profile not found", 404)

        enrollments = (
            db.session.query(UserLecture, Lecture)
            .join(Lecture, Lecture.lecture_id == UserLecture.lecture_id)
            .filter(UserLecture.user_id == user_id, UserLecture.is_teacher == False)
            .all()
        )

        attendance_records = (
            db.session.query(StudentAttendance, AttendanceSession, Lecture)
            .join(AttendanceSession, AttendanceSession.session_id == StudentAttendance.session_id)
            .join(Lecture, Lecture.lecture_id == AttendanceSession.lecture_id)
            .filter(StudentAttendance.user_id == user_id)
            .order_by(AttendanceSession.session_date.desc(), AttendanceSession.session_start_time.desc())
            .limit(60)
            .all()
        )

        def status_count(status: str) -> int:
            return (
                db.session.query(func.count(StudentAttendance.attendance_id))
                .join(AttendanceSession, AttendanceSession.session_id == StudentAttendance.session_id)
                .filter(StudentAttendance.user_id == user_id, StudentAttendance.status.ilike(status))
                .scalar()
                or 0
            )

        present = status_count("present")
        absent = status_count("absent")
        late = status_count("late")
        unknown = status_count("unknown")
        total_sessions = present + absent + late + unknown

        return jsonify(
            {
                "student": student.to_dict(),
                "enrollments": [
                    {
                        "lecture_id": lecture.lecture_id,
                        "lecture_name": lecture.lecture_name,
                        "course_code": lecture.course_code,
                        "department": lecture.department,
                        "schedule": lecture.schedule,
                        "room_number": lecture.room_number,
                        "semester": lecture.semester,
                        "year": lecture.year,
                    }
                    for _, lecture in enrollments
                ],
                "attendance": {
                    "present": present,
                    "absent": absent,
                    "late": late,
                    "unknown": unknown,
                    "percentage": (present / total_sessions * 100) if total_sessions else 0,
                },
                "recent_records": [
                    {
                        "attendance_id": record.attendance_id,
                        "session_id": session.session_id,
                        "lecture": lecture.lecture_name,
                        "status": record.status.lower(),
                        "session_date": session.session_date.isoformat() if session.session_date else None,
                        "time_in": record.time_in.isoformat() if record.time_in else None,
                        "verification_method": record.verification_method,
                    }
                    for record, session, lecture in attendance_records
                ],
            }
        )

    @app.route("/api/stats/overview", methods=["GET"])
    def overview_stats():
        totals = {
            "total_users": db.session.query(func.count(User.user_id)).scalar() or 0,
            "total_students": db.session.query(func.count(Student.student_id)).scalar() or 0,
            "total_teachers": db.session.query(func.count(Teacher.teacher_id)).scalar() or 0,
            "total_lectures": db.session.query(func.count(Lecture.lecture_id)).scalar() or 0,
            "total_enrollments": db.session.query(func.count(UserLecture.user_id)).scalar() or 0,
        }
        return jsonify(totals)

    @app.route("/api/lectures/summary", methods=["GET"])
    def lecture_summary():
        teacher_user_id = request.args.get("teacher_user_id", type=int)
        teacher_id = request.args.get("teacher_id", type=int)

        if teacher_user_id and not teacher_id:
            teacher = get_teacher_by_user_id(teacher_user_id)
            if not teacher:
                return error_response("Teacher profile not found", 404)
            teacher_id = teacher.teacher_id

        lecture_query = Lecture.query
        if teacher_id:
            lecture_query = lecture_query.filter(Lecture.teacher_id == teacher_id)

        enrollment_counts = {
            row.lecture_id: row.count
            for row in (
                db.session.query(
                    UserLecture.lecture_id,
                    func.count(UserLecture.user_id).label("count"),
                )
                .filter(UserLecture.is_teacher == False)
                .group_by(UserLecture.lecture_id)
                .all()
            )
        }

        camera_map = {
            camera.assigned_lecture_id: camera for camera in Camera.query.all()
        }

        lectures = lecture_query.order_by(Lecture.lecture_id.asc()).all()
        payload = []
        for lecture in lectures:
            teacher_user = lecture.teacher.user if lecture.teacher else None
            camera = camera_map.get(lecture.lecture_id)
            payload.append(
                {
                    "lecture_id": lecture.lecture_id,
                    "lecture_name": lecture.lecture_name,
                    "course_code": lecture.course_code,
                    "department": lecture.department,
                    "semester": lecture.semester,
                    "year": lecture.year,
                    "room_number": lecture.room_number,
                    "schedule": lecture.schedule,
                    "capacity": lecture.capacity,
                    "teacher": {
                        "teacher_id": lecture.teacher.teacher_id if lecture.teacher else None,
                        "full_name": teacher_user.full_name if teacher_user else None,
                        "email": teacher_user.email if teacher_user else None,
                    },
                    "enrolled": enrollment_counts.get(lecture.lecture_id, 0),
                    "camera": camera.to_dict() if camera else None,
                }
            )

        return jsonify(payload)

    @app.route("/api/stats/teacher/<int:user_id>", methods=["GET"])
    def teacher_stats(user_id: int):
        teacher = Teacher.query.filter_by(user_id=user_id).first()
        if not teacher:
            return error_response("Teacher profile not found", 404)

        class_count = (
            db.session.query(func.count(Lecture.lecture_id))
            .filter(Lecture.teacher_id == teacher.teacher_id)
            .scalar()
            or 0
        )

        student_count = (
            db.session.query(func.count(func.distinct(UserLecture.user_id)))
            .join(Lecture, UserLecture.lecture_id == Lecture.lecture_id)
            .filter(Lecture.teacher_id == teacher.teacher_id, UserLecture.is_teacher == False)
            .scalar()
            or 0
        )

        return jsonify(
            {
                "teacher_id": teacher.teacher_id,
                "classes": class_count,
                "students": student_count,
            }
        )

    @app.route("/api/reports/attendance", methods=["GET"])
    def attendance_reports():
        teacher_user_id = request.args.get("teacher_user_id", type=int)
        lecture_id = request.args.get("lecture_id", type=int)
        teacher_id = None
        if teacher_user_id:
            teacher = get_teacher_by_user_id(teacher_user_id)
            if not teacher:
                return error_response("Teacher profile not found", 404)
            teacher_id = teacher.teacher_id

        attendance_query = (
            db.session.query(StudentAttendance)
            .join(AttendanceSession, AttendanceSession.session_id == StudentAttendance.session_id)
            .join(Lecture, Lecture.lecture_id == AttendanceSession.lecture_id)
        )
        if teacher_id:
            attendance_query = attendance_query.filter(Lecture.teacher_id == teacher_id)
        if lecture_id:
            attendance_query = attendance_query.filter(AttendanceSession.lecture_id == lecture_id)

        total_records = attendance_query.count()
        present = attendance_query.filter(StudentAttendance.status.ilike("present")).count()
        absent = attendance_query.filter(StudentAttendance.status.ilike("absent")).count()
        late = attendance_query.filter(StudentAttendance.status.ilike("late")).count()
        unknown = attendance_query.filter(StudentAttendance.status.ilike("unknown")).count()

        class_breakdown = (
            db.session.query(
                Lecture.lecture_id,
                Lecture.lecture_name,
                func.count(StudentAttendance.attendance_id).label("total"),
                func.sum(case((StudentAttendance.status.ilike("present"), 1), else_=0)).label(
                    "present"
                ),
                func.sum(case((StudentAttendance.status.ilike("absent"), 1), else_=0)).label(
                    "absent"
                ),
                func.sum(case((StudentAttendance.status.ilike("late"), 1), else_=0)).label(
                    "late"
                ),
            )
            .join(AttendanceSession, AttendanceSession.lecture_id == Lecture.lecture_id)
            .join(StudentAttendance, StudentAttendance.session_id == AttendanceSession.session_id)
        )
        if teacher_id:
            class_breakdown = class_breakdown.filter(Lecture.teacher_id == teacher_id)
        if lecture_id:
            class_breakdown = class_breakdown.filter(Lecture.lecture_id == lecture_id)

        class_results = (
            class_breakdown.group_by(Lecture.lecture_id, Lecture.lecture_name)
            .order_by(func.count(StudentAttendance.attendance_id).desc())
            .all()
        )

        attendance_counts = (
            db.session.query(
                AttendanceSession.session_id.label("session_id"),
                func.sum(case((StudentAttendance.status.ilike("present"), 1), else_=0)).label(
                    "present"
                ),
                func.sum(case((StudentAttendance.status.ilike("absent"), 1), else_=0)).label(
                    "absent"
                ),
                func.sum(case((StudentAttendance.status.ilike("late"), 1), else_=0)).label(
                    "late"
                ),
            )
            .join(StudentAttendance, StudentAttendance.session_id == AttendanceSession.session_id)
            .join(Lecture, Lecture.lecture_id == AttendanceSession.lecture_id)
        )
        if teacher_id:
            attendance_counts = attendance_counts.filter(Lecture.teacher_id == teacher_id)

        attendance_counts = attendance_counts.group_by(AttendanceSession.session_id).subquery()

        recent_sessions = (
            db.session.query(
                AttendanceSession,
                Lecture.lecture_name,
                attendance_counts.c.present,
                attendance_counts.c.absent,
                attendance_counts.c.late,
            )
            .join(Lecture, Lecture.lecture_id == AttendanceSession.lecture_id)
            .join(attendance_counts, attendance_counts.c.session_id == AttendanceSession.session_id)
        )
        if teacher_id:
            recent_sessions = recent_sessions.filter(Lecture.teacher_id == teacher_id)

        recent_results = (
            recent_sessions.order_by(AttendanceSession.session_date.desc())
            .limit(10)
            .all()
        )

        return jsonify(
            {
                "average_attendance": (present / total_records * 100) if total_records else 0,
                "total_records": total_records,
                "status": {
                    "present": present,
                    "absent": absent,
                    "late": late,
                    "unknown": unknown,
                },
                "classes": [
                    {
                        "lecture_id": row.lecture_id,
                        "lecture_name": row.lecture_name,
                        "total": row.total,
                        "present": row.present or 0,
                        "absent": row.absent or 0,
                        "late": row.late or 0,
                    }
                    for row in class_results
                ],
                "recent_sessions": [
                    {
                        "session_id": session.session_id,
                        "lecture_name": lecture_name,
                        "session_date": session.session_date.isoformat()
                        if session.session_date
                        else None,
                        "present": present or 0,
                        "absent": absent or 0,
                        "late": late or 0,
                        "status": session.status,
                    }
                    for session, lecture_name, present, absent, late in recent_results
                ],
            }
        )

    @app.route("/api/teachers/<int:user_id>/students", methods=["GET"])
    def teacher_students(user_id: int):
        teacher = Teacher.query.filter_by(user_id=user_id).first()
        if not teacher:
            return error_response("Teacher profile not found", 404)

        enrollments = (
            db.session.query(Student, UserLecture, Lecture)
            .join(UserLecture, UserLecture.user_id == Student.user_id)
            .join(Lecture, Lecture.lecture_id == UserLecture.lecture_id)
            .filter(Lecture.teacher_id == teacher.teacher_id, UserLecture.is_teacher == False)
            .all()
        )

        results = []
        for student, user_lecture, lecture in enrollments:
            results.append(
                {
                    "student_id": student.student_id,
                    "roll_number": student.roll_number,
                    "full_name": student.user.full_name if student.user else "",
                    "email": student.user.email if student.user else None,
                    "lecture": lecture.lecture_name,
                    "enrollment_status": user_lecture.enrollment_status,
                }
            )

        return jsonify(results)

    @app.route("/api/teachers", methods=["POST"])
    def create_teacher():
        data = request.get_json() or {}
        user_id = data.get("user_id")

        if not user_id:
            return error_response("user_id is required")

        user = User.query.get(user_id)
        if not user:
            return error_response("User not found", 404)
        if user.role.lower() != "teacher":
            return error_response("User must have Teacher role")

        if Teacher.query.filter_by(user_id=user_id).first():
            return error_response("Teacher profile already exists for this user", 409)

        teacher = Teacher(
            user_id=user_id,
            department=data.get("department"),
            specialization=data.get("specialization"),
        )
        db.session.add(teacher)
        db.session.commit()
        return jsonify(teacher.to_dict()), 201

    @app.route("/api/teachers", methods=["GET"])
    def list_teachers():
        teachers = Teacher.query.order_by(Teacher.teacher_id.asc()).all()
        return jsonify([teacher.to_dict() for teacher in teachers])

    @app.route("/api/lectures", methods=["POST"])
    def create_lecture():
        data = request.get_json() or {}
        lecture_name = data.get("lecture_name")

        if not lecture_name:
            return error_response("lecture_name is required")

        teacher_id = coerce_int(data.get("teacher_id"))
        teacher = Teacher.query.get(teacher_id) if teacher_id else None
        lecture = Lecture(
            lecture_name=lecture_name,
            course_code=data.get("course_code"),
            department=data.get("department"),
            semester=coerce_semester(data.get("semester")),
            year=coerce_int(data.get("year")),
            schedule=data.get("schedule"),
            room_number=data.get("room_number"),
            capacity=coerce_int(data.get("capacity")),
            credits=coerce_int(data.get("credits")),
            teacher=teacher,
        )
        db.session.add(lecture)
        db.session.commit()
        return jsonify(lecture.to_dict()), 201

    @app.route("/api/lectures", methods=["GET"])
    def list_lectures():
        lectures = Lecture.query.order_by(Lecture.lecture_id.asc()).all()
        return jsonify([lecture.to_dict() for lecture in lectures])

    @app.route("/api/lectures/<int:lecture_id>", methods=["GET"])
    def get_lecture(lecture_id: int):
        lecture = Lecture.query.get(lecture_id)
        if not lecture:
            return error_response("Lecture not found", 404)

        payload = lecture.to_dict()
        payload["enrollments"] = [enrollment.to_dict() for enrollment in lecture.enrollments]
        return jsonify(payload)

    @app.route("/api/notifications", methods=["GET"])
    def list_notifications():
        notifications = []

        offline_cameras = Camera.query.filter(Camera.status.ilike("offline")).all()
        for camera in offline_cameras:
            notifications.append(
                {
                    "id": f"camera-{camera.camera_id}",
                    "type": "camera",
                    "title": "Camera offline",
                    "message": f"{camera.camera_name} at {camera.location} is offline",
                    "severity": "high",
                    "timestamp": (camera.last_checked.isoformat() if camera.last_checked else datetime.now(timezone.utc).isoformat()),
                }
            )

        unassigned = Lecture.query.filter(Lecture.teacher_id.is_(None)).count()
        if unassigned:
            notifications.append(
                {
                    "id": "lectures-unassigned",
                    "type": "lectures",
                    "title": "Unassigned classes",
                    "message": f"{unassigned} lecture(s) do not have a teacher assigned",
                    "severity": "medium",
                    "timestamp": datetime.now(timezone.utc).isoformat(),
                }
            )

        recent_sessions = (
            AttendanceSession.query.order_by(AttendanceSession.session_date.desc())
            .limit(5)
            .all()
        )
        for session in recent_sessions:
            lecture_name = session.lecture.lecture_name if session.lecture else "Lecture"
            notifications.append(
                {
                    "id": f"session-{session.session_id}",
                    "type": "session",
                    "title": f"Session {session.status}",
                    "message": f"{lecture_name} on {session.session_date} is {session.status}",
                    "severity": "info",
                    "timestamp": session.created_at.isoformat() if session.created_at else datetime.now(timezone.utc).isoformat(),
                }
            )

        return jsonify(notifications)

    @app.route("/api/lectures/<int:lecture_id>/assign-teacher", methods=["POST"])
    def assign_teacher(lecture_id: int):
        data = request.get_json() or {}
        teacher_id = coerce_int(data.get("teacher_id"))
        if not teacher_id:
            return error_response("teacher_id is required")

        lecture = Lecture.query.get(lecture_id)
        teacher = Teacher.query.get(teacher_id)
        if not lecture:
            return error_response("Lecture not found", 404)
        if not teacher:
            return error_response("Teacher not found", 404)

        lecture.teacher = teacher
        db.session.commit()
        return jsonify(lecture.to_dict())

    @app.route("/api/lectures/<int:lecture_id>/assign-camera", methods=["POST"])
    def assign_camera(lecture_id: int):
        lecture = Lecture.query.get(lecture_id)
        if not lecture:
            return error_response("Lecture not found", 404)

        data = request.get_json() or {}
        camera_id = coerce_int(data.get("camera_id"))
        if not camera_id:
            return error_response("camera_id is required")

        camera = Camera.query.get(camera_id)
        if not camera:
            return error_response("Camera not found", 404)

        camera.assigned_lecture_id = lecture_id
        db.session.commit()
        payload = lecture.to_dict()
        payload["camera"] = camera.to_dict()
        return jsonify(payload)

    @app.route("/api/lectures/<int:lecture_id>/enroll", methods=["POST"])
    def enroll_user(lecture_id: int):
        data = request.get_json() or {}
        user_id = data.get("user_id")
        is_teacher = bool(data.get("is_teacher", False))

        if not user_id:
            return error_response("user_id is required")

        lecture, user = get_lecture_and_user(lecture_id, user_id)
        if not lecture:
            return error_response("Lecture not found", 404)
        if not user:
            return error_response("User not found", 404)

        if UserLecture.query.filter_by(user_id=user_id, lecture_id=lecture_id).first():
            return error_response("User already enrolled in this lecture", 409)

        enrollment = UserLecture(
            user_id=user_id,
            lecture_id=lecture_id,
            is_teacher=is_teacher,
            enrollment_status=data.get("enrollment_status", "Active"),
        )
        db.session.add(enrollment)
        db.session.commit()
        return jsonify(enrollment.to_dict()), 201

    @app.route("/api/lectures/<int:lecture_id>/students", methods=["GET"])
    def lecture_students(lecture_id: int):
        lecture = Lecture.query.get(lecture_id)
        if not lecture:
            return error_response("Lecture not found", 404)

        enrollments = (
            db.session.query(Student, User, UserLecture)
            .join(User, User.user_id == Student.user_id)
            .join(UserLecture, UserLecture.user_id == Student.user_id)
            .filter(UserLecture.lecture_id == lecture_id, UserLecture.is_teacher == False)
            .all()
        )

        payload = []
        for student, user, enrollment in enrollments:
            payload.append(
                {
                    "student_id": student.student_id,
                    "user_id": student.user_id,
                    "roll_number": student.roll_number,
                    "full_name": user.full_name,
                    "email": user.email,
                    "enrollment_status": enrollment.enrollment_status,
                    "enrolled_at": enrollment.enrolled_at.isoformat()
                    if enrollment.enrolled_at
                    else None,
                }
            )

        return jsonify(payload)

    @app.route("/api/lectures/<int:lecture_id>/students/<int:user_id>", methods=["DELETE"])
    def remove_lecture_student(lecture_id: int, user_id: int):
        lecture = Lecture.query.get(lecture_id)
        if not lecture:
            return error_response("Lecture not found", 404)

        enrollment = UserLecture.query.filter_by(
            lecture_id=lecture_id, user_id=user_id, is_teacher=False
        ).first()

        if not enrollment:
            return error_response("Enrollment not found", 404)

        db.session.delete(enrollment)
        db.session.commit()

        return jsonify({"message": "Student removed from class"})

    @app.route("/api/lectures/<int:lecture_id>/attendance-summary", methods=["GET"])
    def lecture_attendance_summary(lecture_id: int):
        lecture = Lecture.query.get(lecture_id)
        if not lecture:
            return error_response("Lecture not found", 404)

        attendance_query = (
            db.session.query(StudentAttendance)
            .join(AttendanceSession, AttendanceSession.session_id == StudentAttendance.session_id)
            .filter(AttendanceSession.lecture_id == lecture_id)
        )

        total_records = attendance_query.count()
        present = attendance_query.filter(StudentAttendance.status.ilike("present")).count()
        absent = attendance_query.filter(StudentAttendance.status.ilike("absent")).count()
        late = attendance_query.filter(StudentAttendance.status.ilike("late")).count()
        unknown = attendance_query.filter(StudentAttendance.status.ilike("unknown")).count()

        return jsonify(
            {
                "lecture_id": lecture_id,
                "total_records": total_records,
                "present": present,
                "absent": absent,
                "late": late,
                "unknown": unknown,
            }
        )

    @app.route("/api/enrollments", methods=["GET"])
    def list_enrollments():
        enrollments = UserLecture.query.order_by(UserLecture.lecture_id.asc(), UserLecture.user_id.asc()).all()
        result = []
        for enrollment in enrollments:
            record = enrollment.to_dict()
            record["lecture"] = enrollment.lecture.to_dict() if enrollment.lecture else None
            record["user"] = enrollment.user.to_dict() if enrollment.user else None
            result.append(record)
        return jsonify(result)

    @app.route("/api/cameras", methods=["GET"])
    def list_cameras():
        cameras = Camera.query.order_by(Camera.camera_id.asc()).all()
        payload = []
        for camera in cameras:
            entry = camera.to_dict()
            if camera.lecture:
                entry["lecture_name"] = camera.lecture.lecture_name
            payload.append(entry)
        return jsonify(payload)

    @app.route("/api/cameras", methods=["POST"])
    def create_camera():
        data = request.get_json() or {}
        name = data.get("camera_name")
        location = data.get("location")
        stream_url = data.get("stream_url")

        if not name or not location or not stream_url:
            return error_response("camera_name, location, and stream_url are required")

        camera = Camera(
            camera_name=name,
            location=location,
            stream_url=stream_url,
            assigned_lecture_id=data.get("assigned_lecture_id"),
            status=data.get("status", "Online"),
        )
        db.session.add(camera)
        db.session.commit()
        payload = camera.to_dict()
        if camera.lecture:
            payload["lecture_name"] = camera.lecture.lecture_name
        return jsonify(payload), 201

    @app.route("/api/cameras/<int:camera_id>", methods=["PATCH"])
    def update_camera(camera_id: int):
        camera = Camera.query.get(camera_id)
        if not camera:
            return error_response("Camera not found", 404)

        data = request.get_json() or {}
        if "camera_name" in data:
            camera.camera_name = data.get("camera_name") or camera.camera_name
        if "location" in data:
            camera.location = data.get("location") or camera.location
        if "stream_url" in data:
            camera.stream_url = data.get("stream_url") or camera.stream_url
        if "status" in data:
            camera.status = data.get("status") or camera.status
        if "assigned_lecture_id" in data:
            camera.assigned_lecture_id = data.get("assigned_lecture_id")

        db.session.commit()
        payload = camera.to_dict()
        if camera.lecture:
            payload["lecture_name"] = camera.lecture.lecture_name
        return jsonify(payload)


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
