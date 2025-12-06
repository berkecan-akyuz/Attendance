from datetime import datetime
from flask_sqlalchemy import SQLAlchemy


db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True)
    phone = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    student = db.relationship("Student", back_populates="user", uselist=False)
    teacher = db.relationship("Teacher", back_populates="user", uselist=False)
    enrollments = db.relationship("Enrollment", back_populates="user")

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Student(db.Model):
    __tablename__ = "students"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    department = db.Column(db.String(100))
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="student")
    enrollments = db.relationship("Enrollment", back_populates="student")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "roll_number": self.roll_number,
            "department": self.department,
            "registration_date": self.registration_date.isoformat()
            if self.registration_date
            else None,
            "user": self.user.to_dict() if self.user else None,
        }


class Teacher(db.Model):
    __tablename__ = "teachers"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), unique=True, nullable=False)
    department = db.Column(db.String(100))
    specialization = db.Column(db.String(200))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="teacher")
    courses = db.relationship("Course", back_populates="teacher")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "department": self.department,
            "specialization": self.specialization,
            "date_joined": self.date_joined.isoformat() if self.date_joined else None,
            "user": self.user.to_dict() if self.user else None,
        }


class Course(db.Model):
    __tablename__ = "courses"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    course_code = db.Column(db.String(50), unique=True, nullable=False)
    department = db.Column(db.String(100))
    semester = db.Column(db.Integer)
    year = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    teacher_id = db.Column(db.Integer, db.ForeignKey("teachers.id"))

    teacher = db.relationship("Teacher", back_populates="courses")
    enrollments = db.relationship("Enrollment", back_populates="course")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "course_code": self.course_code,
            "department": self.department,
            "semester": self.semester,
            "year": self.year,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "teacher": self.teacher.to_dict() if self.teacher else None,
        }


class Enrollment(db.Model):
    __tablename__ = "enrollments"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    student_id = db.Column(db.Integer, db.ForeignKey("students.id"), nullable=False)
    course_id = db.Column(db.Integer, db.ForeignKey("courses.id"), nullable=False)
    is_teacher = db.Column(db.Boolean, default=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="enrollments")
    student = db.relationship("Student", back_populates="enrollments")
    course = db.relationship("Course", back_populates="enrollments")

    __table_args__ = (
        db.UniqueConstraint("student_id", "course_id", name="uq_student_course"),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "student_id": self.student_id,
            "course_id": self.course_id,
            "is_teacher": self.is_teacher,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
        }

