from datetime import datetime, timezone

from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import UniqueConstraint


# SQLAlchemy instance
# The schema aligns with database/ATTENDANCE.sql for SQL Server
# (table names and column names match the script).
db = SQLAlchemy()


class Department(db.Model):
    __tablename__ = "Department"

    department_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), unique=True, nullable=False)
    code = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            "department_id": self.department_id,
            "name": self.name,
            "code": self.code,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


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
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    last_login = db.Column(db.DateTime)
    is_active = db.Column(db.Boolean, default=True)

    student = db.relationship(
        "Student",
        back_populates="user",
        uselist=False,
        foreign_keys="Student.user_id",
    )
    teacher = db.relationship(
        "Teacher",
        back_populates="user",
        uselist=False,
        foreign_keys="Teacher.user_id",
    )
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
            "student_id": self.student.student_id if self.student else None,
            "teacher_id": self.teacher.teacher_id if self.teacher else None,
        }


class Student(db.Model):
    __tablename__ = "Student"

    student_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("User.user_id"), unique=True, nullable=False)
    roll_number = db.Column(db.String(50), unique=True, nullable=False)
    department = db.Column(db.String(100))
    registration_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    registered_by = db.Column(db.Integer, db.ForeignKey("User.user_id"))
    face_embeddings = db.Column(db.Text, nullable=False)
    face_image_path = db.Column(db.String(255))
    enrollment_status = db.Column(db.String(20), default="Active")

    user = db.relationship("User", foreign_keys=[user_id], back_populates="student")
    registered_by_user = db.relationship("User", foreign_keys=[registered_by])
    enrollments = db.relationship(
        "UserLecture",
        primaryjoin="UserLecture.user_id==Student.user_id",
        foreign_keys="UserLecture.user_id",
        back_populates="student",
        viewonly=True,
    )
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
    date_joined = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

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
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    teacher = db.relationship("Teacher", back_populates="lectures")
    enrollments = db.relationship("UserLecture", back_populates="lecture")
    cameras = db.relationship("Camera", back_populates="lecture")
    sessions = db.relationship("AttendanceSession", back_populates="lecture")

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
    enrolled_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    enrollment_status = db.Column(db.String(20), default="Active")

    user = db.relationship("User", back_populates="enrollments")
    lecture = db.relationship("Lecture", back_populates="enrollments")
    student = db.relationship(
        "Student",
        primaryjoin="UserLecture.user_id==Student.user_id",
        foreign_keys=[user_id],
        back_populates="enrollments",
        viewonly=True,
    )

    def to_dict(self):
        return {
            "user_id": self.user_id,
            "lecture_id": self.lecture_id,
            "is_teacher": self.is_teacher,
            "enrolled_at": self.enrolled_at.isoformat() if self.enrolled_at else None,
            "enrollment_status": self.enrollment_status,
        }


class Camera(db.Model):
    __tablename__ = "Camera"

    camera_id = db.Column(db.Integer, primary_key=True)
    camera_name = db.Column(db.String(100), nullable=False)
    location = db.Column(db.String(150), nullable=False)
    stream_url = db.Column(db.String(255), nullable=False)
    assigned_lecture_id = db.Column(db.Integer, db.ForeignKey("Lecture.lecture_id"))
    status = db.Column(db.String(20), default="Online")
    last_checked = db.Column(db.DateTime)

    lecture = db.relationship("Lecture", back_populates="cameras")

    def to_dict(self):
        return {
            "camera_id": self.camera_id,
            "camera_name": self.camera_name,
            "location": self.location,
            "stream_url": self.stream_url,
            "assigned_lecture_id": self.assigned_lecture_id,
            "status": self.status,
            "last_checked": self.last_checked.isoformat() if self.last_checked else None,
            "lecture": self.lecture.to_dict() if self.lecture else None,
        }


class AttendanceSession(db.Model):
    __tablename__ = "Attendance_Session"

    session_id = db.Column(db.Integer, primary_key=True)
    lecture_id = db.Column(db.Integer, db.ForeignKey("Lecture.lecture_id"), nullable=False)
    camera_id = db.Column(db.Integer, db.ForeignKey("Camera.camera_id"))
    session_date = db.Column(db.Date)
    session_start_time = db.Column(db.Time)
    session_end_time = db.Column(db.Time)
    status = db.Column(db.String(20), default="Scheduled")
    attendance_locked = db.Column(db.Boolean, default=False)
    locked_by = db.Column(db.Integer, db.ForeignKey("User.user_id"))
    locked_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    completed_at = db.Column(db.DateTime)
    notes = db.Column(db.Text)

    lecture = db.relationship("Lecture", back_populates="sessions")
    camera = db.relationship("Camera")
    locked_by_user = db.relationship("User", foreign_keys=[locked_by])
    attendance_records = db.relationship("StudentAttendance", back_populates="session")

    def to_dict(self):
        return {
            "session_id": self.session_id,
            "lecture_id": self.lecture_id,
            "camera_id": self.camera_id,
            "session_date": self.session_date.isoformat() if self.session_date else None,
            "session_start_time": self.session_start_time.isoformat() if self.session_start_time else None,
            "session_end_time": self.session_end_time.isoformat() if self.session_end_time else None,
            "status": self.status,
            "attendance_locked": self.attendance_locked,
            "locked_by": self.locked_by,
            "locked_at": self.locked_at.isoformat() if self.locked_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "notes": self.notes,
        }


class StudentAttendance(db.Model):
    __tablename__ = "Student_Attendance"

    attendance_id = db.Column(db.Integer, primary_key=True)
    session_id = db.Column(db.Integer, db.ForeignKey("Attendance_Session.session_id"), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey("User.user_id"), nullable=False)
    time_in = db.Column(db.Time)
    time_out = db.Column(db.Time)
    status = db.Column(db.String(20), default="Absent")
    verification_method = db.Column(db.String(30), default="Face Recognition")
    verified_by = db.Column(db.Integer, db.ForeignKey("User.user_id"))
    confidence_score = db.Column(db.Float)
    manual_override = db.Column(db.Boolean, default=False)
    edited_by = db.Column(db.Integer, db.ForeignKey("User.user_id"))
    edited_at = db.Column(db.DateTime)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    notes = db.Column(db.Text)

    session = db.relationship("AttendanceSession", back_populates="attendance_records")
    user = db.relationship("User", foreign_keys=[user_id])
    verified_by_user = db.relationship("User", foreign_keys=[verified_by])
    edited_by_user = db.relationship("User", foreign_keys=[edited_by])

    def to_dict(self):
        return {
            "attendance_id": self.attendance_id,
            "session_id": self.session_id,
            "user_id": self.user_id,
            "time_in": self.time_in.isoformat() if self.time_in else None,
            "time_out": self.time_out.isoformat() if self.time_out else None,
            "status": self.status,
            "verification_method": self.verification_method,
            "verified_by": self.verified_by,
            "confidence_score": self.confidence_score,
            "manual_override": self.manual_override,
            "edited_by": self.edited_by,
            "edited_at": self.edited_at.isoformat() if self.edited_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "notes": self.notes,
        }


class FaceDataset(db.Model):
    __tablename__ = "Face_dataset"

    image_id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("Student.student_id"), nullable=False)
    image_path = db.Column(db.String(255), nullable=False)
    capture_device = db.Column(db.String(100))
    capture_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
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
