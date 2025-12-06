from datetime import datetime

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint


# SQLAlchemy instance
db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "User"

    user_id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(50), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False)
    full_name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True)
    phone = db.Column(db.String(20))
    profile_picture = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    # We explicitly define foreign_keys to tell SQLAlchemy this relationship
    # uses Student.user_id, NOT Student.registered_by
    student = db.relationship(
        "Student", 
        back_populates="user", 
        uselist=False, 
        foreign_keys="Student.user_id"
    )
    
    teacher = db.relationship("Teacher", back_populates="user", uselist=False)
    enrollments = db.relationship("UserLecture", back_populates="user")

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "username": self.username,
            "role": self.role,
            "full_name": self.full_name,
            "email": self.email,
            "phone": self.phone,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Student(db.Model):
    __tablename__ = "Student"

    student_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("User.user_id"), unique=True, nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    department = db.Column(db.String(100))
    registration_date = db.Column(db.DateTime, default=datetime.utcnow)
    registered_by = db.Column(db.Integer, db.ForeignKey("User.user_id"))
    face_embeddings = db.Column(db.Text, nullable=False)
    face_image_path = db.Column(db.String(255))
    enrollment_status = db.Column(db.String(20), default="Active")

    # Explicit foreign keys to resolve ambiguity
    user = db.relationship("User", foreign_keys=[user_id], back_populates="student")
    registered_by_user = db.relationship("User", foreign_keys=[registered_by])
    
    faces = db.relationship("FaceDataset", back_populates="student")

    def to_dict(self):
        return {
            "student_id": self.student_id,
            "user_id": self.user_id,
            "roll_number": self.roll_number,
            "department": self.department,
            "registration_date": self.registration_date.isoformat()
            if self.registration_date
            else None,
            "registered_by": self.registered_by,
            "face_embeddings": self.face_embeddings,
            "face_image_path": self.face_image_path,
            "enrollment_status": self.enrollment_status,
            "user": self.user.to_dict() if self.user else None,
        }


class Teacher(db.Model):
    __tablename__ = "Teacher"

    teacher_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("User.user_id"), unique=True, nullable=False)
    department = db.Column(db.String(100))
    specialization = db.Column(db.String(200))
    date_joined = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship("User", back_populates="teacher")
    lectures = db.relationship("Lecture", back_populates="teacher")

    def to_dict(self):
        return {
            "teacher_id": self.teacher_id,
            "user_id": self.user_id,
            "department": self.department,
            "specialization": self.specialization,
            "date_joined": self.date_joined.isoformat() if self.date_joined else None,
            "user": self.user.to_dict() if self.user else None,
        }


class Lecture(db.Model):
    __tablename__ = "Lecture"

    lecture_id = db.Column(db.Integer, primary_key=True)
    lecture_name = db.Column(db.String(100), nullable=False)
    course_code = db.Column(db.String(50))
    department = db.Column(db.String(100))
    is_active = db.Column(db.Boolean, default=True)
    teacher_id = db.Column(db.Integer, db.ForeignKey("Teacher.teacher_id"))
    semester = db.Column(db.Integer)
    year = db.Column(db.Integer)
    schedule = db.Column(db.Text)
    room_number = db.Column(db.String(50))
    capacity = db.Column(db.Integer)
    credits = db.Column(db.Integer)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    teacher = db.relationship("Teacher", back_populates="lectures")
    enrollments = db.relationship("UserLecture", back_populates="lecture")

    def to_dict(self):
        return {
            "lecture_id": self.lecture_id,
            "lecture_name": self.lecture_name,
            "course_code": self.course_code,
            "department": self.department,
            "is_active": self.is_active,
            "teacher_id": self.teacher_id,
            "semester": self.semester,
            "year": self.year,
            "room_number": self.room_number,
            "capacity": self.capacity,
            "credits": self.credits,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "teacher": self.teacher.to_dict() if self.teacher else None,
        }


class UserLecture(db.Model):
    __tablename__ = "User_Lecture"
    __table_args__ = (UniqueConstraint("user_id", "lecture_id", name="pk_user_lecture"),)

    user_id = db.Column(db.Integer, db.ForeignKey("User.user_id"), primary_key=True)
    lecture_id = db.Column(db.Integer, db.ForeignKey("Lecture.lecture_id"), primary_key=True)
    is_teacher = db.Column(db.Boolean, default=False)
    enrolled_at = db.Column(db.DateTime, default=datetime.utcnow)
    enrollment_status = db.Column(db.String(20), default="Active")

    user = db.relationship("User", back_populates="enrollments")
    lecture = db.relationship("Lecture", back_populates="enrollments")

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "lecture_id": self.lecture_id,
            "is_teacher": self.is_teacher,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "enrollment_status": self.enrollment_status,
        }


class FaceDataset(db.Model):
    __tablename__ = "Face_dataset"

    image_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("Student.student_id"), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    capture_device = db.Column(db.String(100))
    capture_date = db.Column(db.DateTime, default=datetime.utcnow)
    quality_score = db.Column(db.Float)

    student = db.relationship("Student", back_populates="faces")

    def to_dict(self):
        return {
            "image_id": self.image_id,
            "student_id": self.student_id,
            "image_path": self.image_path,
            "capture_device": self.capture_device,
            "capture_date": self.capture_date.isoformat() if self.capture_date else None,
            "quality_score": self.quality_score,
        }