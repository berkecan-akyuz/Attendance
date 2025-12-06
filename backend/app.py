import os
from datetime import datetime, timezone
from typing import Tuple
from urllib.parse import quote_plus

from flask import Flask, jsonify, request
from flask_cors import CORS
from sqlalchemy import or_, text
from sqlalchemy.exc import DBAPIError, OperationalError
from werkzeug.security import check_password_hash, generate_password_hash

from .models import Lecture, Student, Teacher, User, UserLecture, db


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

        teacher_id = data.get("teacher_id")
        teacher = Teacher.query.get(teacher_id) if teacher_id else None
        lecture = Lecture(
            lecture_name=lecture_name,
            course_code=data.get("course_code"),
            department=data.get("department"),
            semester=data.get("semester"),
            year=data.get("year"),
            schedule=data.get("schedule"),
            room_number=data.get("room_number"),
            capacity=data.get("capacity"),
            credits=data.get("credits"),
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

    @app.route("/api/lectures/<int:lecture_id>/assign-teacher", methods=["POST"])
    def assign_teacher(lecture_id: int):
        data = request.get_json() or {}
        teacher_id = data.get("teacher_id")
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


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
