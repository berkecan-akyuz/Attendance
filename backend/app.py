import os
from datetime import datetime
from typing import Tuple

from flask import Flask, jsonify, request
from flask_cors import CORS
from werkzeug.security import generate_password_hash

from .models import Course, Enrollment, Student, Teacher, User, db


ALLOWED_ROLES = {"admin", "teacher", "student"}


def create_app() -> Flask:
    app = Flask(__name__)
    database_url = os.getenv("DATABASE_URL", "sqlite:///attendance.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = database_url
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)
    CORS(app)

    with app.app_context():
        db.create_all()

    register_routes(app)
    return app


def validate_role(role: str) -> bool:
    return role in ALLOWED_ROLES


def error_response(message: str, status: int = 400):
    return jsonify({"error": message}), status


def get_course_and_teacher(course_id: int, teacher_id: int) -> Tuple[Course, Teacher]:
    course = Course.query.get(course_id)
    teacher = Teacher.query.get(teacher_id)
    return course, teacher


def register_routes(app: Flask) -> None:
    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "timestamp": datetime.utcnow().isoformat()})

    @app.route("/api/users", methods=["POST"])
    def create_user():
        data = request.get_json() or {}
        username = data.get("username")
        password = data.get("password")
        role = data.get("role", "").lower()

        if not username or not password:
            return error_response("Username and password are required")

        if not validate_role(role):
            return error_response("Invalid role. Use admin, teacher, or student.")

        if User.query.filter_by(username=username).first():
            return error_response("Username already exists", 409)

        email = data.get("email")
        if email and User.query.filter_by(email=email).first():
            return error_response("Email already exists", 409)

        user = User(
            username=username,
            password_hash=generate_password_hash(password),
            role=role,
            full_name=data.get("full_name", username),
            email=email,
            phone=data.get("phone"),
        )
        db.session.add(user)
        db.session.commit()
        return jsonify(user.to_dict()), 201

    @app.route("/api/users", methods=["GET"])
    def list_users():
        role = request.args.get("role")
        query = User.query
        if role:
            query = query.filter_by(role=role.lower())
        users = query.order_by(User.id.asc()).all()
        return jsonify([user.to_dict() for user in users])

    @app.route("/api/students", methods=["POST"])
    def create_student():
        data = request.get_json() or {}
        user_id = data.get("user_id")
        roll_number = data.get("roll_number")

        if not user_id or not roll_number:
            return error_response("user_id and roll_number are required")

        user = User.query.get(user_id)
        if not user:
            return error_response("User not found", 404)
        if user.role != "student":
            return error_response("User must have student role")

        if Student.query.filter_by(user_id=user_id).first():
            return error_response("Student profile already exists for this user", 409)

        if Student.query.filter_by(roll_number=roll_number).first():
            return error_response("Roll number already exists", 409)

        student = Student(
            user_id=user_id,
            roll_number=roll_number,
            department=data.get("department"),
        )
        db.session.add(student)
        db.session.commit()
        return jsonify(student.to_dict()), 201

    @app.route("/api/students", methods=["GET"])
    def list_students():
        students = Student.query.order_by(Student.id.asc()).all()
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
        if user.role != "teacher":
            return error_response("User must have teacher role")

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
        teachers = Teacher.query.order_by(Teacher.id.asc()).all()
        return jsonify([teacher.to_dict() for teacher in teachers])

    @app.route("/api/courses", methods=["POST"])
    def create_course():
        data = request.get_json() or {}
        name = data.get("name")
        course_code = data.get("course_code")

        if not name or not course_code:
            return error_response("name and course_code are required")

        if Course.query.filter_by(course_code=course_code).first():
            return error_response("course_code already exists", 409)

        teacher_id = data.get("teacher_id")
        teacher = Teacher.query.get(teacher_id) if teacher_id else None
        course = Course(
            name=name,
            course_code=course_code,
            department=data.get("department"),
            semester=data.get("semester"),
            year=data.get("year"),
            teacher=teacher,
        )
        db.session.add(course)
        db.session.commit()
        return jsonify(course.to_dict()), 201

    @app.route("/api/courses", methods=["GET"])
    def list_courses():
        courses = Course.query.order_by(Course.id.asc()).all()
        return jsonify([course.to_dict() for course in courses])

    @app.route("/api/courses/<int:course_id>", methods=["GET"])
    def get_course(course_id: int):
        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found", 404)

        payload = course.to_dict()
        payload["enrollments"] = [enrollment.to_dict() for enrollment in course.enrollments]
        return jsonify(payload)

    @app.route("/api/courses/<int:course_id>/assign-teacher", methods=["POST"])
    def assign_teacher(course_id: int):
        data = request.get_json() or {}
        teacher_id = data.get("teacher_id")
        if not teacher_id:
            return error_response("teacher_id is required")

        course, teacher = get_course_and_teacher(course_id, teacher_id)
        if not course:
            return error_response("Course not found", 404)
        if not teacher:
            return error_response("Teacher not found", 404)

        course.teacher = teacher
        db.session.commit()
        return jsonify(course.to_dict())

    @app.route("/api/courses/<int:course_id>/enroll", methods=["POST"])
    def enroll_student(course_id: int):
        data = request.get_json() or {}
        student_id = data.get("student_id")
        user_id = data.get("user_id")

        if not student_id or not user_id:
            return error_response("student_id and user_id are required")

        course = Course.query.get(course_id)
        if not course:
            return error_response("Course not found", 404)

        student = Student.query.get(student_id)
        if not student:
            return error_response("Student not found", 404)

        if student.user_id != user_id:
            return error_response("student_id must belong to user_id")

        if Enrollment.query.filter_by(student_id=student_id, course_id=course_id).first():
            return error_response("Student already enrolled in this course", 409)

        enrollment = Enrollment(
            user_id=user_id,
            student_id=student_id,
            course_id=course_id,
            is_teacher=False,
        )
        db.session.add(enrollment)
        db.session.commit()
        return jsonify(enrollment.to_dict()), 201

    @app.route("/api/enrollments", methods=["GET"])
    def list_enrollments():
        enrollments = Enrollment.query.order_by(Enrollment.id.asc()).all()
        result = []
        for enrollment in enrollments:
            record = enrollment.to_dict()
            record["course"] = enrollment.course.to_dict() if enrollment.course else None
            record["student"] = enrollment.student.to_dict() if enrollment.student else None
            result.append(record)
        return jsonify(result)


app = create_app()


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
